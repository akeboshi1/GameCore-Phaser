import { Button, ClickEvent, GameGridTable } from "apowophaserui";
import { AlignmentType, AxisType, ButtonEventDispatcher, ConstraintType, DynamicImage, GridLayoutGroup, ThreeSliceButton, ToggleColorButton } from "gamecoreRender";
import { UIAtlasName } from "../../../res";
import { Handler, i18n, UIHelper, Url } from "utils";
import { CommonBackground } from "..";
import { UITools } from "../uitool";
import { IExtendCountablePackageItem, IGalleryCombination, IGalleryLevel, IGalleryLevelGroup } from "picaStructure";
export class PicaNewCollectBadgePanel extends Phaser.GameObjects.Container {
    private mBackground: CommonBackground;
    private backButton: ButtonEventDispatcher;
    private mGrid: GameGridTable;
    private dpr: number;
    private zoom: number;
    private send: Handler;
    private collectedData: any[];
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
        this.setSize(w, h);
        this.backButton.x = -this.width * 0.5 + this.backButton.width * 0.5 + 10 * this.dpr;
        this.backButton.y = -this.height * 0.5 + 45 * this.dpr;
    }
    public refreshMask() {
        this.mGrid.resetMask();
    }
    setHandler(send: Handler) {
        this.send = send;
    }

    setRewardsData(datas: any[]) {
        this.collectedData = datas;
    }

    init() {
        this.mBackground = new CommonBackground(this.scene, 0, 0, this.width, this.height, UIAtlasName.illustrate_new, "illustrate_survey_bg", 0xc3dff4);
        const bg2 = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_bg_veins" });
        bg2.y = -this.height * 0.5 + bg2.height * 0.5;
        this.mBackground.add(bg2);
        this.add(this.mBackground);
        this.backButton = UITools.createBackButton(this.scene, this.dpr, this.onBackHandler, this, i18n.t("illustrate.collectbadge"));
        this.createGridTable();
        this.add([this.mBackground, this.backButton, this.mGrid]);
        this.resize();
    }
    private createGridTable() {
        const tableHeight = this.height - 80 * this.dpr;
        const tableWidth = this.width;
        const cellWidth = 77 * this.dpr;
        const cellHeight = 129 * this.dpr;
        const tableConfig = {
            x: 0,
            y: 0,
            table: {
                width: tableWidth,
                height: tableHeight,
                columns: 3,
                cellWidth,
                cellHeight,
                reuseCellContainer: true,
                zoom: this.zoom
            },
            scrollMode: 0,
            clamplChildOY: false,
            createCellContainerCallback: (cell, cellContainer) => {
                const item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new CollectBadgeItem(this.scene, cellWidth, cellHeight, this.dpr, this.zoom);
                }
                cellContainer.setCombinationData(item);
                return cellContainer;
            },
        };
        this.mGrid = new GameGridTable(this.scene, tableConfig);
        this.mGrid.layout();
        this.mGrid.on("cellTap", (cell) => {
            this.onSelectItemHandler(cell);
        });
        this.mGrid.y = -this.height * 0.5 + this.mGrid.height * 0.5;
    }
    private onSelectItemHandler(cell: CollectBadgeItem) {
        // if (this.send) this.send.runWith(["furidetail", cell.groupData]);
        const groupData = cell.combinationData;
    }

    private onBackHandler() {
        if (this.send) this.send.runWith("back");
    }
}

class CollectBadgeItem extends ButtonEventDispatcher {
    public combinationData: IGalleryCombination;
    private bg: Phaser.GameObjects.Image;
    private badgeIcon: DynamicImage;
    private titlebg: Phaser.GameObjects.Image;
    private title: Phaser.GameObjects.Text;
    private countTex: Phaser.GameObjects.Text;
    private rewardsBtn: ThreeSliceButton;
    private send: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene, 0, 0);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
        this.bg = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_badge_bg" });
        this.badgeIcon = new DynamicImage(scene, 0, 0);
        this.badgeIcon.y = -20 * dpr;
        this.titlebg = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_badge_title" });
        this.titlebg.y = 0;
        this.title = this.scene.make.text({ style: UIHelper.colorStyle("#996600", dpr * 11) }).setOrigin(0.5);
        this.title.setFontStyle("bold");
        this.title.y = this.titlebg.y;
        this.countTex = this.scene.make.text({ style: UIHelper.colorStyle("#000000", dpr * 11) }).setOrigin(0.5);
        this.countTex.y = 20 * dpr;
        this.rewardsBtn = new ThreeSliceButton(this.scene, 62 * this.dpr, 25 * this.dpr, UIAtlasName.uicommon, UIHelper.threeRedSmall, UIHelper.threeRedSmall, i18n.t("common.receivereward"));
        this.rewardsBtn.setTextStyle(UIHelper.brownishStyle(this.dpr));
        this.rewardsBtn.setFontStyle("bold");
        this.rewardsBtn.y = this.countTex.y + 20 * dpr;
        this.rewardsBtn.on(ClickEvent.Tap, this.onRewardsHandler, this);
        this.add([this.bg, this.badgeIcon, this.title, this.countTex]);
    }
    public setCombinationData(data: IGalleryCombination) {
        this.combinationData = data;
        const itemData: any = data.requirement[0];
        const url = Url.getOsdRes(itemData.texturePath);
        this.badgeIcon.load(url);
        this.badgeIcon.scale = this.dpr / this.zoom;
        this.title.text = data.name;
        const leng = data.requirement.length;
        this.countTex.text = `${leng}/${leng}`;

    }

    public set select(value: boolean) {
        this.bg.setFrame(value ? "illustrate_survey_reward_icon1" : "illustrate_survey_reward_icon");
    }
    public setHandler(send: Handler) {
        this.send = send;
    }

    private onRewardsHandler() {
        if (this.send) this.send.runWith(["recivedreward", this.combinationData]);
    }
}

class LevelItem extends ButtonEventDispatcher {
    public groupData: IGalleryLevelGroup;
    private bg: Phaser.GameObjects.Image;
    private linebg: Phaser.GameObjects.Image;
    private levelTex: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene, 0, 0);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
        this.linebg = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_lv_bg_line" });
        this.bg = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_lv_bg" });
        this.levelTex = this.scene.make.text({ style: UIHelper.whiteStyle(dpr) });
        this.add([this.linebg, this.bg, this.levelTex]);
    }
    public setLevelData(data: IGalleryLevelGroup) {
        this.groupData = data;
        this.levelTex.text = data.level < 10 ? `0${data.level}` : `${data.level}`;
    }

    public set select(value: boolean) {
        this.bg.setFrame(value ? "illustrate_survey_lv_bg1" : "illustrate_survey_lv_bg");
    }
}
