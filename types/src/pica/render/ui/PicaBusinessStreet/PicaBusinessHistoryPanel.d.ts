import { Handler } from "utils";
export declare class PicaBusinessHistoryPanel extends Phaser.GameObjects.Container {
    private titleText;
    private gridtable;
    private dpr;
    private key;
    private key2;
    private zoom;
    private backHandler;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string, key2: string);
    setHistoryeData(datas: any[]): void;
    setHandler(back: Handler): void;
    resetMask(): void;
    protected create(): void;
    private createGrideTable;
    private onBackHandler;
}
