import { Button, ClickEvent, GameGridTable, NineSliceButton } from "apowophaserui";
import { AlignmentType, AxisType, ButtonEventDispatcher, ConstraintType, DynamicImage, GridLayoutGroup, ThreeSliceButton, ToggleColorButton } from "gamecoreRender";
import { UIAtlasName } from "../../../res";
import { Handler, i18n, UIHelper, Url } from "utils";
import { CommonBackground } from "..";
import { UITools } from "../uitool";
import { ICountablePackageItem, IFameLevel, IGalleryLevel, IGalleryLevelGroup } from "picaStructure";
import { PicaItemTipsPanel } from "../SinglePanel/PicaItemTipsPanel";
import { BackgroundText, ItemButton } from "../Components";
export class PicaPrestigeLevelPanel extends Phaser.GameObjects.Container {
    private mBackground: CommonBackground;
    private backButton: ButtonEventDispatcher;
    private oneKeyBtn: ThreeSliceButton;
    private titleTex: BackgroundText;
    private mLevelGrid: GameGridTable;
    private rewardsPanel: RightRewardsPanel;
    private curLevelItem: LevelItem;
    private dpr: number;
    private zoom: number;
    private send: Handler;
    private fameDatas: IFameLevel[];
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
        this.backButton.x = -this.width * 0.5 + this.backButton.width * 0.5;
        this.backButton.y = -this.height * 0.5 + 35 * this.dpr;
        this.oneKeyBtn.x = this.width * 0.5 - this.oneKeyBtn.width * 0.5 - 10 * this.dpr;
        this.oneKeyBtn.y = this.backButton.y;
        this.titleTex.x = this.width * 0.5 - 152 * this.dpr;
        this.titleTex.y = this.backButton.y + 60 * this.dpr;
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

    setRewardsData(fames: IFameLevel[]) {
        this.fameDatas = fames;
        this.mLevelGrid.setItems(fames);
        for (let i = 0; i < fames.length; i++) {
            const data = fames[i];
            if ((data.rewardItems || !data.allReceived)) {
                this.mLevelGrid.setT(i / fames.length);
                break;
            }
        }
        if (!this.curLevelItem) {
            this.mLevelGrid.setT(1);
            const cell = this.mLevelGrid.getCell(fames.length - 1);
            const container = cell ? cell.container : undefined;
            if (container) this.onSelectItemHandler(container);
        }
    }

    init() {
        this.mBackground = new CommonBackground(this.scene, 0, 0, this.width, this.height);
        const bg2 = this.scene.make.image({ key: UIAtlasName.prestige, frame: "prestige_bg_texture" });
        bg2.y = -this.height * 0.5 + bg2.height * 0.5;
        this.mBackground.add(bg2);
        this.add(this.mBackground);
        this.backButton = UITools.createBackButton(this.scene, this.dpr, this.onBackHandler, this, i18n.t("prestige.rewards"));

        this.oneKeyBtn = new ThreeSliceButton(this.scene, 62 * this.dpr, 25 * this.dpr, UIAtlasName.uicommon, UIHelper.threeYellowSmall, UIHelper.threeYellowSmall, i18n.t("mail.onekey"));
        this.oneKeyBtn.setTextStyle(UIHelper.brownishStyle(this.dpr));
        this.oneKeyBtn.setFontStyle("bold");

        this.oneKeyBtn.on(ClickEvent.Tap, this.onAllReceiveHandler, this);
        this.titleTex = new BackgroundText(this.scene, UIAtlasName.prestige, "prestige_title_bg", i18n.t("prestige.level"), this.dpr);
        this.titleTex.setColor("#6255DE");
        this.titleTex.setFontStyle("bold");
        this.createGridTable();
        this.rewardsPanel = new RightRewardsPanel(this.scene, 266 * this.dpr, 460 * this.dpr, this.dpr, this.zoom);
        this.rewardsPanel.setHandler(new Handler(this, this.onReceivedHandler));
        this.add([this.mBackground, this.backButton, this.oneKeyBtn, this.titleTex, this.rewardsPanel, this.mLevelGrid]);
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
        this.titleTex.setText(i18n.t("prestige.level") + cell.groupData.level);
        this.rewardsPanel.setRewardsData(groupData);
    }

    private setDefaultItem(cell: LevelItem, data: IGalleryLevelGroup) {
        if (((data.rewards || !data.allReceived) && !this.curLevelItem) || (this.curLevelItem && this.curLevelItem.groupData.level === data.level)) {
            this.curLevelItem = undefined;
            this.onSelectItemHandler(cell);
        }
    }
    private onReceivedHandler(tag: string, data: IFameLevel) {
        if (this.send) this.send.runWith(["rewards", data.level]);
    }
    private onAllReceiveHandler() {
        if (this.send) this.send.runWith("allrewards");
    }
    private onBackHandler() {
        if (this.send) this.send.runWith("back");
    }
}

class RightRewardsPanel extends Phaser.GameObjects.Container {
    private gridLayout: GridLayoutGroup;
    private dpr: number;
    private zoom: number;
    private gridItems: RewardItem[] = [];
    private receiveButton: NineSliceButton;
    private send: Handler;
    private fameData: IFameLevel;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
        const cellHeight = 124 * this.dpr;
        const conWidth = 130 * dpr, conHeight = height;
        this.gridLayout = new GridLayoutGroup(this.scene, conWidth, conHeight, {
            cellSize: new Phaser.Math.Vector2(conWidth, cellHeight),
            space: new Phaser.Math.Vector2(0, 17 * this.dpr),
            startAxis: AxisType.Horizontal,
            constraint: ConstraintType.FixedColumnCount,
            constraintCount: 2,
            alignmentType: AlignmentType.UpperCenter
        });
        this.receiveButton = new NineSliceButton(scene, 0, 0, 143 * dpr, 40 * dpr, UIAtlasName.uicommon, "red_btn_normal", i18n.t("common.receivereward"), dpr, zoom, UIHelper.button(dpr));
        this.receiveButton.setTextStyle(UIHelper.whiteStyle(dpr, 16));
        this.receiveButton.setFontStyle("bold");
        this.receiveButton.on(ClickEvent.Tap, this.onReceiveHandler, this);
        this.receiveButton.y = height * 0.5 - this.receiveButton.height * 0.5 + 30 * dpr;
        this.add([this.gridLayout, this.receiveButton]);
    }

    public setRewardsData(group: IFameLevel) {
        this.fameData = group;
        this.setGridItems(group.rewardItems);
        if (group.allReceived || !group.haveReward) {
            this.receiveButton.disInteractive();
            this.receiveButton.setFrameNormal("butt_gray");
        } else {
            this.receiveButton.setInteractive();
            this.receiveButton.setFrameNormal("red_btn_normal");
        }
    }
    public setHandler(send: Handler) {
        this.send = send;
    }
    private setGridItems(datas: any[]) {
        for (const item of this.gridItems) {
            item.visible = false;
        }
        for (let i = 0; i < datas.length; i++) {
            let item: RewardItem;
            const data = datas[i];
            if (i < this.gridItems.length) {
                item = this.gridItems[i];
            } else {
                item = new RewardItem(this.scene, this.dpr, this.zoom);
                item.setHandler(this.send);
                this.gridLayout.add(item);
                this.gridItems.push(item);
            }
            item.setItemData(data);
            item.visible = true;
        }
        this.gridLayout.Layout();
        this.gridLayout.y = -this.height * 0.5 + this.gridLayout.height * 0.5;
    }

    private onReceiveHandler() {
        if (this.send) this.send.runWith(["rewards", this.fameData]);
    }

}
class RewardItem extends ButtonEventDispatcher {
    public itemData: ICountablePackageItem;
    private bg: Phaser.GameObjects.Image;
    private itemButton: ItemButton;
    private send: Handler;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
        super(scene, 0, 0);
        this.dpr = dpr;
        this.zoom = zoom;
        this.bg = this.scene.make.image({ key: UIAtlasName.prestige, frame: "prestige_reward_bg" });
        this.setSize(this.bg.width, this.bg.height);
        this.itemButton = new ItemButton(scene, undefined, undefined, dpr, zoom, false);
        this.itemButton.y = -15 * dpr;
        this.add([this.bg, this.itemButton]);
        this.enable = true;
        this.on(ClickEvent.Tap, this.onRewardHandler, this);
    }
    public setItemData(data: ICountablePackageItem) {
        this.itemData = data;
        this.itemButton.setItemData(data);
    }

    public setHandler(send: Handler) {
        this.send = send;
    }

    private onRewardHandler() {
        this.itemButton.showTips();
    }
}

class LevelItem extends ButtonEventDispatcher {
    public groupData: IFameLevel;
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
        this.linebg = this.scene.make.image({ key: UIAtlasName.prestige, frame: "illustrate_survey_lv_bg_line" });
        this.bg = this.scene.make.image({ key: UIAtlasName.prestige, frame: "illustrate_survey_lv_bg" });
        this.levelTex = this.scene.make.text({ style: UIHelper.whiteStyle(dpr) }).setOrigin(0.5);
        this.iconImg = this.scene.make.image({ key: UIAtlasName.prestige, frame: "illustrate_survey_lv_icon_s" });
        this.redImg = this.scene.make.image({ key: UIAtlasName.prestige, frame: "illustrate_survey_lv_prompt_s" });
        this.redImg.x = -this.iconImg.width * 0.5;
        this.redImg.y = -this.iconImg.height * 0.5;
        this.add([this.linebg, this.bg, this.iconImg, this.levelTex, this.redImg]);
    }
    public setLevelData(data: IFameLevel) {
        this.groupData = data;
        this.levelTex.text = data.level < 10 ? `0${data.level}` : `${data.level}`;
        this.redImg.visible = data.haveReward;
    }

    public set select(value: boolean) {
        if (value) {
            this.bg.setFrame("illustrate_survey_lv_bg1");
            this.iconImg.setFrame("illustrate_survey_lv_icon");
            this.redImg.visible = false;
        } else {
            this.bg.setFrame("illustrate_survey_lv_bg");
            this.iconImg.setFrame("illustrate_survey_lv_icon_s");
            this.redImg.visible = this.groupData.haveReward;
        }
    }
}
