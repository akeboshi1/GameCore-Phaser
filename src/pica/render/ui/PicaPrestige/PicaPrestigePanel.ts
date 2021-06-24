import { ButtonEventDispatcher, ProgressMaskBar, ToggleColorButton, UiManager } from "gamecoreRender";
import { UIAtlasName } from "../../../res";
import { ModuleName } from "structure";
import { Handler, i18n, UIHelper } from "utils";
import { PicaBasePanel } from "../pica.base.panel";
import { op_client } from "pixelpai_proto";
import { Button, ClickEvent, NineSlicePatch } from "apowophaserui";
import { IExtendCountablePackageItem, IGalleryCombination, MainUIRedType } from "../../../structure";
import { CommonBackground, ImageValue, UITools } from "..";
export class PicaIllustratedPanel extends PicaBasePanel {
    private mBackground: CommonBackground;
    private content: Phaser.GameObjects.Container;
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
    private optionType: number;
    private redObj: any;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICAPRESTIGE_NAME;
        this.loadAtlas = [UIAtlasName.uicommon, UIAtlasName.uicommon1, UIAtlasName.prestige];
        this.tempDatas = {};
    }
    resize(width?: number, height?: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        this.mBackground.x = w * 0.5;
        this.mBackground.y = h * 0.5;
        this.content.x = w * 0.5;
        this.content.y = h * 0.5;
        this.mBackground.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
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
        this.add(this.mBackground);
        this.topCon = this.scene.make.container(undefined, false);
        this.topCon.setSize(this.width, 100 * this.dpr);
        this.toggleCon = this.scene.make.container(undefined, false);
        this.selectLine = this.scene.make.image({ key: UIAtlasName.illustrate, frame: "illustrate_nav_select" });
        this.toggleCon.add(this.selectLine);
        this.toggleCon.y = 0;
        this.mBackButton = UITools.createBackButton(this.scene, this.dpr, this.onCloseHandler, this);
        this.mBackButton.x = -width * 0.5 + this.mBackButton.width * 0.5;
        this.mBackButton.y = this.topCon.height * 0.5 - this.mBackButton.height * 0.5 - 10 * this.dpr;
        this.mHelpBtn = new Button(this.scene, UIAtlasName.prestige, "prestige_help_icon");
        this.mHelpBtn.setInteractiveSize(25 * this.dpr, 25 * this.dpr);
        this.mHelpBtn.x = width * 0.5 - this.mHelpBtn.width * 0.5 - 14 * this.dpr;
        this.mHelpBtn.y = this.mBackButton.y;
        this.horProgress = new ProgressMaskBar(this.scene, UIAtlasName.battlepass, "battlepass_lv_schedule_bottom", "battlepass_lv_schedule_top", UIHelper.whiteStyle(this.dpr, 6));
        this.horProgress.y = this.mBackButton.y + this.mBackButton.height * 0.5 + 28 * this.dpr;
        this.horProgress.x = -10 * this.dpr;
        this.progressTex = this.scene.make.text({ style: UIHelper.whiteStyle(this.dpr) }).setOrigin(0.5);
        this.progressTex.setFontStyle("bold");
        this.progressTex.x = this.horProgress.x;
        this.progressTex.y = this.horProgress.y + 6 * this.dpr;
        this.levelButton = new Button(this.scene, UIAtlasName.battlepass, "battlepass_lv_icon", "battlepass_lv_icon", "1", undefined, this.dpr, this.scale);
        this.levelButton.setFontStyle("bold");
        this.levelButton.setTextStyle(UIHelper.whiteStyle(this.dpr, 15));
        this.levelButton.x = this.horProgress.x - this.horProgress.width * 0.5 - this.levelButton.width * 0.5 - 8 * this.dpr;
        this.levelButton.y = this.horProgress.y;
        this.prestigeCompent = new PrestigeCompent(this.scene, 110 * this.dpr, 27 * this.dpr, this.dpr, this.scale);
        this.prestigeCompent.x = this.horProgress.x + this.horProgress.width * 0.5 + this.prestigeCompent.width * 0.5 + 5 * this.dpr;
        this.prestigeCompent.y = this.horProgress.y;
        this.topCon.add([this.toggleCon, this.mBackButton, this.mHelpBtn, this.horProgress, this.progressTex, this.levelButton, this.prestigeCompent]);
        this.createOptionButtons();
        const conWdith = 295 * this.dpr;
        const conHeight = 405 * this.dpr;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(conWdith, conHeight);
        this.add(this.content);
        this.resize();
        super.init();
    }

    onShow() {
        this.openListPanel();
        if (this.redObj) this.setRedsState(this.redObj);
    }
    setAutoOption(option: number) {
        for (const obj of this.toggleCon.list) {
            if (obj.getData("item") === option) {
                this.onToggleButtonHandler(undefined, <any>obj);
            }
        }
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
        // let tableHeight = this.height * 0.5 - this.topCon.y - this.topCon.height * 0.5;
        // let offsetY = 30 * this.dpr;
        if (type === 1) {
            this.horProgress.visible = true;
            this.prestigeCompent.visible = false;
        } else if (type === 2) {
            this.horProgress.visible = false;
            this.prestigeCompent.visible = true;
        }
    }
    private openListPanel() {
        // this.showListPanel();
        // this.listPanel.setListData();
        // if (this.redObj) this.listPanel.setRedsState(this.redObj["redlist"]);
    }

    private showListPanel() {
        // if (!this.listPanel) {
        //     this.listPanel = new PicaIllustratedListPanel(this.scene, this.scaleWidth, this.scaleHeight, this.dpr, this.scale);
        //     this.listPanel.setHandler(new Handler(this, this.onListHandler));
        //     this.content.add(this.listPanel);
        // }
        // this.listPanel.visible = true;
        // this.titleTex.visible = true;
    }
    private hideListPanel() {
        // this.listPanel.visible = false;
    }

    private openDetailPanel() {
        // this.showDetailPanel();
        // if (this.tempDatas) {
        //     this.detailPanel.setGallaryData(this.tempDatas.gallery, this.tempDatas.combinations);
        //     if (this.tempDatas.donemission) this.detailPanel.setDoneMissionList(this.tempDatas.donemission);
        // }
        // if (this.redObj) this.detailPanel.setRedsState(this.redObj[MainUIRedType.GALLERY]);
    }

    private showDetailPanel() {
        // if (!this.detailPanel) {
        //     this.detailPanel = new PicaIllustratedDetailPanel(this.scene, this.scaleWidth, this.scaleHeight, this.dpr, this.scale);
        //     this.detailPanel.setHandler(new Handler(this, this.onDetailHandler));
        //     this.content.add(this.detailPanel);
        // }
        // this.detailPanel.resize(this.scaleWidth, this.scaleHeight);
        // this.detailPanel.visible = true;
        // this.titleTex.visible = false;
    }

    private hideDetailPanel() {
        // this.detailPanel.visible = false;
    }

    private openFuriDetail(prop: IExtendCountablePackageItem) {
        // this.showFuriDetailPanel();
        // this.furiDetail.setProp(prop);
    }
    private showFuriDetailPanel() {
        // if (!this.furiDetail) {
        //     this.furiDetail = new PicaFuriniDetailPanel(this.scene, this.render, 334 * this.dpr, 353 * this.dpr, this.dpr, this.scale);
        //     this.furiDetail.setHandler(new Handler(this, this.onFuriDetailHandler));
        // }
        // this.content.add(this.furiDetail);
        // this.furiDetail.visible = true;
        // this.furiDetail.refreshMask();
    }

    private hideFuriDetailPanel() {
        // this.content.remove(this.furiDetail);
        // this.furiDetail.visible = false;
    }

    private onListHandler(tag: string, data?: any) {
        if (tag === "make") {
            this.render.renderEmitter(this.key + "_openpanel", tag);
        } else if (tag === "gallary") {
            this.hideListPanel();
            this.openDetailPanel();
        } else if (tag === "cooking") {
            this.render.renderEmitter(this.key + "_openpanel", tag);
        }
    }

    private onDetailHandler(tag: string, data: any) {
        if (tag === "close") {
            this.hideDetailPanel();
            this.showListPanel();
        } else if (tag === "rewards") {
            this.render.renderEmitter(this.key + "_queryrewards", data);
        } else if (tag === "combinations") {
            this.render.renderEmitter(this.key + "_querycombinations", data);
        } else if (tag === "furidetail") {
            this.openFuriDetail(data);
        }
    }

    private onFuriDetailHandler() {
        this.hideFuriDetailPanel();
    }
    private onCloseHandler() {
        // if (this.detailPanel && this.detailPanel.visible) {
        //     this.hideDetailPanel();
        //     // this.openListPanel();
        //     this.showListPanel();
        //     return;
        // }
        // this.render.renderEmitter(this.key + "_close");
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
