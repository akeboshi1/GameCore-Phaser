import { Font } from "../../game/core/utils/font";
import { Handler } from "../../Handler/Handler";
import { DynamicImage } from "../components/dynamic.image";
import { UIAtlasKey } from "../ui.atals.name";
import { i18n } from "../../game/core/utils/i18n";
import { SecondaryMenuPanel } from "./SecondaryMenuPanel";
import { TextButton } from "../components/TextButton";
import { op_client, } from "pixelpai_proto";
import { GameGridTable, TabButton, Button, ClickEvent, NineSliceButton, NineSlicePatch } from "apowophaserui";

export class PicBusinessStreetListPanel extends Phaser.GameObjects.Container {
    private gridtable: GameGridTable;
    private dpr: number;
    private key: string;
    private key2: string;
    private zoom: number;
    private historyHandler: Handler;
    private rankHandler: Handler;
    private backHandler: Handler;
    private queryHandler: Handler;
    private enterHandler: Handler;
    private secondaryPanel: SecondaryMenuPanel;
    private curCategoryType: CategoryType = CategoryType.popularity;
    private subCategory: string;
    private curSubCategoryItem: any;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string, key2: string) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.key2 = key2;
        this.zoom = zoom;
        this.setSize(width, height);
        this.create();
    }

    public setIndustryModels(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_INDUSTRY_MODELS) {
        const att = [{ text: i18n.t("business_street.popularity"), data: { categoryType: CategoryType.popularity } }, { text: i18n.t("business_street.praise"), data: { categoryType: CategoryType.praise } }];
        const storeTypeArr = [];
        for (const ind of content.industry) {
            for (const item of ind.roomModels) {
                if (storeTypeArr.indexOf(item.storeType) === -1) {
                    storeTypeArr.push({ type: item.storeType, name: item.name });
                }
            }
        }
        this.secondaryPanel.setCategories(TabButton, att, {
            width: 88 * this.dpr,
            height: 27 * this.dpr,
            key: this.key2,
            normalFrame: "navigation_bar_click",
            downFrame: "navigation_bar_click",
            textStyle: {
                fontSize: 14 * this.dpr,
                fontFamily: Font.DEFULT_FONT,
                color: "#ffffff"
            }
        });
        this.secondaryPanel.setSubItems(storeTypeArr);
    }

    public setStreetListData(datas: op_client.IEditModeRoom[]) {
        this.gridtable.setT(0);
        this.gridtable.setItems(datas);
    }

    public setHandler(history: Handler, rank: Handler, back: Handler, query: Handler, enter: Handler) {
        this.historyHandler = history;
        this.rankHandler = rank;
        this.backHandler = back;
        this.queryHandler = query;
        this.enterHandler = enter;
    }

    public resetMask() {
        this.gridtable.resetMask();
    }

    protected create() {
        const posy = -this.height * 0.5;
        const posx = -this.width * 0.5;
        const storebg = this.scene.make.image({ key: this.key, frame: "store_icon" });
        storebg.x = posx + 30 * this.dpr;
        storebg.y = posy + 6 * this.dpr;
        this.add(storebg);
        const mfont = `bold ${13 * this.dpr}px ${Font.BOLD_FONT}`;
        const storex = storebg.x + storebg.width * 0.5 + 10 * this.dpr;
        const storeTitle = this.scene.make.text({ x: storex, y: storebg.y, text: i18n.t("business_street.street"), style: { font: mfont, bold: true, color: "#FFC51A" } }).setOrigin(0, 0.5);
        storeTitle.setStroke("#553100", 2 * this.dpr);
        this.add(storeTitle);
        this.secondaryPanel = new SecondaryMenuPanel(this.scene, 0, posy + 56 * this.dpr, this.width, 60 * this.dpr, this.dpr, this.zoom, {
            x: 0,
            y: -15 * this.dpr,
            width: this.width - 30 * this.dpr,
            height: 30 * this.dpr,
            zoom: this.zoom,
            dpr: this.dpr,
            orientation: 1
        });
        this.add(this.secondaryPanel);
        const scrollbg = this.scene.make.image({ key: this.key2, frame: "navigation_bar" });
        this.secondaryPanel.gameScroll.addAt(scrollbg);
        this.secondaryPanel.createGrideTable(0, 13 * this.dpr, this.width - 30 * this.dpr, 40 * this.dpr, 65 * this.dpr, 40 * this.dpr, (cell, cellContainer) => {
            const item = cell.item;
            if (!cellContainer) {
                cellContainer = new TextButton(this.scene, this.dpr, this.zoom);
                cellContainer.setFontSize(13 * this.dpr);
            }
            const itemData = cellContainer.getData("itemData");
            if (itemData !== item) {
                cellContainer.setText(item.name);
                cellContainer.setData("itemData", item);
                if (this.subCategory === item.type) {
                    cellContainer.changeDown();
                } else cellContainer.changeNormal();
            }

            return cellContainer;
        });
        this.secondaryPanel.setHandler(new Handler(this, this.onCategoryHandler), new Handler(this, this.onSubCategoryHandle));
        const gridbg = this.scene.make.image({ key: this.key2, frame: "navigation_bar_2" });
        this.secondaryPanel.gridTable.addAt(gridbg);
        const gridWdith = this.width;
        const gridHeight = this.height - 130 * this.dpr;
        const gridY = posy + 88 * this.dpr + gridHeight * 0.5;
        this.gridtable = this.createGrideTable(0, gridY, gridWdith, gridHeight, 256 * this.dpr, 50 * this.dpr);

        const rankBtn = new Button(this.scene, this.key2, "ranking", "ranking");
        const btnX = -posx - rankBtn.width * 0.5 - 20 * this.dpr;
        rankBtn.setPosition(btnX, posy + 6 * this.dpr);
        rankBtn.on(String(ClickEvent.Tap), this.onRankHandler, this);
        this.add(rankBtn);

        const historyBtn = new Button(this.scene, this.key2, "history", "history");
        historyBtn.setPosition(btnX - rankBtn.width * 0.5 - historyBtn.width * 0.5 - 10 * this.dpr, posy + 6 * this.dpr);
        historyBtn.on(String(ClickEvent.Tap), this.onHistoryHandler, this);
        this.add(historyBtn);

        const backBtn = new NineSliceButton(this.scene, 0, this.height * 0.5 - 7 * this.dpr, 92 * this.dpr, 34 * this.dpr, UIAtlasKey.commonKey, "red_btn", i18n.t("business_street.back"), this.dpr, this.zoom, {
            left: 10 * this.dpr,
            top: 10 * this.dpr,
            right: 10 * this.dpr,
            bottom: 10 * this.dpr
        });
        this.add(backBtn);
        backBtn.setTextStyle({ fontSize: 15 * this.dpr, fontFamily: Font.BOLD_FONT, color: "#ffffff" });
        backBtn.on(String(ClickEvent.Tap), this.onBackHandler, this);
    }

    private createGrideTable(x: number, y: number, width: number, height: number, capW: number, capH: number) {
        const tableConfig = {
            x,
            y,
            table: {
                width,
                height,
                columns: 1,
                cellWidth: capW,
                cellHeight: capH,
                reuseCellContainer: true,
                tableOX: 19 * this.dpr,
                zoom: this.zoom
            },
            scrollMode: 0,
            clamplChildOY: false,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new PicStreetItem(this.scene, 0, 0, capW, capH, this.key, this.key2, this.dpr, this.zoom);
                    grid.add(cellContainer);
                }
                cellContainer.setData({ item });
                cellContainer.setStoreData(item, this.curCategoryType);
                return cellContainer;
            },
        };
        const grid = new GameGridTable(this.scene, tableConfig);
        grid.on("cellTap", (cell) => {
            if (cell) {
                this.onSelectItemHandler(cell);
            }
        });
        grid.layout();
        this.add(grid);

        return grid;
    }

    private onCategoryHandler(data) {
        this.curCategoryType = data.categoryType;
        if (this.subCategory !== undefined) {
            const type = this.curCategoryType === CategoryType.popularity ? "popularity" : "praise";
            this.queryHandler.runWith([type, this.subCategory]);
        }
    }

    private onSubCategoryHandle(item) {
        const data = item.getData("itemData");
        if (this.curSubCategoryItem) this.curSubCategoryItem.changeNormal();
        item.changeDown();
        this.curSubCategoryItem = item;
        this.subCategory = data.type;
        const type = this.curCategoryType === CategoryType.popularity ? "popularity" : "praise";
        if (this.queryHandler) this.queryHandler.runWith([type, this.subCategory]);
    }

    private onSelectItemHandler(cell: PicStreetItem) {
        const storeData = cell.storeData;
        if (this.enterHandler) this.enterHandler.runWith(storeData.roomId);
    }

    private onHistoryHandler() {
        if (this.historyHandler) this.historyHandler.run();
    }

    private onRankHandler() {
        if (this.rankHandler) this.rankHandler.run();
    }

    private onBackHandler() {
        if (this.backHandler) this.backHandler.run();
    }
}

class PicStreetItem extends Phaser.GameObjects.Container {
    public storeData: op_client.IEditModeRoom;
    private key: string;
    private key2: string;
    private dpr: number;
    private storeName: Phaser.GameObjects.Text;
    private playerName: Phaser.GameObjects.Text;
    private storeIcon: DynamicImage;
    private praiseCount: Phaser.GameObjects.Text;
    private industryIcon: Phaser.GameObjects.Image;
    private bg: NineSlicePatch;
    private praiseIcon: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, key2: string, dpr: number, zoom: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.key2 = key2;
        this.setSize(width, height);
        const posx = -this.width * 0.5;
        const posy = -this.height * 0.5;
        this.bg = new NineSlicePatch(this.scene, 0, 0, width, 45 * dpr, this.key, "restaurant_bg", {
            left: 4 * this.dpr,
            top: 9 * this.dpr,
            right: 4 * this.dpr,
            bottom: 9 * this.dpr
        });
        this.add(this.bg);
        const iconbg = this.scene.make.image({ key: key2, frame: "icon_bg_s" });
        iconbg.setPosition(posx + iconbg.width * 0.5 + 3 * dpr, 0);
        this.add(iconbg);

        this.storeIcon = new DynamicImage(this.scene, iconbg.x, 0);
        this.add(this.storeIcon);
        const storeX = iconbg.x + iconbg.width * 0.5 + 10 * dpr;
        this.storeName = this.scene.make.text({ x: storeX, y: posy + 10 * dpr, text: "", style: { color: "#FFE11A", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0);
        this.add(this.storeName);
        this.playerName = this.scene.make.text({ x: storeX, y: this.storeName.y + this.storeName.height * 0.5 + 10 * dpr, text: "", style: { color: "#ffffff", fontSize: 11 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0);
        this.add(this.playerName);
        this.industryIcon = this.scene.make.image({ key: this.key2, frame: "entertainment_tag_s" });
        this.industryIcon.x = this.width * 0.5 - this.industryIcon.width * 0.5;
        this.add(this.industryIcon);
        this.praiseIcon = this.scene.make.image({ key: key2, frame: "praise" });
        this.praiseIcon.x = -posx - 80 * dpr;
        this.add(this.praiseIcon);
        this.praiseCount = this.scene.make.text({ x: this.praiseIcon.x + this.praiseIcon.width * 0.5 + 10 * dpr, y: this.praiseIcon.y, text: "", style: { color: "#ffffff", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0, 0.5);
        this.add(this.praiseCount);
    }

    public setStoreData(data: op_client.IEditModeRoom, categoriesType: CategoryType) {
        const industry = data.industry;
        const storeType = data.storeType;
        this.bg.setFrame(industry + "_bg");
        this.storeIcon.setTexture(this.key2, storeType + "_icon_s");
        this.praiseIcon.setFrame(categoriesType === CategoryType.praise ? "praise" : "store_popularity");
        this.storeName.text = data.name;
        this.playerName.text = data.ownerName;
        this.praiseCount.text = (categoriesType === CategoryType.praise ? data.praise : data.popularity) + "";
        this.industryIcon.setFrame(industry + "_tag_s");
        this.storeData = data;
        this.storeName.removeInteractive();
        this.storeName.setInteractive();
    }
}

enum CategoryType {
    popularity = 1,
    praise = 2
}
