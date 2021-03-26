import { NineSlicePatch, GameGridTable, Button, ClickEvent, BBCodeText, NineSliceButton } from "apowophaserui";
import { AlignmentType, AxisType, BackgroundScaleButton, ButtonEventDispatcher, CommonBackground, ConstraintType, DynamicImage, GridLayoutGroup, ImageValue, ProgressMaskBar, ThreeSlicePath, ToggleColorButton } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { Font, Handler, i18n, TimeUtils, UIHelper, Url } from "utils";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { ItemButton } from "picaRender";
import { ICountablePackageItem } from "picaStructure";
export class PicaIllustratedDetailPanel extends Phaser.GameObjects.Container {
    private bg: CommonBackground;
    private acquire: ButtonEventDispatcher;
    private acquireTex: Phaser.GameObjects.Text;
    private horProgress: ProgressMaskBar;
    private horRewards: Button;
    private curToggle: ToggleColorButton;
    private topCon: Phaser.GameObjects.Container;
    private toggleCon: Phaser.GameObjects.Container;
    private selectLine: Phaser.GameObjects.Image;
    private horLevelTex: Phaser.GameObjects.Text;
    private mGameGrid: GameGridTable;
    private dpr: number;
    private zoom: number;
    private send: Handler;
    private optionType: number;
    private curSelectItem: IllustratedItem;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.init();
        this.setInteractive();
    }
    resize(width?: number, height?: number) {
        const w = width || this.width;
        const h = height || this.height;
        const topOffset = 20 * this.dpr;
        this.topCon.y = -h * 0.5 + this.topCon.height * 0.5 + topOffset;
        this.horProgress.refreshMask();
        const tableHeight = this.height - this.topCon.height - topOffset - 23 * this.dpr;
        this.mGameGrid.y = this.topCon.y + this.topCon.height * 0.5 + tableHeight * 0.5 + 30 * this.dpr;
        this.mGameGrid.setSize(w - 20 * this.dpr, tableHeight);
        this.mGameGrid.resetMask();
        this.setSize(w, h);
    }

    setHandler(send: Handler) {
        this.send = send;
    }

    setGallaryData(content: any) { // op_client.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_UPDATE_GALLERY

        this.mGameGrid.setItems(new Array(60));
        this.horProgress.setProgress(content.reward1Progress, content.reward1Max);
        this.acquireTex.text = `${content.reward2Progress}/${content.reward2Max}`;
        this.horLevelTex.text = content.reward1NextIndex + "";
    }

    init() {
        this.topCon = this.scene.make.container(undefined, false);
        this.topCon.setSize(this.width, 100 * this.dpr);
        this.acquire = new ButtonEventDispatcher(this.scene, 0, 0, true);
        this.acquire.setSize(42 * this.dpr, 38 * this.dpr);
        this.acquire.enable = true;
        this.acquire.on(ClickEvent.Tap, this.onAcquireRewardsHandler, this);
        const acquireImg = this.scene.make.image({ key: UIAtlasName.illustrate, frame: "illustrate_badge_icon" });
        this.acquireTex = this.scene.make.text({ style: UIHelper.whiteStyle(this.dpr, 10) }).setOrigin(0.5);
        this.acquireTex.setStroke("#26365A", 2 * this.dpr);
        this.acquireTex.y = acquireImg.y + acquireImg.height * 0.5 + 3 * this.dpr;
        this.acquire.add([acquireImg, this.acquireTex]);
        this.acquire.x = this.topCon.width * 0.5 - this.acquire.width * 0.5 - 20 * this.dpr;
        this.acquire.y = -this.topCon.height * 0.5 + this.acquire.height * 0.5 + 15 * this.dpr;
        this.toggleCon = this.scene.make.container(undefined, false);
        this.selectLine = this.scene.make.image({ key: UIAtlasName.illustrate, frame: "illustrate_nav_select" });
        this.toggleCon.add(this.selectLine);
        this.toggleCon.y = 0;
        this.horProgress = new ProgressMaskBar(this.scene, UIAtlasName.illustrate, "illustrate_survey_lv_bottom", "illustrate_survey_lv_top", UIHelper.whiteStyle(this.dpr, 6));
        this.horProgress.y = this.toggleCon.y + this.toggleCon.height * 0.5 + 50 * this.dpr;
        this.horProgress.x = -5 * this.dpr;
        const levelBg = this.scene.make.image({ key: UIAtlasName.illustrate, frame: "illustrate_survey_lv_icon" });
        levelBg.x = this.horProgress.x - this.horProgress.width * 0.5 - levelBg.width * 0.5 - 8 * this.dpr;
        levelBg.y = this.horProgress.y;
        this.horLevelTex = this.scene.make.text({ style: UIHelper.whiteStyle(this.dpr, 12) }).setOrigin(0.5);
        this.horLevelTex.setFontStyle("bold");
        this.horLevelTex.x = levelBg.x;
        this.horLevelTex.y = levelBg.y;
        this.horRewards = new Button(this.scene, UIAtlasName.illustrate, "illustrate_survey_icon", "illustrate_survey_icon");
        this.horRewards.x = this.horProgress.x + this.horProgress.width * 0.5 + 5 * this.dpr + this.horRewards.width * 0.5;
        this.horRewards.y = this.horProgress.y;
        this.horRewards.on(ClickEvent.Tap, this.onHorRewardsHandler, this);
        this.topCon.add([this.acquire, this.toggleCon, this.horProgress, levelBg, this.horLevelTex, this.horRewards]);
        this.createOptionButtons();
        const tableHeight = this.height - this.topCon.height - 23 * this.dpr;
        const cellWidth = 87 * this.dpr;
        const cellHeight = 87 * this.dpr;
        const tableConfig = {
            x: 0,
            y: 10 * this.dpr,
            table: {
                width: this.width - 20 * this.dpr,
                height: tableHeight,
                columns: 4,
                cellWidth,
                cellHeight,
                reuseCellContainer: true,
                cellPadX: -5 * this.dpr,
                zoom: this.zoom
            },
            scrollMode: 0,
            clamplChildOY: false,
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene, index = this.mGameGrid.items.length - cell.index,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new IllustratedItem(this.scene, cellWidth, cellHeight, this.dpr, this.zoom);
                }
                cellContainer.setItemData(item, index);
                return cellContainer;
            },
        };
        this.mGameGrid = new GameGridTable(this.scene, tableConfig);
        this.mGameGrid.layout();
        this.mGameGrid.on("cellTap", (cell) => {
            this.onSelectItemHandler(cell);
        });
        this.add([this.topCon, this.mGameGrid]);
        this.resize();
    }
    protected createOptionButtons() {
        const arr = [{ text: i18n.t("illustrate.title"), type: 1 }, { text: i18n.t("illustrate.collect"), type: 2 }];
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

    }
    private onHorRewardsHandler() {
        if (this.send) this.send.runWith(["rewards", 1]);
    }

    private onAcquireRewardsHandler() {
        if (this.send) this.send.runWith(["rewards", 2]);
    }
    private onSelectItemHandler(cell: IllustratedItem) {
        // if (this.curSelectItem) this.curSelectItem.select = true;
        cell.showTips();
    }
}

class IllustratedItem extends ItemButton {
    private codeTex: Phaser.GameObjects.Text;
    private star: Phaser.GameObjects.Image;
    private surveyImg: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene, undefined, undefined, dpr, zoom, false);
        this.setSize(width, height);
        this.codeTex = this.scene.make.text({ style: UIHelper.whiteStyle(dpr, 10) }).setOrigin(0, 0.5);
        this.codeTex.x = -this.width * 0.5;
        this.codeTex.y = this.height * 0.5 + 4 * dpr;
        this.star = this.scene.make.image({ key: UIAtlasName.illustrate, frame: "illustrate_survey_star_empty" });
        this.star.x = this.width * 0.5 - this.star.width * 0.5 - 2 * dpr;
        this.star.y = this.codeTex.y;
        this.star.visible = false;
        this.surveyImg = this.scene.make.image({ key: UIAtlasName.illustrate, frame: "illustrate_survey_nohave" });
        this.add([this.codeTex, this.star]);
    }

    setItemData(item: ICountablePackageItem) {
        super.setItemData(item, false);
        if (item) this.codeTex.text = item.code;
        const status = item["status"];
        this.surveyImg.visible = status === 1 ? true : false;
    }
}

class IllustratedCollectItem extends Phaser.GameObjects.Container {
    private titleTex: Phaser.GameObjects.Text;
    private desTex: Phaser.GameObjects.Text;
    private progress: ProgressMaskBar;
    private rewardsBtn: Button;
    private gridLayout: GridLayoutGroup;
    private topCon: Phaser.GameObjects.Container;
    private dpr: number;
    private zoom: number;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.topCon = this.scene.make.container(undefined, false);
        this.topCon.setSize(this.width, 58 * this.dpr);
        this.titleTex = this.scene.make.text({ style: UIHelper.whiteStyle(dpr) }).setOrigin(0, 0.5);
        this.titleTex.y = 20 * dpr;
        this.titleTex.setFontStyle("bold");
        this.desTex = this.scene.make.text({ style: UIHelper.colorStyle("#006ED4", 10 * dpr) }).setOrigin(0, 0.5);
        this.desTex.y = this.titleTex.y + 20 * dpr;
        this.progress = new ProgressMaskBar(this.scene, UIAtlasName.illustrate, "illustrate_survey_lv_bottom", "illustrate_survey_lv_top", UIHelper.whiteStyle(this.dpr, 6));
        this.progress.y = this.desTex.y + this.progress.height * 0.5 + 50 * this.dpr;
        this.progress.x = -5 * this.dpr;
        this.rewardsBtn = new Button(this.scene, UIAtlasName.illustrate, "illustrate_survey_icon", "illustrate_survey_icon");
        this.rewardsBtn.x = this.progress.x + this.progress.width * 0.5 + 5 * this.dpr + this.progress.width * 0.5;
        this.rewardsBtn.y = this.progress.y;
        this.rewardsBtn.on(ClickEvent.Tap, this.onRewardsHandler, this);
        this.topCon.add([this.titleTex, this.desTex, this.progress, this.rewardsBtn]);
        const conWidth = 305 * this.dpr, conHeight = 330 * this.dpr;
        this.gridLayout = new GridLayoutGroup(this.scene, conWidth, conHeight, {
            cellSize: new Phaser.Math.Vector2(304 * this.dpr, 96 * this.dpr),
            space: new Phaser.Math.Vector2(0, 21 * this.dpr),
            startAxis: AxisType.Horizontal,
            constraint: ConstraintType.FixedColumnCount,
            constraintCount: 1,
            alignmentType: AlignmentType.UpperCenter
        });
        this.add(this.gridLayout);
    }

    private onRewardsHandler() {

    }
}
