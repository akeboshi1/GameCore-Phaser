import { Handler } from "utils";
export declare class PicaMyRoomNavigationPanel extends Phaser.GameObjects.Container {
    private gameScroll;
    private key;
    private dpr;
    private zoom;
    private sendHandler;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number, zoom: number);
    create(): void;
    clear(): void;
    refreshMask(): void;
    setHandler(handler: Handler): void;
    setRoomDataList(content: any): void;
    private setMyRoomDatas;
    private createRoomItemByFrame;
    private setHistoryDatas;
    private onGameScrollHandler;
    private onSendHandler;
}
