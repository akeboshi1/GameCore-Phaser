import { ButtonEventDispatcher, ProgressMaskBar, ToggleColorButton, UiManager } from "gamecoreRender";
import { UIAtlasName } from "../../../res";
import { ModuleName } from "structure";
import { Handler, i18n, UIHelper } from "utils";
import { PicaBasePanel } from "../pica.base.panel";
import { Button, ClickEvent, NineSlicePatch } from "apowophaserui";
import { ICurrencyLevel, IExtendCountablePackageItem, IFameLevel, IPermission, MainUIRedType } from "../../../structure";
import { CommonBackground, ImageValue, UITools } from "..";
import { PicaPrestigeLevelPanel } from "./PicaPrestigeLevelPanel";
import { PicaPrestigeMarketPanel } from "./PicaPrestigeMarketPanel";
import { PicaPrivilegeDescriblePanel } from "./PicaPrivilegeDescriblePanel";
import { PicaPrestigeDetailPanel } from "./PicaPrestigeDetailPanel";
export class PicaPrestigePanel extends PicaBasePanel {
    private mBackground: CommonBackground;
    private curToggle: ToggleColorButton;
    private topCon: Phaser.GameObjects.Container;
    private toggleCon: Phaser.GameObjects.Container;
    private selectLine: Phaser.GameObjects.Image;
    private mBackButton: ButtonEventDispatcher;
    private mHelpBtn: Button;
    private horProgress: ProgressMaskBar;
    private progressTex: Phaser.GameObjects.Text;
    private levelButton: Button;
    private prestigeCompent: PrestigeCompent;
    private titleTex: Phaser.GameObjects.Text;
    private prestigeDetail: PicaPrestigeDetailPanel;
    private prestigeLev: PicaPrestigeLevelPanel;
    private prestigeMarket: PicaPrestigeMarketPanel;
    private privileDescrible: PicaPrivilegeDescriblePanel;
    private optionType: number;
    private redObj: any;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICAPRESTIGE_NAME;
        this.loadAtlas = [UIAtlasName.uicommon, UIAtlasName.uicommon1, UIAtlasName.prestige, UIAtlasName.market];
        this.tempDatas = {};
    }
    resize(width?: number, height?: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        this.mBackground.x = w * 0.5;
        this.mBackground.y = h * 0.5;
        this.topCon.x = w * 0.5;
        this.topCon.y = this.topCon.height * 0.5;
        this.mBackground.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
        this.tempDatas = {};
        if (this.prestigeDetail) {
            const tempheight = this.scaleHeight - this.topCon.height;
            this.prestigeDetail.resize(this.scaleWidth, tempheight);
        }
        super.resize(w, h);
        this.setSize(w, h);
    }

    public destroy() {
        super.destroy();
        // if (this.listPanel) this.listPanel.destroy();
        // if (this.detailPanel) this.detailPanel.destroy();
    }

    init() {
        const width = this.scaleWidth, height = this.scaleHeight;
        this.mBackground = new CommonBackground(this.scene, 0, 0, width, height);
        this.topCon = this.scene.make.container(undefined, false);
        this.topCon.setSize(this.width, 110 * this.dpr);
        this.add([this.mBackground, this.topCon]);
        this.toggleCon = this.scene.make.container(undefined, false);
        this.selectLine = this.scene.make.image({ key: UIAtlasName.prestige, frame: "illustrate_nav_select" });
        this.toggleCon.add(this.selectLine);
        this.toggleCon.y = -this.topCon.height * 0.5 + 35 * this.dpr;
        this.mBackButton = UITools.createBackButton(this.scene, this.dpr, this.onCloseHandler, this);
        this.mBackButton.on(ClickEvent.Tap, this.onCloseHandler, this);
        this.mBackButton.x = -width * 0.5 + this.mBackButton.width * 0.5;
        this.mBackButton.y = this.toggleCon.y;
        this.mHelpBtn = new Button(this.scene, UIAtlasName.prestige, "prestige_help_icon");
        this.mHelpBtn.setInteractiveSize(25 * this.dpr, 25 * this.dpr);
        this.mHelpBtn.x = width * 0.5 - this.mHelpBtn.width * 0.5 - 14 * this.dpr;
        this.mHelpBtn.y = this.mBackButton.y;
        this.horProgress = new ProgressMaskBar(this.scene, UIAtlasName.prestige, "prestige_lv_bottom", "prestige_lv_top", UIHelper.whiteStyle(this.dpr, 6));
        this.horProgress.y = this.mBackButton.y + this.mBackButton.height * 0.5 + 35 * this.dpr;
        this.horProgress.x = 20 * this.dpr;
        this.progressTex = this.scene.make.text({ style: UIHelper.whiteStyle(this.dpr) }).setOrigin(0.5);
        this.progressTex.setFontStyle("bold");
        this.progressTex.x = this.horProgress.x;
        this.progressTex.y = this.horProgress.y + 6 * this.dpr;
        this.levelButton = new Button(this.scene, UIAtlasName.prestige, "prestige_lv_icon", "prestige_lv_icon", "1", undefined, this.dpr, this.scale);
        this.levelButton.setFontStyle("bold");
        this.levelButton.setTextStyle(UIHelper.whiteStyle(this.dpr, 15));
        this.levelButton.on(ClickEvent.Tap, this.onLevelButtonHandler, this);
        this.levelButton.x = this.horProgress.x - this.horProgress.width * 0.5 - this.levelButton.width * 0.5 - 8 * this.dpr;
        this.levelButton.y = this.horProgress.y;
        this.prestigeCompent = new PrestigeCompent(this.scene, 110 * this.dpr, 27 * this.dpr, this.dpr, this.scale);
        this.prestigeCompent.setHandler(new Handler(this, this.onRechargeHandler));
        this.prestigeCompent.x = width * 0.5 - 10 * this.dpr;
        this.prestigeCompent.y = this.horProgress.y;
        this.topCon.add([this.toggleCon, this.mBackButton, this.mHelpBtn, this.horProgress, this.progressTex, this.levelButton, this.prestigeCompent]);
        this.createOptionButtons();
        this.resize();
        super.init();
    }

    onShow() {
        if (this.redObj) this.setRedsState(this.redObj);
        if (this.tempDatas["fame"]) {
            this.setFameDatas(this.tempDatas["fame"]);
        }
    }
    setAutoOption(option: number) {
        for (const obj of this.toggleCon.list) {
            if (obj.getData("item") === option) {
                this.onToggleButtonHandler(undefined, <any>obj);
            }
        }
    }
    setFameDatas(datas: IFameLevel[]) {
        datas = datas || [];
        this.tempDatas["fame"] = datas;
        if (!this.mInitialized) return;
        if (this.prestigeDetail) this.prestigeDetail.setPrestigeData(datas);
    }
    public onPropConfirmHandler(prop: any, count: number) {
        this.render.renderEmitter(this.key + "_buyItem", prop);
    }
    public setCategories(content: any) {
        this.prestigeMarket.setCategories(content);
    }

    public setMoneyData(data: ICurrencyLevel) {
        this.prestigeMarket.setMoneyData(data);
        this.prestigeCompent.setPrestigeData(data.reputationCoin);
    }
    public updateBuyedProps(buyedDatas: any[]) {
        this.prestigeMarket.updateBuyedProps(buyedDatas);
    }
    public setProp(content: any) {
        this.prestigeMarket.setProp(content);
    }
    setRedsState(obj: any) {
        this.redObj = obj;
        if (!this.mInitialized) return;

    }
    protected createOptionButtons() {
        const arr = [{ text: i18n.t("common.reputation"), type: 1 }, { text: i18n.t("market.title"), type: 2 }];
        const allLin = 120 * this.dpr;
        const cellwidth = allLin / arr.length;
        const cellHeight = 20 * this.dpr;
        let posx = -allLin / 2;
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < arr.length; i++) {
            const data = arr[i];
            const item = new ToggleColorButton(this.scene, cellwidth, 20 * this.dpr, this.dpr, data.text, UIHelper.colorStyle("#ffffff", 14 * this.dpr));
            item.on(ClickEvent.Tap, this.onToggleButtonHandler, this);
            item.x = posx + cellwidth * 0.5;
            item.setData("item", data.type);
            item.setSize(cellwidth, cellHeight);
            this.toggleCon.add(item);
            item.setChangeColor("#FFF449");
            item.setNormalColor("#ffffff");
            item.setFontStyle("bold");
            posx += cellwidth;
            if (!this.curToggle) {
                this.onToggleButtonHandler(undefined, item);
            }
        }
        const line = this.scene.make.graphics(undefined, false);
        line.fillStyle(0xEEEEEE, 1);
        line.fillRect(-this.dpr, -9 * this.dpr, 2 * this.dpr, 18 * this.dpr);
        this.toggleCon.add(line);
        this.selectLine.y = 20 * this.dpr;
    }

    private onToggleButtonHandler(pointer: any, toggle: ToggleColorButton) {
        if (this.curToggle === toggle) return;
        if (this.curToggle) {
            this.curToggle.isOn = false;
        }
        toggle.isOn = true;
        this.curToggle = toggle;
        this.optionType = toggle.getData("item");
        this.selectLine.x = toggle.x;
        this.layoutOption(this.optionType);
    }
    private layoutOption(type: number) {
        if (type === 1) {
            this.horProgress.visible = true;
            this.prestigeCompent.visible = false;
            this.openDetailPanel();
            this.hideMarketPanel();
        } else if (type === 2) {
            this.horProgress.visible = false;
            this.prestigeCompent.visible = true;
            this.openMarketPanel();
            this.hideDetailPanel();
        }
    }

    private onLevelButtonHandler() {
        this.openLevelPanel();
        const fame = this.tempDatas["fame"];
        this.prestigeLev.setRewardsData(fame);
    }
    private openDetailPanel() {
        this.showDetailPanel();
    }

    private showDetailPanel() {
        const height = this.scaleHeight - this.topCon.height;
        if (!this.prestigeDetail) {
            this.prestigeDetail = new PicaPrestigeDetailPanel(this.scene, this.scaleWidth, height, this.dpr, this.scale);
            this.prestigeDetail.setHandler(new Handler(this, this.onDetailHandler));
            this.add(this.prestigeDetail);
            this.prestigeDetail.x = this.scaleWidth * 0.5;
            this.prestigeDetail.y = this.scaleHeight * 0.5 + this.topCon.height * 0.5;
        }
        this.prestigeDetail.show();
        this.horProgress.visible = true;
        this.prestigeCompent.visible = false;
    }
    private hideDetailPanel() {
        if (this.prestigeDetail) this.prestigeDetail.hide();
    }

    private openMarketPanel() {
        this.showMarketPanel();
    }

    private showMarketPanel() {
        if (!this.prestigeMarket) {
            this.prestigeMarket = new PicaPrestigeMarketPanel(this.uiManager);
            this.addAt(this.prestigeMarket, 1);
        }
        this.prestigeMarket.show();
        this.horProgress.visible = false;
        this.prestigeCompent.visible = true;
    }

    private hideMarketPanel() {
        if (this.prestigeMarket) this.prestigeMarket.hide();
    }

    private openLevelPanel() {
        this.showLevelPanel();
    }
    private showLevelPanel() {
        if (!this.prestigeLev) {
            this.prestigeLev = new PicaPrestigeLevelPanel(this.scene, this.width, this.height, this.dpr, this.scale);
            this.prestigeLev.setHandler(new Handler(this, this.onLevelHandler));
            this.add(this.prestigeLev);
            this.prestigeLev.x = this.scaleWidth * 0.5;
            this.prestigeLev.y = this.scaleHeight * 0.5;
        }
        this.prestigeLev.visible = true;
        this.prestigeLev.refreshMask();
        this.hideContentPanel();
    }

    private hideLevelPanel() {
        if (this.prestigeLev) this.prestigeLev.visible = false;
        this.showContentPanel();

    }

    private openDescriblePanel(data: IFameLevel) {
        this.showDescriblePanel();
        this.privileDescrible.setPrestigeData(data);
    }
    private showDescriblePanel() {
        if (!this.privileDescrible) {
            this.privileDescrible = new PicaPrivilegeDescriblePanel(this.scene, this.scaleWidth, this.scaleHeight, this.dpr, this.scale);
            this.add(this.privileDescrible);
            this.privileDescrible.x = this.scaleWidth * 0.5;
            this.privileDescrible.y = this.scaleHeight * 0.5;
        }
        this.privileDescrible.visible = true;
    }

    private hideDescriblePanel() {
        if (this.privileDescrible) this.privileDescrible.visible = false;
    }

    private showContentPanel() {
        if (this.topCon) this.topCon.visible = true;
        if (this.optionType === 1) {
            if (this.prestigeDetail) this.prestigeDetail.visible = true;
        } else {
            if (this.prestigeMarket) this.prestigeMarket.visible = true;
        }
    }

    private hideContentPanel() {
        if (this.topCon) this.topCon.visible = false;
        if (this.optionType === 1) {
            this.prestigeDetail.visible = false;
        } else {
            this.prestigeMarket.visible = false;
        }
    }

    private onDetailHandler(tag: string, data: any) {
        if (tag === "describle") {
            this.openDescriblePanel(data);
        }
    }

    private onLevelHandler(tag: string, data: any) {
        if (tag === "back") {
            this.hideLevelPanel();
        } else if (tag === "") {

        }
    }

    private onCloseHandler() {
        this.render.renderEmitter(this.key + "_close");
    }

    private onRechargeHandler() {
        this.render.mainPeer.showMediator(ModuleName.PICAPRESTIGECONVERT_NAME, true);
    }
}

class PrestigeCompent extends Phaser.GameObjects.Container {
    public prestige: number;
    private dpr: number;
    private zoom: number;
    private prestigevalue: ImageValue;
    private moneyAddBtn: Button;
    private send: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.create();
    }
    public setHandler(send: Handler) {
        this.send = send;
    }
    public setPrestigeData(prestige: number) {
        prestige = prestige || 0;
        if (prestige > 99999) {
            this.prestigevalue.setText((Math.floor(prestige / 1000) / 10) + "");
            this.prestigevalue.setUintText({ img: true });
        } else {
            this.prestigevalue.setText(prestige + "");
            this.prestigevalue.setUintTextVisible(false);
        }
        this.prestige = prestige;
    }

    protected create() {
        const moneybg = new NineSlicePatch(this.scene, 0, -this.dpr, this.width, this.height, UIAtlasName.uicommon, "home_assets_bg", {
            left: 17 * this.dpr,
            top: 0 * this.dpr,
            right: 17 * this.dpr,
            bottom: 0 * this.dpr
        });
        moneybg.x = -moneybg.width * 0.5;
        this.prestigevalue = new ImageValue(this.scene, 60 * this.dpr, 26 * this.dpr, UIAtlasName.uicommon, "iv_prestige", this.dpr, UIHelper.colorNumberStyle("#ffffff", 15 * this.dpr));
        this.prestigevalue.setLayout(1);
        this.prestigevalue.x = moneybg.x - moneybg.width * 0.5 + 22 * this.dpr;
        this.moneyAddBtn = new Button(this.scene, UIAtlasName.uicommon, "home_praise_bg", "home_praise_bg");
        const moneyAddicon = this.scene.make.image({ x: 0, y: 0, key: UIAtlasName.uicommon, frame: "home_assets_add" }, false);
        this.moneyAddBtn.add(moneyAddicon);
        this.moneyAddBtn.x = -this.moneyAddBtn.width * 0.5 - 4 * this.dpr;
        this.moneyAddBtn.on(ClickEvent.Tap, this.onRechargeHandler, this);
        this.add([moneybg, this.prestigevalue, this.moneyAddBtn]);
    }
    private onRechargeHandler() {
        if (this.send) this.send.run();
    }
}
