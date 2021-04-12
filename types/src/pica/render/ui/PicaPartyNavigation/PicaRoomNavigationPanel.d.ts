import { Handler } from "utils";
import { op_client } from "pixelpai_proto";
export declare class PicaRoomNavigationPanel extends Phaser.GameObjects.Container {
    private mGameGrid;
    private dpr;
    private zoom;
    private sendHandler;
    private datas;
    private isQuerying;
    private dataLength;
    private nextPageNum;
    private maxPage;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number);
    create(): void;
    refreshMask(): void;
    setHandler(handler: Handler): void;
    setRoomDatas(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_ROOM_LIST): void;
    clearDatas(): void;
    private onGridTableHandler;
    private queryNextPage;
    private isCanQuery;
}
