import { Font } from "../../utils/font";
import { Button } from "../../../lib/rexui/lib/ui/button/Button";
import { GridTableConfig } from "../../../lib/rexui/lib/ui/gridtable/GridTableConfig";
import { GameGridTable } from "../../../lib/rexui/lib/ui/gridtable/GameGridTable";
import { Handler } from "../../Handler/Handler";
import { DynamicImage } from "../components/dynamic.image";
import { NineSlicePatch } from "../../../lib/rexui/lib/ui/ui-components";
import { UIAtlasKey } from "../ui.atals.name";
import { NineSliceButton } from "../../../lib/rexui/lib/ui/button/NineSliceButton";
import { i18n } from "../../i18n";
import { CoreUI } from "../../../lib/rexui/lib/ui/interface/event/MouseEvent";
import { SecondaryMenuPanel } from "./SecondaryMenuPanel";
import { TextButton } from "../Market/TextButton";
import { TabButton } from "../../../lib/rexui/lib/ui/tab/TabButton";

export class PicBusinessStreetListPanel extends Phaser.GameObjects.Container {
    private gridtable: GameGridTable;
    private dpr: number;
    private key: string;
    private key2: string;
    private zoom: number;
    private historyHandler: Handler;
    private rankHandler: Handler;
    private backHandler: Handler;
    private secondaryPanel: SecondaryMenuPanel;
    private curSubCategoryData: any;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string, key2: string) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.key2 = key2;
        this.zoom = zoom;
        this.setSize(width, height);
        this.create();
    }

    public setStreetListData() {
        const arr = new Array(60);
        this.gridtable.setItems(arr);
        const att = [{ text: "Popular", data: {} }, { text: "Hot", data: {} }, { text: "Praise", data: {} }];
        this.secondaryPanel.setCategories(TabButton, att, {
            width: 88 * this.dpr,
            height: 27 * this.dpr,
            key: this.key2,
            normalFrame: "navigation_bar_click",
            downFrame: "navigation_bar_click",
            textStyle: {
                fontSize: 11 * this.dpr,
                fontFamily: Font.DEFULT_FONT,
                color: "#ffffff"
            }
        });
    }

    public setHandler(history: Handler, rank: Handler, back: Handler) {
        this.historyHandler = history;
        this.rankHandler = rank;
        this.backHandler = back;
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
            orientation: 1
        });
        this.add(this.secondaryPanel);
        const scrollbg = this.scene.make.image({ key: this.key2, frame: "navigation_bar" });
        this.secondaryPanel.gameScroll.addAt(scrollbg);
        this.secondaryPanel.createGrideTable(0, 5* this.dpr, this.width - 30 * this.dpr, 40 * this.dpr, 40 * this.dpr, 27 * this.dpr, (cell, cellContainer) => {
            const item = cell.item;
            if (!cellContainer) {
                cellContainer = new TextButton(this.scene, this.dpr, this.zoom);
                this.add(cellContainer);
            }
            cellContainer.setText("Pub");
            cellContainer.setData("itemData", item);
            if (this.curSubCategoryData === item) {
                cellContainer.changeDown();
            } else cellContainer.changeNormal();
            this.secondaryPanel.addGridTableItem(cellContainer);
            return cellContainer;
        });
        this.secondaryPanel.setHandler(new Handler(this, this.onCategoryHandler), new Handler(this, this.onSubCategoryHandle));
        const gridbg = this.scene.make.image({ key: this.key2, frame: "navigation_bar_2" });
        gridbg.y = 9 * this.dpr;
        this.secondaryPanel.gridTable.addAt(gridbg);
        const gridWdith = this.width;
        const gridHeight = this.height - 140 * this.dpr;
        const gridY = posy + 77 * this.dpr + gridHeight * 0.5;
        this.gridtable = this.createGrideTable(0, gridY, gridWdith, gridHeight, 256 * this.dpr, 50 * this.dpr);

        const rankBtn = new Button(this.scene, this.key2, "ranking", "ranking");
        const btnX = -posx - rankBtn.width * 0.5 - 20 * this.dpr;
        rankBtn.setPosition(btnX, posy + 6 * this.dpr);
        rankBtn.on(CoreUI.MouseEvent.Tap, this.onRankHandler, this);
        this.add(rankBtn);

        const historyBtn = new Button(this.scene, this.key2, "history", "history");
        historyBtn.setPosition(btnX - rankBtn.width * 0.5 - historyBtn.width * 0.5 - 10 * this.dpr, posy + 6 * this.dpr);
        historyBtn.on(CoreUI.MouseEvent.Tap, this.onHistoryHandler, this);
        this.add(historyBtn);

        const backBtn = new NineSliceButton(this.scene, 0, this.height * 0.5 - 15 * this.dpr, 92 * this.dpr, 34 * this.dpr, UIAtlasKey.commonKey, "red_btn", i18n.t("business_street.back"), this.dpr, this.zoom, {
            left: 10 * this.dpr,
            top: 10 * this.dpr,
            right: 10 * this.dpr,
            bottom: 10 * this.dpr
        });
        this.add(backBtn);
        backBtn.setTextStyle({ fontSize: 15 * this.dpr, fontFamily: Font.BOLD_FONT, color: "#ffffff" });
        backBtn.on(CoreUI.MouseEvent.Tap, this.onBackHandler, this);
    }

    private createGrideTable(x: number, y: number, width: number, height: number, capW: number, capH: number) {
        const tableConfig: GridTableConfig = {
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
                cellContainer.setStoreData(item);
                return cellContainer;
            },
        };
        const grid = new GameGridTable(this.scene, tableConfig);
        grid.layout();
        this.add(grid);

        return grid;
    }

    private onCategoryHandler(data) {
        const arr = new Array(60);
        this.secondaryPanel.setSubItems(arr);
    }

    private onSubCategoryHandle(item) {
        const data = item.getData("itemData");
        this.curSubCategoryData = data;
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
    public storeData: any;
    private key: string;
    private key2: string;
    private dpr: number;
    private cornerText: Phaser.GameObjects.Text;
    private storeName: Phaser.GameObjects.Text;
    private playerName: Phaser.GameObjects.Text;
    private storeIcon: DynamicImage;
    private praiseCount: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, key2: string, dpr: number, zoom: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.key2 = key2;
        this.setSize(width, height);
        const posx = -this.width * 0.5;
        const posy = -this.height * 0.5;
        const bg = new NineSlicePatch(this.scene, 0, 0, width, 45 * dpr, this.key, "resturant_bg", {
            left: 4 * this.dpr,
            top: 9 * this.dpr,
            right: 4 * this.dpr,
            bottom: 9 * this.dpr
        });
        this.add(bg);
        const iconbg = this.scene.make.image({ key: key2, frame: "icon_bg_s" });
        iconbg.setPosition(posx + iconbg.width * 0.5 + 3 * dpr, 0);
        this.add(iconbg);
        const cornerbg = new NineSlicePatch(this.scene, 0, 0, 44 * dpr, 15 * dpr, this.key, "resturant_tag", {
            left: 3 * this.dpr,
            top: 0,
            right: 7 * this.dpr,
            bottom: 0
        });
        cornerbg.setPosition(posx + cornerbg.width * 0.5 - 2 * dpr, posy + 10 * dpr);
        this.add(cornerbg);
        this.cornerText = this.scene.make.text({ x: posx, y: posy, text: "Restaurant", style: { color: "#ffffff", fontSize: 10 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0, 0.5);
        this.storeIcon = new DynamicImage(this.scene, iconbg.x, 0);
        this.add(this.storeIcon);
        const storeX = iconbg.x + iconbg.width * 0.5 + 10 * dpr;
        this.storeName = this.scene.make.text({ x: storeX, y: posy + 10 * dpr, text: "Restaurant", style: { color: "#FFE11A", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0);
        this.add(this.storeName);
        this.playerName = this.scene.make.text({ x: storeX, y: this.storeName.y + this.storeName.height * 0.5 + 10 * dpr, text: "Savings: 13000", style: { color: "#ffffff", fontSize: 11 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0);
        this.add(this.playerName);
        const praiseIcon = this.scene.make.image({ key: key2, frame: "praise" });
        praiseIcon.x = -posx - 80 * dpr;
        this.add(praiseIcon);
        this.praiseCount = this.scene.make.text({ x: praiseIcon.x + praiseIcon.width * 0.5 + 10 * dpr, y: praiseIcon.y, text: "66666666", style: { color: "#ffffff", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0,0.5);
        this.add(this.praiseCount);
    }

    public setStoreData(data) {

    }

}
