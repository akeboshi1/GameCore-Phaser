import { Button, ClickEvent, GameGridTable } from "apowophaserui";
import { AlignmentType, AxisType, ButtonEventDispatcher, ConstraintType, DynamicImage, GridLayoutGroup, ThreeSliceButton, ToggleColorButton } from "gamecoreRender";
import { UIAtlasName } from "../../../res";
import { Handler, i18n, UIHelper, Url } from "utils";
import { CommonBackground } from "..";
import { UITools } from "../uitool";
import { IExtendCountablePackageItem, IGalleryLevel, IGalleryLevelGroup } from "picaStructure";
import { Data } from "tooqinggamephaser";
import { PicaItemTipsPanel } from "../SinglePanel/PicaItemTipsPanel";
export class PicaNewLevelRewardsPanel extends Phaser.GameObjects.Container {
    private mBackground: CommonBackground;
    private backButton: ButtonEventDispatcher;
    private oneKeyBtn: ThreeSliceButton;
    private titlebg: Phaser.GameObjects.Image;
    private titleTex: Phaser.GameObjects.Text;
    private mLevelGrid: GameGridTable;
    private rewardsPanel: RightRewardsPanel;
    private curLevelItem: LevelItem;
    private dpr: number;
    private zoom: number;
    private send: Handler;
    private galleryData: IGalleryLevelGroup[];
    private redMap: Map<number, Phaser.GameObjects.Image> = new Map();
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
        this.backButton.x = -this.width * 0.5 + this.backButton.width * 0.5 -5 * this.dpr;
        this.backButton.y = -this.height * 0.5 + 45 * this.dpr;
        this.oneKeyBtn.x = this.width * 0.5 - this.oneKeyBtn.width * 0.5 - 10 * this.dpr;
        this.oneKeyBtn.y = this.backButton.y;
        this.titlebg.x = this.width * 0.5 - 152 * this.dpr;
        this.titlebg.y = - 260 * this.dpr;
        this.titleTex.x = this.titlebg.x;
        this.titleTex.y = this.titlebg.y;
        this.rewardsPanel.x = this.titleTex.x;
        this.rewardsPanel.y = this.titleTex.y + this.rewardsPanel.height * 0.5 + 35 * this.dpr;
        this.mLevelGrid.y = 25 * this.dpr;
        this.mLevelGrid.x = -this.width * 0.5 + this.mLevelGrid.width - 10 * this.dpr;
    }
    public refreshMask() {
        this.mLevelGrid.resetMask();
    }
    setHandler(send: Handler) {
        this.send = send;
    }

    setRewardsData(gallerys: IGalleryLevelGroup[]) {
        this.galleryData = gallerys;
        this.mLevelGrid.setItems(gallerys);
        for (let i = 0; i < gallerys.length; i++) {
            const data = gallerys[i];
            if ((data.rewards || !data.allReceived)) {
                this.mLevelGrid.setT(i / gallerys.length);
            }
        }
        if (!this.curLevelItem) {
            this.mLevelGrid.setT(1);
            const cell = this.mLevelGrid.getCell(gallerys.length - 1);
            const container = cell ? cell.container : undefined;
            if (container) this.onSelectItemHandler(container);
        }
    }

    init() {
        this.mBackground = new CommonBackground(this.scene, 0, 0, this.width, this.height, UIAtlasName.illustrate_new, "illustrate_survey_bg", 0xc3dff4);
        const bg2 = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_bg_veins" });
        bg2.y = -this.height * 0.5 + bg2.height * 0.5;
        this.mBackground.add(bg2);
        this.add(this.mBackground);
        this.backButton = UITools.createBackButton(this.scene, this.dpr, this.onBackHandler, this, i18n.t("illustrate.progressreward"));

        this.oneKeyBtn = new ThreeSliceButton(this.scene, 62 * this.dpr, 25 * this.dpr, UIAtlasName.uicommon, UIHelper.threeYellowSmall, UIHelper.threeYellowSmall, i18n.t("mail.onekey"));
        this.oneKeyBtn.setTextStyle(UIHelper.brownishStyle(this.dpr));
        this.oneKeyBtn.setFontStyle("bold");

        this.oneKeyBtn.on(ClickEvent.Tap, this.onAllReceiveHandler, this);
        this.titlebg = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_title_bg" });
        this.titleTex = this.scene.make.text({ style: UIHelper.colorStyle("#996600", 15 * this.dpr) }).setOrigin(0.5);
        this.createGridTable();
        this.rewardsPanel = new RightRewardsPanel(this.scene, 266 * this.dpr, 443 * this.dpr, this.dpr, this.zoom);
        this.rewardsPanel.setHandler(new Handler(this, this.onReceivedHandler));
        this.add([this.mBackground, this.backButton, this.oneKeyBtn, this.titlebg, this.titleTex, this.rewardsPanel, this.mLevelGrid]);
        this.resize();
    }
    private createGridTable() {
        const tableHeight = this.height - 110 * this.dpr;
        const tableWidth = 50 * this.dpr;
        const cellWidth = 48 * this.dpr;
        const cellHeight = 85 * this.dpr;
        const tableConfig = {
            x: 0,
            y: 0,
            table: {
                width: tableWidth,
                height: tableHeight,
                columns: 1,
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
                    cellContainer = new LevelItem(this.scene, cellWidth, cellHeight, this.dpr, this.zoom);
                }
                cellContainer.setLevelData(item);
                this.setDefaultItem(cellContainer, item);
                return cellContainer;
            },
        };
        this.mLevelGrid = new GameGridTable(this.scene, tableConfig);
        this.mLevelGrid.layout();
        this.mLevelGrid.on("cellTap", (cell) => {
            this.onSelectItemHandler(cell);
        });
    }
    private onSelectItemHandler(cell: LevelItem) {
        if (this.curLevelItem === cell) return;
        if (this.curLevelItem) this.curLevelItem.select = false;
        cell.select = true;
        this.curLevelItem = cell;
        const groupData = cell.groupData;
        this.titleTex.text = i18n.t("illustrate.levelrewardtips", { name: groupData.level });
        this.rewardsPanel.setRewardsData(groupData);
    }

    private setDefaultItem(cell: LevelItem, data: IGalleryLevelGroup) {
        if (((data.rewards || !data.allReceived) && !this.curLevelItem) || (this.curLevelItem && this.curLevelItem.groupData.level === data.level)) {
            this.curLevelItem = undefined;
            this.onSelectItemHandler(cell);
        }
    }
    private onReceivedHandler(data: IGalleryLevel) {
        if (this.send) this.send.runWith(["rewards", data.id]);
    }
    private onAllReceiveHandler() {
        if (this.send) this.send.runWith("allrewards");
    }
    private onBackHandler() {
        if (this.send) this.send.runWith("back");
    }
}

class RightRewardsPanel extends Phaser.GameObjects.Container {
    private rightBg: Phaser.GameObjects.Graphics;
    private gridLayout: GridLayoutGroup;
    private rewardsTips: Phaser.GameObjects.Text;
    private dpr: number;
    private zoom: number;
    private gridItems: RewardItem[] = [];
    private send: Handler;
    private progress: number = 0;
    private curItem: RewardItem;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
        this.rightBg = this.scene.make.graphics(undefined, false);
        this.rightBg.clear();
        this.rightBg.fillStyle(0x7A9EF8, 1);
        this.rightBg.fillRoundedRect(-width * 0.5, -height * 0.5, width, height);
        const cellHeight = 124 * this.dpr;
        const conWidth = 108 * dpr, conHeight = height;
        this.gridLayout = new GridLayoutGroup(this.scene, conWidth, conHeight, {
            cellSize: new Phaser.Math.Vector2(conWidth, cellHeight),
            space: new Phaser.Math.Vector2(0, 17 * this.dpr),
            startAxis: AxisType.Horizontal,
            constraint: ConstraintType.FixedColumnCount,
            constraintCount: 1,
            alignmentType: AlignmentType.UpperCenter
        });
        this.rewardsTips = this.scene.make.text({ style: UIHelper.colorStyle("#1A1B1B", 11 * dpr) }).setOrigin(0, 0.5);
        this.rewardsTips.x = -width * 0.5;
        this.rewardsTips.y = height * 0.5 + 15 * dpr;
        this.add([this.rightBg, this.gridLayout, this.rewardsTips]);
    }

    public setRewardsData(group: IGalleryLevelGroup) {
        this.progress = group.progress;
        this.setGridItems(group.gallery);
    }
    public setHandler(send: Handler) {
        this.send = send;
    }
    private setGridItems(datas: any[]) {
        for (const item of this.gridItems) {
            item.visible = false;
        }
        const itemWidth = 108 * this.dpr, itemHeight = 124 * this.dpr;
        for (let i = 0; i < datas.length; i++) {
            let item: RewardItem;
            const data = datas[i];
            if (i < this.gridItems.length) {
                item = this.gridItems[i];
            } else {
                item = new RewardItem(this.scene, itemWidth, itemHeight, this.dpr, this.zoom);
                item.on(ClickEvent.Tap, this.onSelectHandler, this);
                item.setHandler(this.send);
                this.gridLayout.add(item);
                this.gridItems.push(item);
            }
            item.setItemData(data);
            item.visible = true;
            this.setDefaultItem(item, data);
        }
        this.gridLayout.Layout();
    }

    private onSelectHandler(pointer, obj: RewardItem, showtips: boolean = true) {
        if (this.curItem) this.curItem.select = false;
        obj.select = true;
        this.curItem = obj;
        this.rewardsTips.text = i18n.t("illustrate.meetrewardtips", { name: obj.galleryData.exp });
        if (showtips) PicaItemTipsPanel.Inst.showTips(obj, obj.galleryData.rewardItems);
    }
    private setDefaultItem(cell: RewardItem, data: IGalleryLevel) {
        if (!this.curItem || this.curItem.galleryData.id === data.id) {
            this.curItem = undefined;
            this.onSelectHandler(undefined, cell, false);
        }
    }
}
class RewardItem extends ButtonEventDispatcher {
    public galleryData: IGalleryLevel;
    private bg: Phaser.GameObjects.Image;
    private itemIcon: DynamicImage;
    private itemCount: Phaser.GameObjects.Text;
    private rewardBtn: ThreeSliceButton;
    private send: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene, 0, 0);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
        this.bg = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_reward_icon" });
        this.itemIcon = new DynamicImage(scene, 0, 0);
        this.itemIcon.y = -10 * dpr;
        this.itemCount = this.scene.make.text({ style: UIHelper.whiteStyle(dpr) }).setOrigin(0.5);
        this.itemCount.x = 0 * dpr;
        this.itemCount.y = 17* dpr;
        this.rewardBtn = new ThreeSliceButton(this.scene, 62 * this.dpr, 25 * this.dpr, UIAtlasName.uicommon, UIHelper.threeRedSmall, UIHelper.threeRedSmall, i18n.t("common.receivereward"));
        this.rewardBtn.y = 40 * dpr;
        this.rewardBtn.setTextStyle(UIHelper.whiteStyle(this.dpr));
        this.rewardBtn.setFontStyle("bold");
        this.rewardBtn.on(ClickEvent.Tap, this.onRewardHandler, this);
        this.add([this.bg, this.itemIcon, this.itemCount, this.rewardBtn]);
        this.enable = true;
    }
    public setItemData(data: IGalleryLevel) {
        this.galleryData = data;
        const itemData = data.rewardItems;
        const url = Url.getOsdRes(itemData.texturePath);
        this.itemIcon.load(url, this, () => {
            this.itemIcon.visible = true;
        });
        this.itemIcon.scale = this.dpr / this.zoom;
        this.itemCount.text = "x" + itemData.count;
        if (data.received === 1) {
            this.rewardBtn.setFrameNormal(UIHelper.threeGraySmall);
            this.rewardBtn.setText(i18n.t("common.receivereward"));
            this.rewardBtn.disInteractive();
        } else if (data.received === 2) {
            this.rewardBtn.setFrameNormal(UIHelper.threeRedSmall);
            this.rewardBtn.setText(i18n.t("common.receivereward"));
            this.rewardBtn.setInteractive();
        } else if (data.received === 3) {
            this.rewardBtn.setFrameNormal(UIHelper.threeGraySmall);
            this.rewardBtn.setText(i18n.t("common.received"));
            this.rewardBtn.disInteractive();
        }
    }

    public set select(value: boolean) {
        this.bg.setFrame(value ? "illustrate_survey_reward_icon1" : "illustrate_survey_reward_icon");
    }
    public setHandler(send: Handler) {
        this.send = send;
    }

    private onRewardHandler() {
        if (this.send) this.send.runWith([this.galleryData]);
    }
}

class LevelItem extends ButtonEventDispatcher {
    public groupData: IGalleryLevelGroup;
    private bg: Phaser.GameObjects.Image;
    private linebg: Phaser.GameObjects.Image;
    private iconImg: Phaser.GameObjects.Image;
    private levelTex: Phaser.GameObjects.Text;
    private redImg: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene, 0, 0);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
        this.linebg = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_lv_bg_line" });
        this.bg = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_lv_bg" });
        this.levelTex = this.scene.make.text({ style: UIHelper.whiteStyle(dpr) }).setOrigin(0.5);
        this.iconImg = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_lv_icon_s" });
        this.redImg = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_lv_prompt_s" });
        this.redImg.x = -this.iconImg.width * 0.5;
        this.redImg.y = -this.iconImg.height * 0.5;
        this.add([this.linebg, this.bg, this.iconImg, this.levelTex, this.redImg]);
    }
    public setLevelData(data: IGalleryLevelGroup) {
        this.groupData = data;
        this.levelTex.text = data.level < 10 ? `0${data.level}` : `${data.level}`;
        this.redImg.visible = data.rewards;
    }

    public set select(value: boolean) {
        if (value) {
            this.bg.setFrame("illustrate_survey_lv_bg1");
            this.iconImg.setFrame("illustrate_survey_lv_icon");
            this.redImg.visible = false;
        } else {
            this.bg.setFrame("illustrate_survey_lv_bg");
            this.iconImg.setFrame("illustrate_survey_lv_icon_s");
            this.redImg.visible = this.groupData.rewards;
        }
    }
}
