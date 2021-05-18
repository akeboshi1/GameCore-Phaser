import { Button, ClickEvent, GameGridTable } from "apowophaserui";
import { AlignmentType, AxisType, ButtonEventDispatcher, ConstraintType, DynamicImage, GridLayoutGroup, ThreeSliceButton, ToggleColorButton } from "gamecoreRender";
import { UIAtlasName } from "../../../res";
import { Handler, i18n, UIHelper, Url } from "utils";
import { CommonBackground } from "..";
import { UITools } from "../uitool";
import { IExtendCountablePackageItem, IGalleryCombination, IGalleryLevel, IGalleryLevelGroup } from "picaStructure";
export class PicaNewAlreadyCollectedPanel extends Phaser.GameObjects.Container {
    private mBackground: CommonBackground;
    private backButton: ButtonEventDispatcher;
    private noCombinationTip: Phaser.GameObjects.Container;
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
        this.backButton.x = -this.width * 0.5 + this.backButton.width * 0.5 - 5 * this.dpr;
        this.backButton.y = -this.height * 0.5 + 45 * this.dpr;
    }
    public refreshMask() {
        this.mGrid.resetMask();
    }
    setHandler(send: Handler) {
        this.send = send;
    }

    setCombinationDatas(datas: IGalleryCombination[]) {
        if (datas.length === 0) {
            this.noCombinationTip.visible = true;
            return;
        } else this.noCombinationTip.visible = false;
        this.collectedData = datas;
        this.mGrid.setItems(datas);
    }

    init() {
        this.mBackground = new CommonBackground(this.scene, 0, 0, this.width, this.height, UIAtlasName.illustrate_new, "illustrate_survey_bg", 0xc3dff4);
        const bg2 = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_bg_veins" });
        bg2.y = -this.height * 0.5 + bg2.height * 0.5;
        this.mBackground.add(bg2);
        this.add(this.mBackground);
        this.backButton = UITools.createBackButton(this.scene, this.dpr, this.onBackHandler, this, i18n.t("illustrate.collected"));
        this.createGridTable();
        const tipimg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "task_no" });
        const tiptext = this.scene.make.text({ text: i18n.t("illustrate.nocomniationtip"), style: UIHelper.whiteStyle(this.dpr) }).setOrigin(0.5);
        tiptext.y = tipimg.height * 0.5 + 15 * this.dpr;
        this.noCombinationTip = this.scene.make.container(undefined);
        this.noCombinationTip.add([tipimg, tiptext]);
        this.noCombinationTip.y = -10 * this.dpr;
        this.noCombinationTip.visible = false;
        this.add([this.mBackground, this.backButton, this.mGrid, this.noCombinationTip]);
        this.resize();
    }
    private createGridTable() {
        const tableHeight = this.height - 80 * this.dpr;
        const tableWidth = this.width - 30 * this.dpr;
        const cellWidth = 84 * this.dpr;
        const cellHeight = 138 * this.dpr;
        const tableConfig = {
            x: 0,
            y: 0,
            table: {
                width: tableWidth,
                height: tableHeight,
                columns: 4,
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
                    cellContainer = new CollectedItem(this.scene, cellWidth, cellHeight, this.dpr, this.zoom);
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
        this.mGrid.y = -this.height * 0.5 + 78 * this.dpr + this.mGrid.height * 0.5;
    }
    private onSelectItemHandler(cell: CollectedItem) {
        // if (this.send) this.send.runWith(["furidetail", cell.groupData]);
        const groupData = cell.combinationData;
        if (this.send) this.send.runWith(["showcombination", groupData]);
    }

    private onBackHandler() {
        if (this.send) this.send.runWith("close");
    }
}

class CollectedItem extends ButtonEventDispatcher {
    public combinationData: IGalleryCombination;
    private bg: Phaser.GameObjects.Image;
    private itemIcon: DynamicImage;
    private title: Phaser.GameObjects.Text;
    private line: Phaser.GameObjects.Image;
    private countTex: Phaser.GameObjects.Text;
    private send: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene, 0, 0);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
        this.bg = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_favorites_badge_bg" });
        this.itemIcon = new DynamicImage(scene, 0, 0);
        this.itemIcon.y = -30 * dpr;
        this.title = this.scene.make.text({ style: UIHelper.colorStyle("#996600", dpr * 11) }).setOrigin(0.5);
        this.title.setFontStyle("bold");
        this.title.y = 14 * dpr;
        this.line = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_favorites_badge_line" });
        this.line.y = this.title.y + 13 * dpr;
        this.countTex = this.scene.make.text({ style: UIHelper.colorStyle("#000000", dpr * 11) }).setOrigin(0.5);
        this.countTex.setFontStyle("bold");
        this.countTex.y = this.line.y + 13 * dpr;
        this.add([this.bg, this.itemIcon, this.title, this.line, this.countTex]);
    }
    public setCombinationData(data: IGalleryCombination) {
        this.combinationData = data;
        const itemData: any = data.requirement[0];
        const url = Url.getOsdRes(itemData.texturePath);
        this.itemIcon.load(url);
        this.itemIcon.scale = this.dpr / this.zoom;
        this.title.text = data.name;
        this.title.text = UIHelper.spliceText(this.bg.width - 30 * this.dpr, data.name, 11 * this.dpr, this.scene);
        const leng = data.requirement.length;
        this.countTex.text = `${leng}/${leng}`;

    }

    public set select(value: boolean) {
        this.bg.setFrame(value ? "illustrate_survey_reward_icon1" : "illustrate_survey_reward_icon");
    }
    public setHandler(send: Handler) {
        this.send = send;
    }

    private onRewardHandler() {
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
