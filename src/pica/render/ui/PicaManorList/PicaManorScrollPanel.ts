import { Button, GameGridTable, ClickEvent, NineSliceButton, NineSlicePatch } from "apowophaserui";
import { ImageValue } from "gamecoreRender";
import { UIAtlasKey } from "picaRes";
import { Font, Handler, i18n } from "utils";

export class PicaManorScrollPanel extends Phaser.GameObjects.Container {
    // private sortBtn: Button;
    // private filtrateBtn: Button;
    private gridtable: GameGridTable;
    private dpr: number;
    private key: string;
    private zoom: number;
    private sendHandler: Handler;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.zoom = zoom;
        this.setSize(width, height);
        this.create();
    }

    public setManorListData(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_STREET_LIST
        const street = content.street.sort((a, b) => {
            if (a.streetId > b.streetId) return -1;
            else return 1;
        });
        this.gridtable.setItems(street);
    }

    public setHandler(send: Handler) {
        this.sendHandler = send;
    }

    public resetMask() {
        this.gridtable.resetMask();
    }

    protected create() {
        const posy = -this.height * 0.5;
        const posx = -this.width * 0.5;
        const storebg = this.scene.make.image({ key: this.key, frame: "finca_list_block" });
        storebg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        storebg.x = posx + 35 * this.dpr;
        storebg.y = posy + 30 * this.dpr;
        this.add(storebg);
        const storex = storebg.x + storebg.width * 0.5 + 5 * this.dpr;
        const storeTitle = this.scene.make.text({
            x: storex, y: storebg.y, text: i18n.t("manor.title"), style: { fontSize: 12 * this.dpr, fontFamily: Font.DEFULT_FONT, color: "#FFC51A" }
        }).setOrigin(0, 0.5);
        storeTitle.setFontStyle("bold");
        storeTitle.setStroke("#553100", 2 * this.dpr);
        this.add(storeTitle);

        const line = this.scene.make.graphics(undefined, false);
        line.clear();
        line.fillStyle(0x000000, 0.11);
        line.fillRect(-this.width * 0.5 + 20 * this.dpr, storebg.y + 20 * this.dpr, 256 * this.dpr, 2);
        this.add(line);
        const gridWdith = 293 * this.dpr;
        const gridHeight = 360 * this.dpr;
        const gridY = posy + 53 * this.dpr + gridHeight * 0.5;
        this.gridtable = this.createGrideTable(0, gridY, gridWdith, gridHeight, 293 * this.dpr, 58 * this.dpr);
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
                tableOX: 0 * this.dpr,
                zoom: this.zoom
            },
            scrollMode: 0,
            clamplChildOY: false,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new ManorItem(this.scene, 0, 0, capW, capH, this.key, this.dpr, this.zoom);
                    grid.add(cellContainer);
                }
                cellContainer.setManorData(item);
                return cellContainer;
            },
        };
        const grid = new GameGridTable(this.scene, tableConfig);
        grid.layout();
        grid.on("cellTap", this.onGridTableHandler, this);
        this.add(grid);

        return grid;
    }
    private onGridTableHandler(item: ManorItem) {
        this.onEnterHandler(item.manorData);
    }
    private onEnterHandler(data: any) {// op_client.EditModeRoom
        if (this.sendHandler) this.sendHandler.runWith(data.roomId);
    }
    private onSearchBtnHandler() {
        if (this.sendHandler) this.sendHandler.run();
    }

    private onFiltrateHandler() {
        if (this.sendHandler) this.sendHandler.run();
    }

    private onSortBtnHandler() {
        if (this.sendHandler) this.sendHandler.run();
    }
}

class ManorItem extends Phaser.GameObjects.Container {
    public manorData: any;// op_client.EditModeRoom
    private key: string;
    private dpr: number;
    private manorName: Phaser.GameObjects.Text;
    private bg: NineSlicePatch;
    private playerCount: ImageValue;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, dpr: number, zoom: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.setSize(width, height);
        const posx = -this.width * 0.5;
        const posy = -this.height * 0.5;
        this.bg = new NineSlicePatch(this.scene, 0, 0, width, 50 * dpr, this.key, "list_bg", {
            left: 10 * this.dpr,
            top: 0 * this.dpr,
            right: 10 * this.dpr,
            bottom: 0 * this.dpr
        });
        this.add(this.bg);
        const storeX = -this.width * 0.5 + 10 * dpr;
        this.manorName = this.scene.make.text({ x: storeX, y: 0, text: "", style: { color: "#333333", fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0, 0.5);
        this.manorName.setFontStyle("bold");
        this.add(this.manorName);
        this.playerCount = new ImageValue(scene, 30 * dpr, 20 * dpr, UIAtlasKey.commonKey, "home_persons", dpr, {
            fontFamily: Font.DEFULT_FONT,
            fontSize: 15 * dpr,
            color: "#333333",
        });
        this.playerCount.setFontStyle("bold");
        this.playerCount.x = this.width * 0.5 - 35 * dpr;
        this.add(this.playerCount);
        this.playerCount.setText("100");
    }

    public setManorData(data: any) {// op_client.EditModeRoom
        this.manorData = data;
        this.manorName.text = data.name;
        this.playerCount.setText(data.playerCount + "");
    }

}
