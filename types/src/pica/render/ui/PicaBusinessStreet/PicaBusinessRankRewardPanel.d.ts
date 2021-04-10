import { Handler } from "utils";
export declare class PicaBusinessRankRewardPanel extends Phaser.GameObjects.Container {
    private gridtable;
    private dpr;
    private key;
    private key2;
    private zoom;
    private backHandler;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string, key2: string);
    setRankRewardData(datas: any[]): void;
    setHandler(back: Handler): void;
    resetMask(): void;
    protected create(): void;
    private createGrideTable;
    private onBackHandler;
}
