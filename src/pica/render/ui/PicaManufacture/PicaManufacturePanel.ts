import { NineSliceButton, GameGridTable, GameScroller, Button, BBCodeText, NineSlicePatch, ClickEvent } from "apowophaserui";
import { ButtonEventDispatcher, CommonBackground, DynamicImage, ImageValue, TextButton, ToggleColorButton, UiManager } from "gamecoreRender";
import { ItemButton } from "picaRender";
import { UIAtlasName } from "picaRes";
import { ModuleName } from "structure";
import { Font, Handler, i18n, UIHelper, Url } from "utils";
import { op_client, op_def } from "pixelpai_proto";
import { PicaBasePanel } from "../pica.base.panel";
import { ICountablePackageItem } from "picaStructure";
import { PicaFurnitureComposePanel } from "./PicaFurnitureComposePanel";
import { PicaRecastePanel } from "./PicaRecastePanel";
export class PicaManufacturePanel extends PicaBasePanel {
    private mCloseBtn: ButtonEventDispatcher;
    private toggleCon: Phaser.GameObjects.Container;
    private selectLine: Phaser.GameObjects.Image;
    private curToggleItem: ToggleColorButton;
    private starCountCon: Phaser.GameObjects.Container;
    private starvalue: ImageValue;
    private composePanel: PicaFurnitureComposePanel;
    private recastPanel: PicaRecastePanel;
    private starCount: number;
    private optionType: number;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.atlasNames = [UIAtlasName.uicommon, UIAtlasName.effectcommon, UIAtlasName.recast];
        this.textures = [{ atlasName: "Recast_aims_icon_bg", folder: "texture" }, { atlasName: "Recast_bg_texture", folder: "texture" }];
        this.key = ModuleName.PICAMANUFACTURE_NAME;
    }

    resize(w: number, h: number) {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.mCloseBtn.x = this.mCloseBtn.width * 0.5 + 0 * this.dpr;
        this.mCloseBtn.y = 45 * this.dpr;
        this.starCountCon.y = this.mCloseBtn.y;
        this.starCountCon.x = width - 15 * this.dpr;
        this.toggleCon.x = width * 0.5;
        this.toggleCon.y = this.toggleCon.height * 0.5 + 20 * this.dpr;
        this.composePanel.resize(width, height);
        this.recastPanel.resize(width, height);
        super.resize(width, height);
        this.setInteractive();
    }
    onShow() {
        const index = this.mShowData ? 2 : 1;
        this.onToggleButtonHandler(undefined, <any>this.toggleCon.getAt(index));
        if (this.optionType === 2) {
            this.recastPanel.setStarData(this.starCount);
            this.recastPanel.setRecasteItemData(this.mShowData, true);
            if (this.tempDatas && this.tempDatas.subcategory) this.recastPanel.setCategories(this.tempDatas.subcategory);
            const bagPanel = this.render.uiManager.getPanel(ModuleName.PICABAG_NAME);
            if (bagPanel) bagPanel.visible = false;
        }
    }

    onHide() {
        if (this.mShowData) {
            const bagPanel = this.render.uiManager.getPanel(ModuleName.PICABAG_NAME);
            if (bagPanel) bagPanel.visible = true;
        }
    }
    setCategories(categorys?: any[]) {
        this.tempDatas = { subcategory: categorys };
        if (!this.mInitialized) return;
        if (this.optionType === 1) {
            this.composePanel.setCategories();
        } else if (this.optionType === 2) {
            this.recastPanel.setCategories(categorys);
        }
    }
    setRecasteResult(data) {
        this.recastPanel.setRecasteResult(data);
    }
    public setGridProp(props: any[]) {
        if (this.optionType === 1) {
            this.composePanel.setGridProp(props);
        } else {
            this.recastPanel.setProp(props);
        }
    }

    public updateGridProp(props: any[]) {
        this.composePanel.updateGridProp(props);
    }

    public setStarData(value: number) {
        this.starCount = value;
        if (!this.mInitialized) return;
        this.composePanel.setStarData(this.starCount);
        this.recastPanel.setStarData(this.starCount);
        this.starvalue.setText(value + "");
    }

    public setComposeResult(reward: op_client.ICountablePackageItem) {

    }

    queryRefreshPackage(update) {
        this.composePanel.queryRefreshPackage(update);
    }

    protected onInitialized() {
        if (this.starCount) {
            this.composePanel.setStarData(this.starCount);
            this.recastPanel.setStarData(this.starCount);
            this.starvalue.setText(this.starCount + "");
        }
    }

    protected init() {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.setSize(width, height);
        this.composePanel = new PicaFurnitureComposePanel(this.scene, this.render, this.width, this.height, this.dpr, this.scale);
        this.recastPanel = new PicaRecastePanel(this.scene, this.render, this.width, this.height, this.dpr, this.scale);
        this.mCloseBtn = new ButtonEventDispatcher(this.scene, 0, 0);
        this.mCloseBtn.on(ClickEvent.Tap, this.onCloseHandler, this);
        this.mCloseBtn.x = this.mCloseBtn.width * 0.5 + 10 * this.dpr;
        this.mCloseBtn.y = 45 * this.dpr;
        const closeImg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "back_arrow" });
        this.mCloseBtn.add(closeImg);
        this.mCloseBtn.setSize(80 * this.dpr, closeImg.height);
        this.mCloseBtn.enable = true;
        const starbg = new NineSlicePatch(this.scene, 0, -this.dpr, 80 * this.dpr, 28 * this.dpr, UIAtlasName.uicommon, "home_assets_bg", {
            left: 17 * this.dpr,
            top: 0 * this.dpr,
            right: 17 * this.dpr,
            bottom: 0 * this.dpr
        });
        starbg.x = -starbg.width * 0.5;
        this.starvalue = new ImageValue(this.scene, 60 * this.dpr, 26 * this.dpr, UIAtlasName.recast, "Recast_pica star_big", this.dpr, {
            color: "#ffffff", fontSize: 15 * this.dpr, fontFamily: Font.NUMBER
        });
        this.starvalue.setLayout(1);
        this.starvalue.x = starbg.x - starbg.width * 0.5 + 22 * this.dpr;
        this.starCountCon = this.scene.make.container(undefined, false);
        this.starCountCon.setSize(starbg.width, starbg.height);
        this.starCountCon.add([starbg, this.starvalue]);
        this.starCountCon.x = width - 20 * this.dpr;
        this.starCountCon.y = -this.height * 0.5 + 20 * this.dpr;
        this.toggleCon = this.scene.make.container(undefined, false);
        this.toggleCon.y = 20 * this.dpr;
        this.selectLine = this.scene.make.image({ key: UIAtlasName.recast, frame: "Recast_bookmark_select" });
        this.toggleCon.add(this.selectLine);
        this.add([this.composePanel, this.recastPanel, this.mCloseBtn, this.starCountCon, this.toggleCon]);
        this.createOptionButtons();
        this.resize(0, 0);
        super.init();
    }
    protected createOptionButtons() {
        const arr = [{ text: i18n.t("compose.title"), type: 1 }, { text: i18n.t("common.recast"), type: 2 }];
        const allLin = 120 * this.dpr;
        const cellwidth = allLin / arr.length;
        const cellHeight = 20 * this.dpr;
        let posx = -allLin / 2;
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < arr.length; i++) {
            const data = arr[i];
            const item = new ToggleColorButton(this.scene, cellwidth, 20 * this.dpr, this.dpr, data.text, UIHelper.colorStyle("#EEEEEE", 14 * this.dpr));
            item.on(ClickEvent.Tap, this.onToggleButtonHandler, this);
            item.x = posx + cellwidth * 0.5;
            item.setData("item", data.type);
            item.setSize(cellwidth, cellHeight);
            this.toggleCon.add(item);
            item.setChangeColor("#FFFF00");
            item.setNormalColor("#EEEEEE");
            item.setFontStyle("bold");
            posx += cellwidth;
        }
        this.selectLine.y = 15 * this.dpr;
    }
    private onToggleButtonHandler(pointer: any, toggle: ToggleColorButton) {
        if (this.curToggleItem === toggle) return;
        if (this.curToggleItem) {
            this.curToggleItem.isOn = false;
        }
        toggle.isOn = true;
        this.curToggleItem = toggle;
        this.optionType = toggle.getData("item");
        this.selectLine.x = toggle.x;
        if (this.optionType === 1) {
            this.composePanel.visible = true;
            this.recastPanel.visible = false;
        } else if (this.optionType === 2) {
            this.composePanel.visible = false;
            this.recastPanel.visible = true;
            this.recastPanel.setRecasteItemData(this.mShowData, true);
        }
    }
    private onCloseHandler() {
        this.render.renderEmitter(this.key + "_close");
    }
}
