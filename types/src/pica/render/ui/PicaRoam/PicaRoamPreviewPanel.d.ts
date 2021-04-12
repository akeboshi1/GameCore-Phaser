import { Handler } from "utils";
export declare class PicaRoamPreviewPanel extends Phaser.GameObjects.Container {
    private mBackground;
    private bg;
    private titlebg;
    private titleTex;
    private closeBtn;
    private mGameGrid;
    private content;
    private poolsStatus;
    private dpr;
    private zoom;
    private send;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number);
    resize(width?: number, height?: number): void;
    setHandler(send: Handler): void;
    init(): void;
    setRoamDrawData(datas: any): void;
    private loadPreviewJson;
    private loadJsonComplete;
    private onSelectItemHandler;
    private onCloseHandler;
}
