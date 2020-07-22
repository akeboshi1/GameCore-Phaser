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

export class PicBusinessMyStreetPanel extends Phaser.GameObjects.Container {
    private storeCountText: Phaser.GameObjects.Text;
    private newStoreBtn: Button;
    private gridtable: GameGridTable;
    private dpr: number;
    private key: string;
    private zoom: number;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.zoom = zoom;
        this.setSize(width, height);
        this.create();
    }


    public setMyStoreData() {

        const arr = new Array(60);
        this.gridtable.setItems(arr);
    }

    protected create() {
        const posy = -this.height * 0.5;
        const posx = -this.width * 0.5;
        const storebg = this.scene.make.image({ key: this.key, frame: "store_icon" });
        storebg.x = posx + 30 * this.dpr;
        storebg.y = posy;
        this.add(storebg);
        const mfont = `bold ${15 * this.dpr}px ${Font.DEFULT_FONT}`;
        const storex = storebg.x + storebg.width * 0.5 + 20 * this.dpr;
        const storeTitle = this.scene.make.text({ x: storex, y: posy, text: "", style: { font: mfont, bold: true, color: "#FFC51A" } }).setOrigin(0.5, 0);
        storeTitle.setStroke("#0", 4);
        this.add(storeTitle);
        this.newStoreBtn = new Button(this.scene, this.key, "new_store", "new_store");
        const btnX = posx + this.newStoreBtn.width * 0.5 + 20 * this.dpr;
        this.newStoreBtn.setPosition(btnX, posy);
        this.add(this.newStoreBtn);
        this.storeCountText = this.scene.make.text({ x: btnX + this.newStoreBtn.width * 0.5 + 20 * this.dpr, y: posy, text: "", style: { font: mfont, bold: true, color: "#FFC51A" } }).setOrigin(1, 0);
        this.add(this.storeCountText);
        const gridWdith = this.width;
        const gridHeight = this.height - 100 * this.dpr;
        const gridY = posy + 40 * this.dpr + gridHeight * 0.5;
        this.gridtable = this.createGrideTable(0, gridY, gridWdith, gridHeight, 256 * this.dpr, 68 * this.dpr);
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
                zoom: this.zoom
            },
            scrollMode: 1,
            clamplChildOY: false,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new MyStoreItem(this.scene, 0, 0, capW, capH, this.key, this.dpr, this.zoom);
                    cellContainer.setHandler(new Handler(this, this.onEnterHandler));
                    this.add(cellContainer);
                }
                cellContainer.setData({ item });
                cellContainer.setStoreData(item);
                return cellContainer;
            },
        };
        const grid = new GameGridTable(this.scene, tableConfig);
        grid.layout();
        this.add(grid.table);
        return grid;
    }

    private onEnterHandler(data: any) {

    }
}

class MyStoreItem extends Phaser.GameObjects.Container {
    public storeData: any;
    private key: string;
    private dpr: number;
    private cornerText: Phaser.GameObjects.Text;
    private storeName: Phaser.GameObjects.Text;
    private savings: Phaser.GameObjects.Text;
    private competitiveness: Phaser.GameObjects.Text;
    private prosperity: Phaser.GameObjects.Text;
    private storeIcon: DynamicImage;
    private lvimgCon: Phaser.GameObjects.Container;
    private enterHandler: Handler;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, dpr: number, zoom: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.setSize(width, height);
        const posx = -this.width * 0.5;
        const posy = -this.height * 0.5;
        const bg = new NineSlicePatch(this.scene, 0, 0, width, height, this.key, "resturant_bg", {
            left: 5 * this.dpr,
            top: 9 * this.dpr,
            right: 5 * this.dpr,
            bottom: 9 * this.dpr
        });
        this.add(bg);
        const iconbg = this.scene.make.image({ key, frame: "store_icon_bg" });
        iconbg.setPosition(posx + 10 * dpr);
        this.add(iconbg);
        const cornerbg = new NineSlicePatch(this.scene, 0, 0, 44 * dpr, 13 * dpr, this.key, "resturant_tag", {
            left: 3 * this.dpr,
            top: 0,
            right: 7 * this.dpr,
            bottom: 0
        });
        cornerbg.setPosition(posx, posy);
        this.add(cornerbg);
        this.cornerText = this.scene.make.text({ x: posx, y: posy, text: "Restaurant", style: { color: "#ffffff", fontSize: 10 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0, 0.5);
        this.storeIcon = new DynamicImage(this.scene, iconbg.x, 0);
        this.add(this.storeIcon);
        const storeX = iconbg.x + iconbg.width * 0.5 + 10 * dpr;
        this.storeName = this.scene.make.text({ x: storeX, y: posy + 2 * dpr, text: "Restaurant", style: { color: "#FFE11A", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0);
        this.add(this.storeName);
        this.lvimgCon = this.scene.make.container(undefined, false);
        this.lvimgCon.height = 14 * dpr;
        this.lvimgCon.setPosition(storeX, this.storeName.y + this.storeName.height + this.lvimgCon.height * 0.5 + 5 * dpr);
        this.add(this.lvimgCon);
        this.savings = this.scene.make.text({ x: storeX, y: this.lvimgCon.y + this.lvimgCon.height * 0.5 + 5 * dpr, text: "Savings: 13000", style: { color: "#ffffff", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0);
        this.add(this.savings);
        this.competitiveness = this.scene.make.text({ x: storeX, y: this.savings.y + this.savings.height + 5 * dpr, text: "Competitiveness: 13000", style: { color: "#ffffff", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0);
        this.add(this.competitiveness);
        this.prosperity = this.scene.make.text({ x: storeX, y: this.competitiveness.y + this.competitiveness.height + 5 * dpr, text: "Prosperity: +13000 / Day", style: { color: "#ffffff", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0);
        this.add(this.prosperity);
        const enterBtn = new NineSliceButton(scene, -posx, 0, 27 * dpr, 20 * dpr, UIAtlasKey.commonKey, "yellow_btn", i18n.t("business_street.enter"), this.dpr, zoom, {
            left: 4 * this.dpr,
            top: 4 * this.dpr,
            right: 4 * this.dpr,
            bottom: 8 * this.dpr
        });
        enterBtn.x = -posx - enterBtn.width * 0.5 + 20 * dpr;
        enterBtn.on(CoreUI.MouseEvent.Tap, this.onEnterHandler, this);
        this.add(enterBtn);
    }

    public setStoreData(data) {

    }

    public setHandler(handler: Handler) {
        this.enterHandler = handler;
    }
    private onEnterHandler() {
        if (this.enterHandler) this.enterHandler.runWith(this.storeData);
    }
}