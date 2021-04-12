import { Handler } from "utils";
export declare class PicaIllustratedGalleryPanel extends Phaser.GameObjects.Container {
    private mGameGrid;
    private dpr;
    private zoom;
    private send;
    private curSelectItem;
    private galleryData;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number);
    resize(width?: number, height?: number): void;
    setHandler(send: Handler): void;
    setGallaryData(content: any): void;
    init(): void;
    private onSelectItemHandler;
}
