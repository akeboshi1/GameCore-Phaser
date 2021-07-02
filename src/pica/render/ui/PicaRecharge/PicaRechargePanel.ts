import { op_client } from "pixelpai_proto";
import { BBCodeText, Button, ClickEvent, GameScroller, TabButton } from "apowophaserui";
import { BasePanel, CheckboxGroup, DynamicImage, GridLayoutGroup, ItemInfoTips, PropItem, SoundButton, ThreeSliceButton, UiManager, ValueContainer, AxisType, ConstraintType, AlignmentType, ButtonEventDispatcher } from "gamecoreRender";
import { ModuleName } from "structure";
import { UIAtlasName } from "../../../res";
import { Font, Handler, i18n, Tool, UIHelper, Url } from "utils";
import { PicaBasePanel } from "../pica.base.panel";
import { CommonBackground, MoneyCompent } from "../Components";
import { UITools } from "../uitool";
import { IRecharge } from "src/pica/structure/irecharge";
import { ICountablePackageItem } from "picaStructure";
import { PicaItemTipsPanel } from "../SinglePanel/PicaItemTipsPanel";
export class PicaRechargePanel extends PicaBasePanel {
    private bg: CommonBackground;
    private mBackButton: ButtonEventDispatcher;
    private mBackground: Phaser.GameObjects.Graphics;
    private topbg: Phaser.GameObjects.Image;
    private moneyCompent: MoneyCompent;
    private content: Phaser.GameObjects.Container;
    private middle: Phaser.GameObjects.Container;
    private top: Phaser.GameObjects.Container;
    private gamescroll: GameScroller;
    private bottombg: Phaser.GameObjects.Image;
    private bottom: Phaser.GameObjects.Container;
    private checkBox: CheckboxGroup;
    private banner: RechargeBanner;
    private optionType: TabButtonType;
    private curTabButton: TabButton;
    private rechargeTwoItems: TwoRechargeItem[] = [];
    private diamondDatas: any[];
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICARECHARGE_NAME;
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
        const fixedHeight = this.top.height + this.bottom.height;
        const offsetHeight = 20 * this.dpr;
        this.mBackground.clear();
        this.mBackground.fillStyle(0xFEEFDA, 1);
        this.mBackground.fillRect(0, 0, 338 * this.dpr, h - fixedHeight + offsetHeight);
        this.mBackground.y = this.top.y + this.top.height * 0.5 - offsetHeight;
        this.mBackground.x = -w * 0.5 + 12 * this.dpr;
        this.setMiddleConSize(w, h);
        if (this.gamescroll) {
            this.gamescroll.refreshMask();
            this.banner.refreshMask();
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
        this.mBackground = this.scene.make.graphics(undefined, false);
        this.top = this.scene.make.container(undefined, false);
        this.top.setSize(width, 115 * this.dpr);
        this.top.y = -height * 0.5 + this.top.height * 0.5;
        this.topbg = this.scene.make.image({ key: UIAtlasName.recharge, frame: "recharge_head" });
        this.topbg.y = this.top.height * 0.5 - this.topbg.height * 0.5;
        this.mBackButton = UITools.createBackButton(this.scene, this.dpr, this.onCloseHandler, this);
        this.mBackButton.x = -width * 0.5 + this.mBackButton.width * 0.5;
        this.mBackButton.y = this.topbg.y - this.topbg.height * 0.5 - this.mBackButton.height * 0.5 - 10 * this.dpr;
        this.moneyCompent = new MoneyCompent(this.scene, 190 * this.dpr, 28 * this.dpr, this.dpr, this.scale);
        this.moneyCompent.x = width * 0.5 - 10 * this.dpr;
        this.moneyCompent.y = this.mBackButton.y;
        this.top.add([this.topbg, this.mBackButton, this.moneyCompent]);
        this.content.add([this.mBackground, this.top]);
        this.createBottom(width, 50 * this.dpr);
        this.createMiddle(width, height);
        this.resize();
        super.init();
    }
    onShow() {
        if (this.tempDatas) this.setMoneyData(this.tempDatas.money, this.tempDatas.diamond);
        if (this.diamondDatas) this.setDataList(this.diamondDatas);
    }
    public setMoneyData(money: number, diamond: number) {
        this.tempDatas = { money, diamond };
        if (!this.mInitialized) return;
        this.moneyCompent.setMoneyData(money, diamond);
    }
    public setDataList(datas: any[]) {
        this.diamondDatas = datas;
        if (!this.mInitialized) return;
        this.setDiamonDatas(datas[this.optionType]);
    }
    protected createMiddle(width: number, height: number) {
        this.middle = this.scene.make.container(undefined, false);
        this.content.add(this.middle);
        this.banner = new RechargeBanner(this.scene, 0, 0, 338 * this.dpr, 108 * this.dpr, this.dpr, this.scale);
        this.gamescroll = this.createGameScroll(0, 0, width, height);
        this.middle.add([this.banner, this.gamescroll]);
        this.setMiddleConSize(width, height);

    }

    protected createBottom(width: number, height: number) {
        this.bottom = this.scene.make.container(undefined, false);
        this.bottom.setSize(width, height);
        this.content.add(this.bottom);
        this.bottom.y = this.scaleHeight * 0.5 - height * 0.5;
        this.bottombg = this.scene.make.image({ key: UIAtlasName.recharge, frame: "recharge_nav_bg" });
        this.bottom.add(this.bottombg);
        const tabCapW = 123 * this.dpr;
        const tabCapH = 41 * this.dpr;
        const offsetx = 36 * this.dpr;
        const topStyle = UIHelper.blueStyle(this.dpr, 15);
        this.checkBox = new CheckboxGroup();
        const topCategorys = [TabButtonType.DIAMONO, TabButtonType.GIFT];
        const topBtnTexts = [i18n.t("recharge.diamond"), i18n.t("recharge.gift")];
        let bottomPosX = -(tabCapW * topCategorys.length + offsetx * (topCategorys.length - 1)) * 0.5;
        for (let i = 0; i < topCategorys.length; i++) {
            const category = topCategorys[i];
            const button = new TabButton(this.scene, UIAtlasName.recharge, "recharge_tab_uncheck", "recharge_tab_check", topBtnTexts[i]);
            button.setTextStyle(topStyle);
            button.setData("data", category);
            button.setSize(tabCapW, tabCapH);
            button.setFontStyle("bold");
            button.y = 1 * this.dpr;
            button.x = bottomPosX + tabCapW * 0.5;
            bottomPosX += tabCapW + offsetx;
            this.checkBox.appendItem(button);
            this.bottom.add(button);
        }
        this.checkBox.on("selected", this.onTabButtonHandler, this);
        this.checkBox.selectIndex(0);
    }
    protected setMiddleConSize(width: number, height: number) {
        const fixedHeight = this.top.height + this.bottom.height + 5 * this.dpr;
        const mHeight = height - fixedHeight;
        this.middle.setSize(width, mHeight);
        this.middle.y = this.top.y + this.top.height * 0.5 + this.middle.height * 0.5 + 6 * this.dpr;
        this.banner.y = -this.middle.height * 0.5 + this.banner.height * 0.5;
        const scrollHeight = mHeight - this.banner.height - 6 * this.dpr;
        const scrolly = this.banner.y + this.banner.height * 0.5 + scrollHeight * 0.5 + 6 * this.dpr;
        this.gamescroll.resetSize(width, scrollHeight);
        this.gamescroll.y = scrolly;
    }
    protected setDiamonDatas(datas: any[]) {
        for (const item of this.rechargeTwoItems) {
            item.visible = false;
        }
        const leng = Math.ceil(datas.length / 2);
        for (let i = 0; i < leng; i++) {
            let item: TwoRechargeItem;
            if (i < this.rechargeTwoItems.length) {
                item = this.rechargeTwoItems[i];
            } else {
                item = new TwoRechargeItem(this.scene, this.width, 110 * this.dpr, this.dpr, this.scale);
                item.setHandler(new Handler(this, this.onRechargeHandler));
                this.gamescroll.addItem(item);
                this.rechargeTwoItems.push(item);
            }
            const indexed = i * 2;
            const temps = [datas[i * 2]];
            if (indexed + 1 < datas.length) temps.push(datas[indexed + 1]);
            item.setTwoData(temps, this.optionType);
            item.visible = true;
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

    private buy(productId, price: number) {
        if (this.render.isCordove()) {
            if ((window as any).IAP) {
                (window as any).IAP.buy(productId, () => {
                    const noticedata = {
                        text: [{ text: `购买成功，等待发货！`, node: undefined }]
                    };
                    this.render.mainPeer.showMediator(ModuleName.PICANOTICE_NAME, true, noticedata);
                });
            }
        } else {
            this.render.renderEmitter(ModuleName.PICARECHARGE_NAME + "_questbuy", { str: productId, count: price });
        }
    }

    private onTabButtonHandler(button: TabButton) {
        if (this.curTabButton) {
            this.curTabButton.setTextColor("#2B4BB5");
        }
        this.optionType = button.getData("data");
        button.setTextColor("#8B5603");
        this.curTabButton = button;
        if (this.diamondDatas) this.setDiamonDatas(this.diamondDatas[this.optionType]);
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
            this.buy(data.id, data.price);
        }
    }
}

class RechargeItem extends Phaser.GameObjects.Container {
    public rechargeData: IRecharge;
    private key: string;
    private dpr: number;
    private bg: Phaser.GameObjects.Image;
    private imgicon: DynamicImage;
    private title: BBCodeText;
    private tipsCon: Phaser.GameObjects.Container;
    private tipsbg: Phaser.GameObjects.Image;
    private tipstext: Phaser.GameObjects.Text;
    private purchaseBtn: ThreeSliceButton;
    private sendHandler: Handler;
    private giftbags: RewardItem[] = [];
    private zoom: number;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
        super(scene);
        this.key = UIAtlasName.recharge;
        this.dpr = dpr;
        this.zoom = zoom;
        const width = 149 * dpr, height = 108 * dpr;
        this.setSize(width, height);
        this.bg = this.scene.make.image({ key: this.key, frame: "recharge_diamond_bg" });
        this.title = new BBCodeText(this.scene, 0, 0, "", {
            color: "#ffffff",
            fontSize: 14 * dpr,
            fontFamily: Font.DEFULT_FONT,
            stroke: "#521BDB",  // null, css string, or number
            strokeThickness: 2 * dpr,
        }).setOrigin(0.5);
        this.title.x = 0;
        this.title.y = -height * 0.5 + 10 * dpr;
        this.imgicon = new DynamicImage(scene, 0, 0);
        this.imgicon.x = -this.width * 0.5 + 41 * dpr;
        this.imgicon.y = 7 * dpr;
        this.tipsCon = this.scene.make.container(undefined, false);
        this.tipsCon.x = this.width * 0.5 - 33 * dpr;
        this.tipsCon.y = -this.height * 0.5 + 35 * dpr;
        this.tipsbg = this.scene.make.image({ key: this.key, frame: "recharge_first_purchase" });
        this.tipsbg.x = 0;
        this.tipsbg.y = 0;
        this.tipstext = this.scene.make.text({ text: i18n.t("recharge.firstcharge"), style: UIHelper.whiteStyle(dpr, 11) });
        this.tipstext.setFontStyle("bold");
        this.tipstext.setOrigin(0.5);
        this.tipstext.x = 0;
        this.tipstext.y = - 5 * dpr;
        this.tipsCon.add([this.tipsbg, this.tipstext]);
        this.purchaseBtn = new ThreeSliceButton(scene, 63 * dpr, 22 * dpr, UIAtlasName.uicommon, UIHelper.threeYellowSmall, UIHelper.threeYellowSmall, "￥1.99");
        this.purchaseBtn.setTextStyle(UIHelper.brownishStyle(dpr));
        this.purchaseBtn.setFontStyle("bold");
        this.purchaseBtn.x = this.width * 0.5 - this.purchaseBtn.width * 0.5 - 10 * dpr;
        this.purchaseBtn.y = this.height * 0.5 - this.purchaseBtn.height * 0.5 - 6 * dpr;
        this.purchaseBtn.on(String(ClickEvent.Tap), this.onSendHandler, this);
        this.add([this.bg, this.title, this.imgicon, this.tipsCon, this.purchaseBtn]);
    }

    public setHandler(send: Handler) {
        this.sendHandler = send;
    }
    public setRechargeData(data: IRecharge) {
        this.rechargeData = data;
        const reward = data.items[0];
        this.title.text = `[b][stroke=#521BDB][color=#FFE400]${reward.count}[/color] ${i18n.t("coin.diamond")}[/stroke][/b]`;
        if (data.double) {
            this.tipsCon.visible = true;
            this.setPropItems(data.firstPurchaseItems);
        } else {
            this.tipsCon.visible = false;
            for (const item of this.giftbags) {
                item.visible = false;
            }
        }
        const url = Url.getOsdRes(data.texturePath + `_${this.dpr}x.png`);
        this.imgicon.load(url);
        this.purchaseBtn.setText(`￥${data.price}`);
    }

    protected setPropItems(datas: ICountablePackageItem[]) {
        for (const item of this.giftbags) {
            item.visible = false;
        }
        const cellWidth = 28 * this.dpr, len = datas.length, space = 2 * this.dpr;
        let posx = this.width * 0.5 - 40 * this.dpr - ((cellWidth + space) * (len - 1)) * 0.5;
        for (let i = 0; i < len; i++) {
            let item: RewardItem;
            const tempdata = datas[i];
            if (i < this.giftbags.length) {
                item = this.giftbags[i];
            } else {
                item = new RewardItem(this.scene, cellWidth, cellWidth, this.dpr, this.zoom);
                item.on(ClickEvent.Tap, this.onItemHandler, this);
                this.giftbags.push(item);
                this.add(item);
            }
            item.setItemData(tempdata);
            item.visible = true;
            item.x = posx;
            item.y = 3 * this.dpr;
            posx += item.width + space;
        }
    }
    private onSendHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["buy", this]);
    }

    private onItemHandler(pointer, obj: RewardItem) {
        PicaItemTipsPanel.Inst.showTips(obj, obj.itemData);
    }
}
class RechargeGiftItem extends Phaser.GameObjects.Container {
    public rechargeData: IRecharge;
    private dpr: number;
    private bg: DynamicImage;
    private purchaseBtn: ThreeSliceButton;
    private sendHandler: Handler;
    private zoom: number;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        const width = 149 * dpr, height = 108 * dpr;
        this.setSize(width, height);
        this.bg = new DynamicImage(scene, 0, 0, UIAtlasName.recharge, "recharge_diamond_bg");
        this.purchaseBtn = new ThreeSliceButton(scene, 63 * dpr, 22 * dpr, UIAtlasName.uicommon, UIHelper.threeYellowSmall, UIHelper.threeYellowSmall, "￥1.99");
        this.purchaseBtn.setTextStyle(UIHelper.brownishStyle(dpr));
        this.purchaseBtn.setFontStyle("bold");
        this.purchaseBtn.x = this.width * 0.5 - this.purchaseBtn.width * 0.5 - 10 * dpr;
        this.purchaseBtn.y = this.height * 0.5 - this.purchaseBtn.height * 0.5 - 9 * dpr;
        this.purchaseBtn.on(String(ClickEvent.Tap), this.onSendHandler, this);
        this.add([this.bg, this.purchaseBtn]);
    }

    public setHandler(send: Handler) {
        this.sendHandler = send;
    }
    public setRechargeData(data: IRecharge) {
        this.rechargeData = data;
        if (data.type === 2 || data.type === 3) {
            this.purchaseBtn.x = this.width * 0.5 - this.purchaseBtn.width * 0.5 - 10 * this.dpr;
            this.purchaseBtn.y = this.height * 0.5 - this.purchaseBtn.height * 0.5 - 9 * this.dpr;
        } else {
            this.purchaseBtn.x = 0;
            this.purchaseBtn.y = this.height * 0.5 - this.purchaseBtn.height * 0.5 + 2 * this.dpr;
        }
        this.purchaseBtn.setText(`￥${data.price}`);
        const url = Url.getOsdRes(data.texturePath + `_${this.dpr}x.png`);
        this.bg.load(url);
    }
    private onSendHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["buy", this]);
    }
}

class TwoRechargeItem extends Phaser.GameObjects.Container {
    private dpr: number;
    private zoom: number;
    private sendHandler: Handler;
    private bottombg: Phaser.GameObjects.Image;
    private itemMap: Map<TabButtonType, any[]> = new Map();
    private optionType: TabButtonType;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.bottombg = this.scene.make.image({ key: UIAtlasName.recharge, frame: "recharge_division" });
        this.setSize(width, height);
        this.add(this.bottombg);
        this.bottombg.y = this.height * 0.5 + this.bottombg.height * 0.5;
    }

    public setHandler(send: Handler) {
        this.sendHandler = send;
    }

    public setTwoData(datas: any[], optionType: TabButtonType) {
        this.optionType = optionType;
        let items: any[];
        this.itemMap.forEach((values) => {
            for (const item of values) {
                item.visible = false;
            }
        });
        if (this.itemMap.has(optionType)) {
            items = this.itemMap.get(optionType);
        } else {
            items = [];
            this.itemMap.set(optionType, items);
        }

        for (let i = 0; i < datas.length; i++) {
            let item: any;
            if (i < items.length) {
                item = items[i];
            } else {
                if (optionType === TabButtonType.DIAMONO)
                    item = new RechargeItem(this.scene, this.dpr, this.zoom);
                else item = new RechargeGiftItem(this.scene, this.dpr, this.zoom);
                item.setHandler(this.sendHandler);
                this.add(item);
                items.push(item);
            }
            item.setRechargeData(datas[i]);
            item.x = -item.width * 0.5 - 5 * this.dpr + i * (item.width + 10 * this.dpr);
            item.visible = true;
        }
    }
    public checkExtendRect(pointer) {
        const list = this.itemMap.get(this.optionType);
        for (const obj of list) {
            if (Tool.checkPointerContains(obj, pointer)) {
                // (<IllustratedItem>obj).showTips();
                if (this.sendHandler) this.sendHandler.runWith(["pointer", (obj)]);
            }
        }
    }
}

class RechargeBanner extends Phaser.GameObjects.Container {
    private gameScroll: GameScroller;
    private line: Phaser.GameObjects.Image;
    private mTween: Phaser.Tweens.Tween;
    private zoom: number;
    private dpr: number;
    private banners: BannerItem[] = [];
    private mBound: number[];
    private cellWidth: number;
    private cellHeight: number;
    private cellspace: number;
    private cellPading: { left: number, right: number };
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number) {
        super(scene, x, y);
        this.setSize(width, height);
        this.zoom = zoom;
        this.dpr = dpr;
        this.cellWidth = 308 * dpr;
        this.cellHeight = 96 * dpr;
        this.cellspace = 20 * dpr;
        this.cellPading = { left: 15 * dpr, right: 15 * dpr };
        this.gameScroll = this.createGameScroll(0, 0, width, this.cellHeight);
        this.gameScroll.y = -height * 0.5 + this.cellHeight * 0.5 + 3 * dpr;
        this.line = this.scene.make.image({ key: UIAtlasName.recharge, frame: "recharge_division" });
        this.line.y = height * 0.5 - this.line.height * 0.5;
        this.add([this.gameScroll, this.line]);
        this.setBannerData(undefined);
    }

    public refreshMask() {
        this.gameScroll.refreshMask();
    }
    public setBannerData(datas: any[]) {
        for (const temp of this.banners) {
            temp.visible = false;
        }
        for (let i = 0; i < 6; i++) {
            let item: BannerItem;
            if (i < this.banners.length) {
                item = this.banners[i];
            } else {
                item = new BannerItem(this.scene, this.cellWidth, this.cellHeight, this.dpr, this.zoom);
                this.banners.push(item);
                this.gameScroll.addItem(item);
            }
            item.visible = true;
        }
        this.gameScroll.Sort();
        this.mBound = this.gameScroll.bounds;
    }

    protected createGameScroll(x: number, y: number, width: number, height: number) {
        const gamescroll = new GameScroller(this.scene, {
            x,
            y,
            width,
            height,
            zoom: this.zoom,
            align: 2,
            orientation: 1,
            dpr: this.dpr,
            space: this.cellspace,
            selfevent: true,
            padding: this.cellPading,
            slidingDeceleration: false,
            backDeceleration: false,
            cellupCallBack: (gameobject) => {
                this.onPointerClickHandler(gameobject);
            },
            celldownCallBack: () => {

            }
        });
        // gamescroll.on("pointerup", this.onPointerUpHandler, this);
        gamescroll.on("pointerout", this.onPointerUpHandler, this);
        return gamescroll;
    }

    protected onPointerUpHandler(pointer: Phaser.Input.Pointer) {
        const value = this.gameScroll.getValue();
        const left = this.mBound[0];
        const right = this.mBound[1];
        const tempWidth = this.cellWidth + this.cellspace;
        const velocity = pointer.velocity;
        const index = Math.floor((value - left) / tempWidth);
        const remainder = (value - left) % tempWidth;
        let vsValue = velocity.x > 0 ? 0.2 : 0.8;
        if (Math.abs(velocity.x) > 50) {
            if (vsValue === 0.2) vsValue = 0.01;
            else vsValue = 0.99;
        }
        if (remainder < tempWidth * vsValue) {
            const to = index * tempWidth + left;
            this.tween(value, to);
        } else {
            const to = (index + 1) * tempWidth + left;
            this.tween(value, to);
        }
    }
    protected onPointerDownHandler(pointer: Phaser.Input.Pointer) {
        this.clearTween();
    }

    protected onPointerClickHandler(obj) {

    }
    protected tween(from: number, to: number) {
        this.clearTween();
        this.mTween = this.scene.tweens.addCounter({
            duration: 300,
            from,
            to,
            ease: "Linear",
            onComplete: () => {
                this.tweenComplete();
            },
            onUpdate: (cope: any, param: any) => {
                this.gameScroll.setValue(param.value);
            },
        });
    }

    protected tweenComplete() {
        this.clearTween();
    }
    protected clearTween() {
        if (this.mTween) {
            this.mTween.stop();
            this.mTween.remove();
            this.mTween = undefined;
        }
    }
}

class ItemBase extends ButtonEventDispatcher {
    public itemData: any;
    protected img: DynamicImage;
    constructor(scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene, 0, 0);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
        this.img = new DynamicImage(scene, 0, 0, UIAtlasName.recharge, "recharge_diamond_bg");
        this.add(this.img);
    }

    public setItemData(data: any) {
        this.itemData = data;
    }
}
class BannerItem extends ItemBase {
    constructor(scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene, width, height, dpr, zoom);
        this.img.setFrame("recharge_banner");
    }
}

class RewardItem extends ItemBase {
    protected bg: Phaser.GameObjects.Image;
    protected countTex: Phaser.GameObjects.Text;
    constructor(scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene, width, height, dpr, zoom);
        this.bg = this.scene.make.image({ key: UIAtlasName.recharge, frame: "recharge_diamond_gift" });
        this.countTex = this.scene.make.text({ style: UIHelper.brownishStyle(dpr, 10) }).setFontStyle("bold").setOrigin(0.5);
        this.countTex.x = 0;
        this.countTex.y = height * 0.5 + 2 * dpr;
        this.countTex.visible = false;
        this.addAt(this.bg, 0);
        this.add(this.countTex);
        this.enable = true;
        this.img.visible = false;
    }

    setItemData(data: any) {
        super.setItemData(data);
        const url = Url.getOsdRes(data.texturePath);
        const zoom = this.getWorldTransformMatrix().scaleX;
        this.img.load(url, this, () => {
            this.img.scale = 1;
            const scaleX = 13 * this.dpr / this.img.displayWidth;
            this.img.scale = scaleX;
            this.img.visible = true;
        });
        this.countTex.text = `x${data.count}`;
    }
}

enum TabButtonType {
    DIAMONO,
    GIFT
}
