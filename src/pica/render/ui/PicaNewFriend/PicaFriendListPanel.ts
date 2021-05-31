import { GameGridTable } from "apowophaserui";
import { Handler } from "utils";
import { op_client } from "pixelpai_proto";
import { PicaFriendBaseListItem, PicaFriendCommonItem, PicaFriendListItem } from "./PicaFriendListItem";
export class PicaFriendListPanel extends Phaser.GameObjects.Container {
    private mGameGrid: GameGridTable;
    private dpr: number;
    private zoom: number;
    private sendHandler: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.create();
    }
    create() {
        const tableConfig = {
            x: 0,
            y: 82 * this.dpr,
            table: {
                width: this.width,
                height: this.height - 5 * this.dpr,
                columns: 1,
                cellWidth: this.width,
                cellHeight: 75 * this.dpr,
                reuseCellContainer: true,
                zoom: this.zoom
            },
            scrollMode: 0,
            clamplChildOY: false,
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene, index = cell.index,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new PicaFriendCommonItem(this.scene, 300 * this.dpr, 48 * this.dpr, this.dpr, this.zoom);
                }
                cellContainer.setItemData(item, index);
                return cellContainer;
            },
        };
        this.mGameGrid = new GameGridTable(this.scene, tableConfig);
        this.mGameGrid.layout();
        this.mGameGrid.on("cellTap", this.onGridTableHandler, this);
        this.add(this.mGameGrid);
    }

    public refreshMask() {
        this.mGameGrid.resetMask();
    }
    public setHandler(handler: Handler) {
        this.sendHandler = handler;
    }
    public setPlayerDatas(content: any) {
        this.mGameGrid.setItems(content);
    }

    private onGridTableHandler(item: PicaFriendBaseListItem) {
        if (this.sendHandler) this.sendHandler.runWith(["enter", item]);
    }

}
