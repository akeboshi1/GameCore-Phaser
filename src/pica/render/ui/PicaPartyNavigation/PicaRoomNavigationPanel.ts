import { GameGridTable } from "apowophaserui";
import { UIAtlasName } from "picaRes";
import { Font, Handler } from "utils";
import { PicaRoomListItem } from "./PicaRoomListItem";
import { op_client } from "pixelpai_proto";
export class PicaRoomNavigationPanel extends Phaser.GameObjects.Container {
    private mGameGrid: GameGridTable;
    private dpr: number;
    private zoom: number;
    private sendHandler: Handler;
    private datas: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_ROOM_LIST[] = [];
    private isQuerying: boolean = false;
    private dataLength: number = 0;
    private nextPageNum: number = 0;
    private maxPage: number = 0;
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
                    cellContainer = new PicaRoomListItem(this.scene, UIAtlasName.map, this.dpr);
                }
                cellContainer.setRoomData(item, index);
                if (this.isCanQuery(index)) this.queryNextPage();
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
    public setRoomDatas(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_ROOM_LIST) {
        if (this.datas.length === 0) this.mGameGrid.setItems(content.rooms);
        else {
            let item = this.mGameGrid.items;
            item = item.concat(content.rooms);
            // this.mGameGrid["setPartItems"](content.rooms);
            this.mGameGrid.gridTable.setItems(item);
        }
        this.datas.push(content);
        this.dataLength += content.rooms.length;
        this.nextPageNum = content.page + 1;
        this.maxPage = content.maxPage;
        this.isQuerying = false;
    }

    public clearDatas() {
        this.datas.length = 0;
        this.dataLength = 1;
        this.nextPageNum = -1;
        this.isQuerying = false;
    }

    private onGridTableHandler(item: PicaRoomListItem) {
        if (this.sendHandler) this.sendHandler.runWith(["enter", item.roomData.roomId]);
    }

    private queryNextPage() {
        if (this.isQuerying) return;
        if (this.sendHandler) this.sendHandler.runWith(["query", this.nextPageNum]);
        this.isQuerying = true;
    }

    private isCanQuery(index: number) {
        if (this.nextPageNum === -1) return false;
        if (!this.isQuerying && this.maxPage >= this.nextPageNum && this.dataLength < index + 10) {
            return true;
        }
        return false;
    }

}
