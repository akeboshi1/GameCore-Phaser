import { Handler } from "utils";
export declare class PicaBusinessRankingDetailPanel extends Phaser.GameObjects.Container {
    private timeText;
    private gridtable;
    private dpr;
    private key;
    private key2;
    private zoom;
    private backHandler;
    private rankRewardHandler;
    private myRankItem;
    private myitembg;
    private content;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string, key2: string);
    setRankingDetailData(content: any): void;
    setHandler(back: Handler, reward: Handler): void;
    resetMask(): void;
    protected create(): void;
    private createGrideTable;
    private onBackHandler;
    private onRankRewardHandler;
}
