/// <reference types="phaser" />
import { IPatchesConfig } from "apowophaserui";
import { Handler } from "structure";
export declare class ItemInfoTips extends Phaser.GameObjects.Container {
    private tipsbg;
    private tipsText;
    private dpr;
    private key;
    private config;
    private fullHide;
    private invalidArea;
    private callback;
    private listenType;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, bg: string, dpr: number, config?: IPatchesConfig);
    setListenType(event: string): void;
    setInvalidArea(invalidArea?: Phaser.Geom.Rectangle): void;
    setHandler(back: Handler): void;
    set enableFullHide(value: any);
    setVisible(value: boolean): this;
    hide(): void;
    show(): void;
    resize(width: number, height: number): void;
    setText(text: string, apha?: number): void;
    setItemData(data: any): void;
    setTipsPosition(gameobject: Phaser.GameObjects.Container, container: Phaser.GameObjects.Container, offsety?: number): void;
    private create;
    private getDesText;
    private onHideHandler;
    private checkPointerInBounds;
}
