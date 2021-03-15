import { NineSlicePatch, GameGridTable, Button, ClickEvent, BBCodeText, ProgressBar } from "apowophaserui";
import { DynamicImage, ImageBBCodeValue, ItemInfoTips } from "gamecoreRender";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { ChineseUnit } from "structure";
import { Font, Handler, i18n, Url } from "utils";
import { PicaRoomListItem } from "./PicaRoomListItem";

export class PicaRoomNavigationPanel extends Phaser.GameObjects.Container {
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
                    cellContainer = new PicaRoomListItem(this.scene, UIAtlasName.map, this.dpr);
                }
                cellContainer.setRoomData(item, index);
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
    public setRoomDatas(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_PARTY_LIST
        const arr = new Array(100000);
        this.mGameGrid.setItems(arr);
    }

    private onGridTableHandler(item: PicaRoomListItem) {
        this.onSendHandler(item.roomData);
    }

    private onSendHandler(data: any) {// op_client.IEditModeRoom
        if (this.sendHandler) this.sendHandler.runWith(["partylist", data]);
    }
}
