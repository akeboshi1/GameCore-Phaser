import { Button, ClickEvent, GameScroller, NineSliceButton } from "apowophaserui";
import { UIAtlasName } from "../../../res";
import { PicaBasePanel } from "../pica.base.panel";
import { CommonBackground, ItemButton } from "../Components";
import { UITools } from "../uitool";
import { PicaItemTipsPanel } from "../SinglePanel/PicaItemTipsPanel";
import { PicaRenderUiManager } from "../pica.Renderuimanager";
import { ModuleName, TimerCountDown } from "structure";
import { ButtonEventDispatcher, DynamicImage, ProgressMaskBar, ThreeSliceButton } from "gamecoreRender";
import { Font, Handler, i18n, Tool, UIHelper, Url } from "utils";
import { IBattlePass, IBattlePassLevel, IBattlePassState, ICountablePackageItem } from "picaStructure";
import { PicaBattleUnlockPanel } from "./PicaBattleUnlockPanel";
import { PicaUltimateRewardPanel } from "./PicaUltimateRewardPanel";

export class PicaBattlePassPanel extends PicaBasePanel {
    private bg: CommonBackground;
    private mBackButton: ButtonEventDispatcher;
    private content: Phaser.GameObjects.Container;
    private middle: Phaser.GameObjects.Container;
    private top: Phaser.GameObjects.Container;
    private horProgress: ProgressMaskBar;
    private progressTex: Phaser.GameObjects.Text;
    private battlePassEndTime: Phaser.GameObjects.Text;
    private battleCountDown: TimerCountDown;
    private levelButton: Button;
    private finalItem: FinalRewardItem;
    private leftLabel: LabelCompent;
    private rightLabel: LabelCompent;
    private gamescroll: GameScroller;
    private bottom: Phaser.GameObjects.Container;
    private curPassItem: BattlePassItem;
    private buyTicketBtn: NineSliceButton;
    private oneKeyBtn: NineSliceButton;
    private battleItems: any[] = [];
    private battleData: IBattlePass;
    private battleLevels: IBattlePassLevel[];
    private battleState: IBattlePassState;
    private tempBattleItem: BattlePassItem;
    private unlockPanel: PicaBattleUnlockPanel;
    private ultimatePanel: PicaUltimateRewardPanel;
    private lastLevel: IBattlePassLevel;
    constructor(uiManager: PicaRenderUiManager) {
        super(uiManager);
        this.key = ModuleName.PICABATTLEPASS_NAME;
        this.loadAtlas = [UIAtlasName.uicommon, UIAtlasName.battlepass];
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
        this.bottom.y = h * 0.5 - this.bottom.height * 0.5 - 5 * this.dpr;
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
        this.top.setSize(width, 60 * this.dpr);
        this.top.y = -height * 0.5 + this.top.height * 0.5;

        this.mBackButton = UITools.createBackButton(this.scene, this.dpr, this.onCloseHandler, this);
        this.mBackButton.x = -width * 0.5 + this.mBackButton.width * 0.5;
        this.mBackButton.y = this.top.height * 0.5 - this.mBackButton.height * 0.5 - 10 * this.dpr;
        const titleTex = this.scene.make.text({ text: i18n.t("battlepass.title"), style: UIHelper.colorStyle("#ffffff", 20 * this.dpr) }).setOrigin(0.5);
        titleTex.setFontStyle("bold");
        titleTex.y = this.mBackButton.y;
        this.horProgress = new ProgressMaskBar(this.scene, UIAtlasName.battlepass, "battlepass_lv_schedule_bottom", "battlepass_lv_schedule_top", UIHelper.whiteStyle(this.dpr, 6));
        this.horProgress.y = titleTex.y + titleTex.height * 0.5 + 28 * this.dpr;
        this.horProgress.x = -10 * this.dpr;
        this.progressTex = this.scene.make.text({ style: UIHelper.whiteStyle(this.dpr) }).setOrigin(0.5);
        this.progressTex.setFontStyle("bold");
        this.progressTex.x = this.horProgress.x;
        this.progressTex.y = this.horProgress.y + 6 * this.dpr;
        this.battlePassEndTime = this.scene.make.text({ style: UIHelper.colorStyle("#FFF000", 10 * this.dpr) }).setOrigin(0.5);
        this.battlePassEndTime.y = this.horProgress.y + 20 * this.dpr;
        this.levelButton = new Button(this.scene, UIAtlasName.battlepass, "battlepass_lv_icon", "battlepass_lv_icon", "1", undefined, this.dpr, this.scale);
        this.levelButton.setFontStyle("bold");
        this.levelButton.setTextStyle(UIHelper.whiteStyle(this.dpr, 15));
        this.levelButton.x = this.horProgress.x - this.horProgress.width * 0.5 - this.levelButton.width * 0.5 - 8 * this.dpr;
        this.levelButton.y = this.horProgress.y;
        this.finalItem = new FinalRewardItem(this.scene, 44 * this.dpr, 44 * this.dpr, this.dpr, this.scale);
        this.finalItem.x = this.horProgress.x + this.horProgress.width * 0.5 + this.finalItem.width * 0.5 + 12 * this.dpr;
        this.finalItem.y = this.horProgress.y;
        this.finalItem.on(ClickEvent.Tap, this.onFinalBtnHandler, this);
        this.top.add([this.mBackButton, titleTex, this.horProgress, this.levelButton, this.progressTex, this.battlePassEndTime, this.finalItem]);
        this.content.add(this.top);
        this.createBottom(width, 50 * this.dpr);
        this.createMiddle(width, height);
        this.resize();
        super.init();
    }
    onShow() {
    }

    public setBattleData(battleData: IBattlePass, battleLevels: IBattlePassLevel[]) {
        this.battleData = battleData;
        this.battleLevels = battleLevels;
        if (!this.mInitialized || !this.battleState) return;
        this.updatePassDatas();
    }
    public setBattleState(battleState: IBattlePassState) {
        this.battleState = battleState;
        if (!this.mInitialized || !this.battleData) return;
        this.updatePassDatas();
    }
    protected createMiddle(width: number, height: number) {
        this.middle = this.scene.make.container(undefined, false);
        this.content.add(this.middle);
        this.gamescroll = this.createGameScroll(0, 0, width, height);
        this.middle.add([this.gamescroll]);
        this.leftLabel = new LabelCompent(this.scene, UIAtlasName.battlepass, "battlepass_reward_nav_1", i18n.t("battlepass.commontips"), this.dpr);
        this.rightLabel = new LabelCompent(this.scene, UIAtlasName.battlepass, "battlepass_reward_nav_2", i18n.t("battlepass.tickettips"), this.dpr);
        this.middle.add([this.leftLabel, this.rightLabel]);
        this.setMiddleConSize(width, height);

    }

    protected createBottom(width: number, height: number) {
        this.bottom = this.scene.make.container(undefined, false);
        this.bottom.setSize(width, height);
        this.content.add(this.bottom);
        this.bottom.y = this.scaleHeight * 0.5 - height * 0.5;
        this.buyTicketBtn = this.createNineButton(-80 * this.dpr, 0, 117 * this.dpr, 40 * this.dpr, UIAtlasName.uicommon, "red_btn_normal", i18n.t("battlepass.tickettips"), "#ffffff");
        this.buyTicketBtn.on(ClickEvent.Tap, this.onBuyTicketHandler, this);
        this.oneKeyBtn = this.createNineButton(80 * this.dpr, 0, 117 * this.dpr, 40 * this.dpr, UIAtlasName.uicommon, "yellow_btn", i18n.t("mail.onekey"), "#996600");
        this.oneKeyBtn.on(ClickEvent.Tap, this.onOneKeyBtnHandler, this);
        this.bottom.add([this.buyTicketBtn, this.oneKeyBtn]);
    }

    protected setMiddleConSize(width: number, height: number) {
        const fixedHeight = this.top.height + this.bottom.height + 65 * this.dpr;
        const mHeight = height - fixedHeight;
        this.middle.setSize(width, mHeight);
        this.middle.y = this.top.y + this.top.height * 0.5 + this.middle.height * 0.5 + 50 * this.dpr;
        this.leftLabel.x = -163 * this.dpr + this.leftLabel.width * 0.5;
        this.leftLabel.y = -mHeight * 0.5 + this.leftLabel.height * 0.5;
        this.rightLabel.x = this.leftLabel.x + this.leftLabel.width * 0.5 + 2 * this.dpr + this.rightLabel.width * 0.5;
        this.rightLabel.y = this.leftLabel.y;
        const scrollHeight = mHeight - 26 * this.dpr;
        this.gamescroll.resetSize(width, scrollHeight);
        this.gamescroll.y = 17 * this.dpr;
    }
    protected updatePassDatas() {
        this.updateBattleState();
        this.updateBattleLevels();
    }

    private updateBattleState() {
        let curLevel: IBattlePassLevel, lastLevel: IBattlePassLevel, battleState: IBattlePassState;
        for (const temp of this.battleLevels) {
            if (temp.level === this.battleState.battlePassLevel) {
                curLevel = temp;
                break;
            }
        }
        lastLevel = this.battleLevels[this.battleLevels.length - 1];
        battleState = this.battleState;
        this.lastLevel = lastLevel;
        this.levelButton.setText(battleState.battlePassLevel + "");
        this.progressTex.text = `${battleState.battlePassExp} / ${curLevel.exp}`;
        this.horProgress.setProgress(battleState.battlePassExp, curLevel.exp);
        if (!battleState.gotMaxLevelReward) {
            if (battleState.battlePassLevel === lastLevel.level) {
                battleState.deluxeCanReceive = true;
            }
            this.finalItem.setRewards(lastLevel.level, this.battleData.maxLevelReward);
            this.finalItem.enable = true;
        } else {
            battleState.deluxeCanReceive = false;
            this.finalItem.setRewards(lastLevel.level, undefined);
            this.finalItem.enable = false;
        }
        if (battleState.boughtDeluxeBattlePass) {
            this.buyTicketBtn.disInteractive();
            this.buyTicketBtn.setFrameNormal("butt_gray", "butt_gray");
        } else {
            this.buyTicketBtn.setInteractive();
            this.buyTicketBtn.setFrameNormal("red_btn_normal", "red_btn_normal");
        }
    }

    private updateBattleLevels() {
        for (let i = 0; i < this.battleLevels.length; i++) {
            let item: BattlePassItem;
            const data = this.battleLevels[i];
            if (i < this.battleItems.length) {
                item = this.battleItems[i];
            } else {
                item = new BattlePassItem(this.scene, this.dpr, this.scale);
                item.setHandler(new Handler(this, this.onReceiveRewardHandler));
                this.gamescroll.addItem(item);
                this.battleItems.push(item);
            }
            item.setPassData(data, this.battleState);
        }
        this.gamescroll.Sort(true);
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
            space: 3 * this.dpr,
            selfevent: true,
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

    private openUnlockPanel(data: IBattlePassLevel) {
        this.showUnlockPanel();
        this.unlockPanel.setUnlockPrice(data, this.battleData);
    }
    private showUnlockPanel() {
        if (!this.unlockPanel) {
            this.unlockPanel = new PicaBattleUnlockPanel(this.scene, this.width, this.height, this.dpr, this.scale);
            this.unlockPanel.setHandler(new Handler(this, this.onUnlockBattleHandler));
            this.content.add(this.unlockPanel);
        }
        this.unlockPanel.show();
    }

    private hideUnlockPanel() {
        if (this.unlockPanel) this.unlockPanel.hide();
    }
    private openUltimatePanel() {
        this.showUltimatePanel();
        this.ultimatePanel.setUltimateRewards(this.battleData.maxLevelReward, this.lastLevel.level);
    }
    private showUltimatePanel() {
        if (!this.ultimatePanel) {
            this.ultimatePanel = new PicaUltimateRewardPanel(this.scene, this.width, this.height, this.dpr, this.scale);
            this.ultimatePanel.setHandler(new Handler(this, this.onUnlockBattleHandler));
            this.content.add(this.ultimatePanel);
        }
        this.ultimatePanel.show();
    }

    private hideUltimatePanel() {
        this.ultimatePanel.show();
    }
    private onCloseHandler() {
        this.render.renderEmitter(this.key + "_close");
    }

    private onPointerUpHandler(gameobject: BattlePassItem) {
        if (this.tempBattleItem) this.tempBattleItem.setExtend(false);
        gameobject.setExtend(true);
        const pointer = this.scene.input.activePointer;
        gameobject.checkExtendRect(pointer);
        this.tempBattleItem = gameobject;
        this.gamescroll.Sort();
    }
    private onReceiveRewardHandler(tag: string, data: IBattlePassLevel) {
        if (tag === "nowunlock") {
            this.openUnlockPanel(data);
        } else if (tag === "receive") {
            this.render.renderEmitter(this.key + "_takerewards", data.level);
        }
    }
    private onFinalBtnHandler() {
        if (this.battleState.deluxeCanReceive) {
            this.render.renderEmitter(this.key + "_takemaxrewards");
        } else {
            this.openUltimatePanel();
        }
    }
    private onBuyTicketHandler() {
        this.render.renderEmitter(this.key + "_buyDeluxe", this.battleData.price);
    }
    private onOneKeyBtnHandler() {
        this.render.renderEmitter(this.key + "_onekey");
    }

    private onUnlockBattleHandler(level) {
        this.render.renderEmitter(this.key + "_buylevel", level);
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
    public setItemData(data: ICountablePackageItem, state: RewardState, deluxe: boolean = false) {
        this.itemData = data;
        this.itemBtn.setItemData(data);
        if (state === RewardState.RECEIVED) {
            this.stateImg.setFrame("battlepass_received");
            this.stateImg.visible = true;
            this.setStateAlpha(0.4);
        } else if (state === RewardState.LOCK) {
            if (deluxe) {
                this.stateImg.setFrame("battlepass_lock");
                this.stateImg.visible = true;
            } else {
                this.stateImg.visible = false;
            }
            this.setStateAlpha(0.4);
        } else if (state === RewardState.PLOCK) {
            this.stateImg.visible = false;
            this.setStateAlpha(0.4);
        } else {
            this.setStateAlpha(1);
        }
    }

    public showTips() {
        PicaItemTipsPanel.Inst.showTips(this, this.itemData);
    }

    public setStateAlpha(alpha) {
        this.itemBtn.alpha = alpha;
    }
}

class BattlePassItem extends Phaser.GameObjects.Container {
    public passData: any;
    private bg: Phaser.GameObjects.Image;
    private content: Phaser.GameObjects.Container;
    private serialTex: Phaser.GameObjects.Text;
    private coverBg: Phaser.GameObjects.Image;
    private unlockBtn: ThreeSliceButton;
    private receiveBtn: ThreeSliceButton;
    private dpr: number;
    private zoom: number;
    private sendHandler: Handler;
    private rewardItems: BattleRewardsItem[] = [];
    private canReceive: boolean = false;
    private isCurrentLevel: boolean = false;
    private extend: boolean = false;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.bg = this.scene.make.image({ key: UIAtlasName.battlepass, frame: "battlepass_reward_completed" });
        this.setSize(this.bg.width, this.bg.height);
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(this.width, 67 * dpr);
        this.serialTex = this.scene.make.text({ style: UIHelper.whiteStyle(dpr, 14) }).setFontStyle("bold").setOrigin(0.5);
        this.serialTex.x = -this.width * 0.5 + 16 * dpr;
        this.content.add(this.serialTex);
        this.add([this.bg, this.content]);
        this.createFourItems();
    }

    public setHandler(send: Handler) {
        this.sendHandler = send;
    }

    public setPassData(passData: IBattlePassLevel, state: IBattlePassState) {
        this.passData = passData;
        const { elementary, deluxe, canReceive, isCurrentLevel, canNowUnlock } = this.getBattleState(passData, state);
        const elementaryReward = passData.elementaryReward;
        this.rewardItems[0].setItemData(elementaryReward[0], elementary, false);
        const deluxeReward = passData.deluxeReward;
        for (let i = 1; i < this.rewardItems.length; i++) {
            const item = this.rewardItems[i];
            item.setItemData(deluxeReward[i - 1], deluxe, true);
        }
        this.canReceive = canReceive;
        this.isCurrentLevel = isCurrentLevel;
        this.setActiveCovers(canNowUnlock);
        this.extend = canReceive ? this.extend : false;
        this.setExtend(this.extend);
        if (canNowUnlock) {
            this.bg.setFrame("battlepass_reward_locked");
        }
        this.serialTex.text = passData.level + "";
    }

    public getBattleState(passData: IBattlePassLevel, state: IBattlePassState) {
        let elementary = RewardState.LOCK;
        let deluxe = RewardState.LOCK;
        let canReceive = false;
        let isCurrentLevel = false;
        let canNowUnlock = false;
        if (state.boughtDeluxeBattlePass) {
            if (state.deluxeRewardTakenList.indexOf(passData.level) === -1) {
                deluxe = RewardState.UNLOCK;
                canReceive = true;
            } else {
                deluxe = RewardState.RECEIVED;
            }
        } else {
            deluxe = RewardState.LOCK;
        }
        if (passData.level <= state.battlePassLevel) {
            if (state.elementaryRewardTakenList.indexOf(passData.level) === -1) {
                elementary = RewardState.UNLOCK;
                canReceive = true;
            } else {
                elementary = RewardState.RECEIVED;
            }
            if (passData.level === state.battlePassLevel) isCurrentLevel = true;
        } else {
            elementary = RewardState.LOCK;
            if (deluxe === RewardState.UNLOCK) deluxe = RewardState.PLOCK;
            if (passData.level === state.battlePassLevel + 1) {
                canNowUnlock = true;
            }
        }

        return { elementary, deluxe, canReceive, isCurrentLevel, canNowUnlock };
    }
    public checkExtendRect(pointer) {
        for (const obj of this.rewardItems) {
            if (Tool.checkPointerContains(obj, pointer)) {
                obj.showTips();
            }
        }
    }

    public setExtend(extend: boolean) {
        if (extend && !this.canReceive) return;
        if (extend) {
            this.bg.setFrame(this.isCurrentLevel ? "battlepass_reward_completed_1" : "battlepass_reward_received_1");
            this.setSize(this.bg.width, this.bg.height);
            if (!this.receiveBtn) {
                this.receiveBtn = new ThreeSliceButton(this.scene, 93 * this.dpr, 29 * this.dpr, UIAtlasName.uicommon, UIHelper.threeRedSmall, UIHelper.threeRedSmall, i18n.t("common.receivereward"));
                this.receiveBtn.setTextStyle(UIHelper.whiteStyle(this.dpr, 11));
                this.receiveBtn.setFontStyle("bold");
                this.receiveBtn.on(ClickEvent.Tap, this.onReceiveHandler, this);
                this.add(this.receiveBtn);
            }
            this.receiveBtn.visible = true;
            this.content.y = -this.height * 0.5 + this.content.height * 0.5 + 6 * this.dpr;
            this.receiveBtn.y = this.height * 0.5 - this.receiveBtn.height * 0.5 - 6 * this.dpr;
        } else {
            this.bg.setFrame(this.isCurrentLevel ? "battlepass_reward_completed" : "battlepass_reward_received");
            this.setSize(this.bg.width, this.bg.height);
            this.content.y = 0;
            if (this.receiveBtn) this.receiveBtn.visible = false;
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
            this.unlockBtn.setTextStyle(UIHelper.brownishStyle(this.dpr, 11));
            this.unlockBtn.setFontStyle("bold");
            this.unlockBtn.on(ClickEvent.Tap, this.onNowUnlockHandler, this);
            this.add(this.unlockBtn);
        }
    }

    private createFourItems() {
        let posx = -this.width * 0.5 + 65 * this.dpr;
        const cellWidth = 67 * this.dpr, spacebig = 15 * this.dpr, space = 6 * this.dpr;
        for (let i = 0; i < 4; i++) {
            const item = new BattleRewardsItem(this.scene, this.dpr, this.zoom);
            this.content.add(item);
            this.rewardItems.push(item);
            item.x = posx;
            posx += cellWidth + (i === 0 ? spacebig : space);
        }
    }

    private onNowUnlockHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["nowunlock", this.passData]);
    }

    private onReceiveHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["receive", this.passData]);
    }
}

class FinalRewardItem extends ButtonEventDispatcher {
    public itemData: ICountablePackageItem[];
    private icon: DynamicImage;
    private countBg: Phaser.GameObjects.Image;
    private countTex: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene, dpr, zoom);
        this.setSize(width, height);
        this.icon = new DynamicImage(scene, 0, 0, UIAtlasName.battlepass, "battlepass_lv_reward");
        this.countBg = this.scene.make.image({ key: UIAtlasName.battlepass, frame: "battlepass_lv_reward_bg" });
        this.countBg.y = this.height * 0.5 - this.countBg.height * 0.5;
        this.countTex = this.scene.make.text({ style: UIHelper.whiteStyle(dpr, 11) }).setOrigin(0.5).setFontStyle("bold");
        this.countTex.y = this.countBg.y;
        this.add([this.icon, this.countBg, this.countTex]);
    }

    public setRewards(finalLevel: number, datas?: ICountablePackageItem[]) {
        this.countTex.text = finalLevel + "";
        if (datas) {
            this.itemData = datas;
            const temp = datas[0];
            const url = Url.getOsdRes(temp.texturePath);
            this.icon.load(url, this, () => {
                this.icon.scale = this.dpr / this.zoom;
            });
        } else {
            this.icon.setTexture(UIAtlasName.battlepass, "battlepass_lv_reward_1");
            this.icon.scale = 1;
        }
    }
}
class LabelCompent extends Phaser.GameObjects.Container {
    protected dpr: number;
    protected bg: Phaser.GameObjects.Image;
    protected title: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, key: string, frame: string, title: string, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.bg = this.scene.make.image({ key, frame });
        this.title = this.scene.make.text({ text: title, style: UIHelper.whiteStyle(dpr, 11) }).setFontStyle("bold").setOrigin(0.5);
        this.add([this.bg, this.title]);
        this.setSize(this.bg.width, this.bg.height);
    }
}
enum RewardState {
    RECEIVED = 1,
    UNLOCK = 2,
    LOCK = 3,
    PLOCK = 4
}
