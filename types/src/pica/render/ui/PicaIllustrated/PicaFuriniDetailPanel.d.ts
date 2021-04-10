import { Handler } from "utils";
import { IExtendCountablePackageItem } from "picaStructure";
import { Render } from "gamecoreRender";
export declare class PicaFuriniDetailPanel extends Phaser.GameObjects.Container {
    private backgrand;
    private codeName;
    private titleName;
    private mDetailDisplay;
    private itemData;
    private starImg;
    private bottomBg;
    private furinName;
    private furiDes;
    private maskGraphic;
    private closeButton;
    private dpr;
    private zoom;
    private render;
    private send;
    constructor(scene: Phaser.Scene, render: Render, width: number, height: number, dpr: number, zoom: number);
    resize(w: number, h: number): void;
    refreshMask(): void;
    init(): void;
    destroy(): void;
    setProp(prop: IExtendCountablePackageItem): void;
    setHandler(send: Handler): void;
    private setResource;
    private onCloseHandler;
}
