import { Handler } from "utils";
export declare class PicaBusinessMyStreetPanel extends Phaser.GameObjects.Container {
    private storeCountText;
    private newStoreBtn;
    private gridtable;
    private storelimitText;
    private dpr;
    private key;
    private zoom;
    private takeAllHandler;
    private goOutHandler;
    private newStoreHandler;
    private enterRoomHandler;
    private isCanNewCreate;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string);
    setMyStoreData(content: any): void;
    setHandler(takeAll: Handler, goOut: Handler, newStore: Handler, enter: Handler): void;
    resetMask(): void;
    protected create(): void;
    private createGrideTable;
    private onEnterHandler;
    private onTalkAllHandler;
    private onGoOutHandler;
    private onNewStoreHandler;
}
