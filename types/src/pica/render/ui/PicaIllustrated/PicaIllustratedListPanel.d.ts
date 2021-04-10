import { Handler } from "utils";
export declare class PicaIllustratedListPanel extends Phaser.GameObjects.Container {
    private dpr;
    private zoom;
    private send;
    private gridLayout;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number);
    resize(width?: number, height?: number): void;
    setHandler(send: Handler): void;
    init(): void;
    setListData(): void;
    private getListData;
    private onSelectItemHandler;
}
