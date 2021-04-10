import { Handler } from "utils";
export declare class PicaManorScrollPanel extends Phaser.GameObjects.Container {
    private gridtable;
    private dpr;
    private key;
    private zoom;
    private sendHandler;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string);
    setManorListData(content: any): void;
    setHandler(send: Handler): void;
    resetMask(): void;
    protected create(): void;
    private createGrideTable;
    private onGridTableHandler;
    private onEnterHandler;
    private onSearchBtnHandler;
    private onFiltrateHandler;
    private onSortBtnHandler;
}
