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
import { op_client, op_pkt_def } from "pixelpai_proto";
export class PicBusinessHistoryPanel extends Phaser.GameObjects.Container {
    private titleText: Phaser.GameObjects.Text;
    private gridtable: GameGridTable;
    private dpr: number;
    private key: string;
    private key2: string;
    private zoom: number;
    private backHandler: Handler;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string, key2: string) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.key2 = key2;
        this.zoom = zoom;
        this.setSize(width, height);
        this.create();
    }

    public setHistoryeData(datas: op_client.IEditModeRoom[]) {
        this.gridtable.setItems(datas);
        this.titleText.text = i18n.t("business_street.history_title", { name: datas.length });
    }

    public setHandler(back: Handler) {
        this.backHandler = back;
    }

    public resetMask() {
        this.gridtable.resetMask();
    }

    protected create() {
        const posy = -this.height * 0.5;
        const posx = -this.width * 0.5;
        const mfont = `bold ${13 * this.dpr}px ${Font.BOLD_FONT}`;
        const titleText = this.scene.make.text({ x: posx + 30 * this.dpr, y: posy + 6 * this.dpr, text: i18n.t("business_street.history_title"), style: { font: mfont, bold: true, color: "#FFC51A" } }).setOrigin(0, 0.5);
        titleText.setStroke("#553100", 2 * this.dpr);
        this.add(titleText);
        this.titleText = titleText;
        const gridWdith = this.width;
        const gridHeight = this.height - 80 * this.dpr;
        const gridY = posy + 33 * this.dpr + gridHeight * 0.5;
        this.gridtable = this.createGrideTable(0, gridY, gridWdith, gridHeight, 256 * this.dpr, 50 * this.dpr);

        const backBtn = new NineSliceButton(this.scene, 0, this.height * 0.5 - 7 * this.dpr, 92 * this.dpr, 34 * this.dpr, UIAtlasKey.commonKey, "red_btn", i18n.t("business_street.back"), this.dpr, this.zoom, {
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
                    cellContainer = new PicHistoryItem(this.scene, 0, 0, capW, capH, this.key, this.key2, this.dpr, this.zoom);
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

    private onBackHandler() {
        if (this.backHandler) this.backHandler.run();
    }
}

class PicHistoryItem extends Phaser.GameObjects.Container {
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
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, key2: string, dpr: number, zoom: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.key2 = key2;
        this.setSize(width, height);
        const posx = -this.width * 0.5;
        const posy = -this.height * 0.5;
        this.bg = new NineSlicePatch(this.scene, 0, 0, width, 45 * dpr, this.key, "resturant_bg", {
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
        this.storeName = this.scene.make.text({ x: storeX, y: posy + 10 * dpr, text: "Restaurant", style: { color: "#FFE11A", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0);
        this.add(this.storeName);
        this.playerName = this.scene.make.text({ x: storeX, y: this.storeName.y + this.storeName.height * 0.5 + 10 * dpr, text: "Savings: 13000", style: { color: "#ffffff", fontSize: 11 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0);
        this.add(this.playerName);
        this.industryIcon = this.scene.make.image({ key: this.key2, frame: "entertainment_tag_s" });
        this.industryIcon.x = this.width * 0.5 - this.industryIcon.width * 0.5;
        this.add(this.industryIcon);
        // const praiseIcon = this.scene.make.image({ key: key2, frame: "praise" });
        // praiseIcon.x = -posx - 80 * dpr;
        // this.add(praiseIcon);
        // this.praiseCount = this.scene.make.text({ x: praiseIcon.x + praiseIcon.width * 0.5 + 10 * dpr, y: praiseIcon.y, text: "66666666", style: { color: "#ffffff", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0,0.5);
        // this.add(this.praiseCount);
    }

    public setStoreData(data: op_client.IEditModeRoom) {
        this.storeData = data;
        this.bg.setTexture(this.key2, data.industry + "_bg");
        this.storeName.text = data.name;
        this.playerName.text = data.ownerName;
        this.storeIcon.setTexture(this.key2, data.storeType + "_icon_s");
        this.industryIcon.setFrame(data.industry + "_tag_s");
    }

}
