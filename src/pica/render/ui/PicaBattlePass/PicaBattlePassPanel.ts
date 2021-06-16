import { op_client } from "pixelpai_proto";
import { BBCodeText, Button, ClickEvent, GameScroller, NineSliceButton, TabButton } from "apowophaserui";
import { BasePanel, CheckboxGroup, DynamicImage, GridLayoutGroup, ItemInfoTips, PropItem, SoundButton, ThreeSliceButton, UiManager, ValueContainer, AxisType, ConstraintType, AlignmentType, ButtonEventDispatcher, ProgressMaskBar } from "gamecoreRender";
import { ModuleName } from "structure";
import { UIAtlasName } from "../../../res";
import { Font, Handler, i18n, Tool, UIHelper, Url } from "utils";
import { PicaBasePanel } from "../pica.base.panel";
import { CommonBackground, ItemButton, MoneyCompent } from "../Components";
import { UITools } from "../uitool";
import { IRecharge } from "src/pica/structure/irecharge";
import { ICountablePackageItem } from "picaStructure";
import { PicaItemTipsPanel } from "../SinglePanel/PicaItemTipsPanel";
export class PicaBattlePassPanel extends PicaBasePanel {
    private bg: CommonBackground;
    private mBackButton: ButtonEventDispatcher;
    private content: Phaser.GameObjects.Container;
    private middle: Phaser.GameObjects.Container;
    private top: Phaser.GameObjects.Container;
    private horProgress: ProgressMaskBar;
    private progressTex: Phaser.GameObjects.Text;
    private levelButton: Button;
    private finalItem: FinalRewardItem;
    private gamescroll: GameScroller;
    private bottom: Phaser.GameObjects.Container;
    private curPassItem: BattlePassItem;
    private buyTicketBtn: NineSliceButton;
    private oneKeyBtn: NineSliceButton;
    private battleItems: any[];
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICABATTLEPASS_NAME;
        this.loadAtlas = [UIAtlasName.uicommon, UIAtlasName.recharge];
    }
    resize(width?: number, height?: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        super.resize(w, h);
        this.setSize(w, h);
        this.bg.x = w * 0.5;
        this.bg.y = h * 0.5;

        this.content.setSize(w, h);
        this.content.x = w * 0.5;
        this.content.y = h * 0.5;
        this.top.y = -h * 0.5 + this.top.height * 0.5;
        this.bottom.y = h * 0.5 - this.bottom.height * 0.5;
        this.setMiddleConSize(w, h);
        if (this.gamescroll) {
            this.gamescroll.refreshMask();
        }
    }

    init() {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.bg = new CommonBackground(this.scene, 0, 0, width, height);
        this.bg.setInteractive();
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(width, height);
        this.add([this.bg, this.content]);
        this.top = this.scene.make.container(undefined, false);
        this.top.setSize(width, 115 * this.dpr);
        this.top.y = -height * 0.5 + this.top.height * 0.5;

        this.mBackButton = UITools.createBackButton(this.scene, this.dpr, this.onCloseHandler, this);
        this.mBackButton.x = -width * 0.5 + this.mBackButton.width * 0.5;
        this.mBackButton.y = this.top.y - this.top.height * 0.5 - this.mBackButton.height * 0.5 - 10 * this.dpr;
        const titleTex = this.scene.make.text({ text: i18n.t("battlepass.title"), style: UIHelper.colorStyle("#ffffff", 20 * this.dpr) });
        titleTex.setFontStyle("bold");
        titleTex.y = this.mBackButton.y;
        this.horProgress = new ProgressMaskBar(this.scene, UIAtlasName.illustrate_new, "illustrate_survey_lv_bottom", "illustrate_survey_lv_top", UIHelper.whiteStyle(this.dpr, 6));
        this.horProgress.y = titleTex.y + titleTex.height * 0.5 + 50 * this.dpr;
        this.horProgress.x = 15 * this.dpr;
        this.progressTex = this.scene.make.text({ style: UIHelper.whiteStyle(this.dpr) }).setOrigin(0.5);
        this.progressTex.setFontStyle("bold");
        this.progressTex.x = this.horProgress.x;
        this.progressTex.y = this.horProgress.y + 6 * this.dpr;
        this.levelButton = new Button(this.scene, UIAtlasName.illustrate_new, "battlepass_lv_icon", "battlepass_lv_icon", "1", undefined, this.dpr, this.scale);
        this.levelButton.setFontStyle("bold");
        this.levelButton.setTextStyle(UIHelper.whiteStyle(this.dpr, 15));
        this.levelButton.x = this.horProgress.x - this.horProgress.width * 0.5 - this.levelButton.width * 0.5 - 8 * this.dpr;
        this.levelButton.y = this.horProgress.y;
        this.finalItem = new FinalRewardItem(this.scene, 44 * this.dpr, 44 * this.dpr, this.dpr);
        this.finalItem.x = this.horProgress.x + this.horProgress.width * 0.5 + this.finalItem.width * 0.5 + 12 * this.dpr;
        this.finalItem.y = this.horProgress.y;
        this.top.add([this.mBackButton, titleTex, this.horProgress, this.levelButton, this.progressTex, this.finalItem]);
        this.content.add(this.top);
        this.createBottom(width, 50 * this.dpr);
        this.createMiddle(width, height);
        this.resize();
        super.init();
    }
    onShow() {
    }

    public setDataList(datas: any[]) {
        if (!this.mInitialized) return;
    }
    protected createMiddle(width: number, height: number) {
        this.middle = this.scene.make.container(undefined, false);
        this.content.add(this.middle);
        this.gamescroll = this.createGameScroll(0, 0, width, height);
        this.middle.add([this.gamescroll]);
        this.setMiddleConSize(width, height);

    }

    protected createBottom(width: number, height: number) {
        this.bottom = this.scene.make.container(undefined, false);
        this.bottom.setSize(width, height);
        this.content.add(this.bottom);
        this.bottom.y = this.scaleHeight * 0.5 - height * 0.5;
        this.buyTicketBtn = this.createNineButton(-80 * this.dpr, 0, 117 * this.dpr, 40 * this.dpr, UIAtlasName.uicommon, i18n.t("battlepass.tickettips"), "red_btn_normal", "#ffffff");
        this.oneKeyBtn = this.createNineButton(80 * this.dpr, 0, 117 * this.dpr, 40 * this.dpr, UIAtlasName.uicommon, i18n.t("mail.onekey"), "yellow_btn", "#996600");
        this.add([this.buyTicketBtn, this.oneKeyBtn]);
    }

    protected setMiddleConSize(width: number, height: number) {
        const fixedHeight = this.top.height + this.bottom.height + 5 * this.dpr;
        const mHeight = height - fixedHeight;
        this.middle.setSize(width, mHeight);
        this.middle.y = this.top.y + this.top.height * 0.5 + this.middle.height * 0.5 + 6 * this.dpr;
        const scrollHeight = mHeight - 6 * this.dpr;
        const scrolly = this.top.y + this.top.height * 0.5 + scrollHeight * 0.5 + 6 * this.dpr;
        this.gamescroll.resetSize(width, scrollHeight);
        this.gamescroll.y = scrolly;
    }
    protected setPassDatas(datas: any[]) {
        for (const item of this.battleItems) {
            item.visible = false;
        }
        const leng = Math.ceil(datas.length / 2);
        for (let i = 0; i < leng; i++) {
            // let item: TwoRechargeItem;
            // if (i < this.battleItems.length) {
            //     item = this.battleItems[i];
            // } else {
            //     item = new TwoRechargeItem(this.scene, this.width, 110 * this.dpr, this.dpr, this.scale);
            //     item.setHandler(new Handler(this, this.onRechargeHandler));
            //     this.gamescroll.addItem(item);
            //     this.battleItems.push(item);
            // }
            // const indexed = i * 2;
            // const temps = [datas[i * 2]];
            // if (indexed + 1 < datas.length) temps.push(datas[indexed + 1]);
            // item.setTwoData(temps, this.optionType);
            // item.visible = true;
        }
        this.gamescroll.Sort();
    }
    private createGameScroll(x: number, y: number, width: number, height: number) {
        const gamescroll = new GameScroller(this.scene, {
            x,
            y,
            width,
            height,
            zoom: this.scale,
            align: 2,
            orientation: 0,
            dpr: this.dpr,
            space: 20 * this.dpr,
            selfevent: true,
            padding: { top: 10 * this.dpr, bottom: 10 * this.dpr },
            cellupCallBack: (gameobject) => {
                this.onPointerUpHandler(gameobject);
            }
        });
        return gamescroll;
    }
    private createNineButton(x: number, y: number, width: number, height: number, key: string, frame: string, text?: string, color?: string) {
        const btn = new NineSliceButton(this.scene, x, y, width, height, key, frame, text, this.dpr, 1, {
            left: 14 * this.dpr,
            top: 14 * this.dpr,
            right: 15 * this.dpr,
            bottom: 14 * this.dpr
        });
        if (text) {
            btn.setTextStyle({
                color,
                fontSize: 16 * this.dpr,
                fontFamily: Font.DEFULT_FONT
            });
            btn.setFontStyle("bold");
        }
        return btn;
    }
    private buy(productId, productName, price: number) {
        if (this.render.isCordove()) {
            if ((window as any).IAP) {
                (window as any).IAP.buy(productId, () => {
                    const noticedata = {
                        text: [{ text: `购买${productName}成功，等待发货！`, node: undefined }]
                    };
                    this.render.mainPeer.showMediator(ModuleName.PICANOTICE_NAME, true, noticedata);
                });
            }
        } else {
            this.render.renderEmitter(ModuleName.PICARECHARGE_NAME + "_questbuy", { str: productId, count: price });
        }
    }

    private onCloseHandler() {
        this.render.renderEmitter(ModuleName.PICARECHARGE_NAME + "_hide");
    }

    private onPointerUpHandler(gameobject: any) {
        const pointer = this.scene.input.activePointer;
        gameobject.checkExtendRect(pointer);
    }
    private onRechargeHandler(tag: string, obj: any) {
        const data: any = obj.rechargeData;
        if (tag === "pointer") {
            PicaItemTipsPanel.Inst.showTips(obj, data);
        } else if (tag === "buy") {
            this.buy(data.id, data.nameId, data.price);
        }
    }
}

class BattleRewardsItem extends Phaser.GameObjects.Container {
    public itemData: ICountablePackageItem;
    protected itemBtn: ItemButton;
    protected stateImg: Phaser.GameObjects.Image;
    private dpr: number;
    private zoom: number;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        const width = 67 * dpr, height = 67 * dpr;
        this.setSize(width, height);
        this.itemBtn = new ItemButton(scene, undefined, undefined, dpr, zoom, false);
        this.stateImg = this.scene.make.image({ key: UIAtlasName.battlepass, frame: "battlepass_received" });
        this.stateImg.visible = false;
        this.add([this.itemBtn, this.stateImg]);
    }
    public setItemData(data: ICountablePackageItem, state: RewardState) {
        this.itemData = data;
        this.itemBtn.setItemData(data);
        if (state === RewardState.RECEIVED) {
            this.stateImg.setFrame("battlepass_received");
            this.stateImg.visible = true;
        } else if (state === RewardState.LOCK) {
            this.stateImg.setFrame("battlepass_lock");
            this.stateImg.visible = true;
        } else {
            this.stateImg.visible = false;
        }
    }

    public showTips() {
        PicaItemTipsPanel.Inst.showTips(this, this.itemData);
    }
}

class BattlePassItem extends Phaser.GameObjects.Container {
    public passData: any;
    private bg: Phaser.GameObjects.Image;
    private serialTex: Phaser.GameObjects.Text;
    private coverBg: Phaser.GameObjects.Image;
    private unlockBtn: ThreeSliceButton;
    private dpr: number;
    private zoom: number;
    private sendHandler: Handler;
    private rewardItems: BattleRewardsItem[] = [];
    private canReceive: boolean = false;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.bg = this.scene.make.image({ key: UIAtlasName.battlepass, frame: "battlepass_reward_completed" });
        this.setSize(this.bg.width, this.bg.height);
        this.add(this.bg);
        this.createFourItems();
    }

    public setHandler(send: Handler) {
        this.sendHandler = send;
    }

    public setPassData(passData: any) {
        const rewards = passData.rewards;
        if (passData.canUnlock) {
            this.setActiveCovers(true);
        } else {
            this.setActiveCovers(false);
        }
    }
    public checkExtendRect(pointer) {
        for (const obj of this.rewardItems) {
            if (Tool.checkPointerContains(obj, pointer)) {
                obj.showTips();
            }
        }
    }

    private setActiveCovers(visible) {
        if (visible) {
            this.createCovers();
            this.coverBg.visible = true;
            this.unlockBtn.visible = true;
        } else {
            if (this.coverBg) this.coverBg.visible = false;
            if (this.unlockBtn) this.unlockBtn.visible = false;
        }
    }
    private createCovers() {
        if (!this.coverBg) {
            this.coverBg = this.scene.make.image({ key: UIAtlasName.battlepass, frame: "battlepass_reward_locked_mask" });
            this.add(this.coverBg);
        }
        if (!this.unlockBtn) {
            this.unlockBtn = new ThreeSliceButton(this.scene, 93 * this.dpr, 30 * this.dpr, UIAtlasName.uicommon, UIHelper.threeYellowSmall, UIHelper.threeYellowSmall, i18n.t("battlepass.nowunlock"));
            this.add(this.unlockBtn);
        }
    }

    private createFourItems() {
        let posx = -this.width * 0.5 + 65 * this.dpr;
        const cellWidth = 67 * this.dpr, spacebig = 15 * this.dpr, space = 6 * this.dpr;
        for (let i = 0; i < 4; i++) {
            const item = new BattleRewardsItem(this.scene, this.dpr, this.zoom);
            this.add(item);
            item.x = posx;
            posx += cellWidth + (i === 0 ? spacebig : space);
        }
    }
}

class FinalRewardItem extends ButtonEventDispatcher {
    public itemData: ICountablePackageItem;
    private icon: DynamicImage;
    private countBg: Phaser.GameObjects.Image;
    private countTex: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number) {
        super(scene, dpr);
        this.setSize(width, height);
        this.icon = new DynamicImage(scene, 0, 0);
        this.countBg = this.scene.make.image({ key: UIAtlasName.battlepass, frame: "battlepass_lv_reward_bg" });
        this.countBg.y = this.height * 0.5 - this.countBg.height * 0.5;
        this.countTex = this.scene.make.text({ style: UIHelper.whiteStyle(dpr, 11) }).setOrigin(0.5).setFontStyle("bold");
        this.countTex.y = this.countBg.y;
        this.add([this.icon, this.countBg, this.countTex]);
    }
}

enum RewardState {
    RECEIVED = 1,
    UNLOCK = 2,
    LOCK = 3
}
