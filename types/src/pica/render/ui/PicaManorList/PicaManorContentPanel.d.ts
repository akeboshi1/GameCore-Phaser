import { Handler } from "utils";
export declare class PicaManorContentPanel extends Phaser.GameObjects.Container {
    private bg;
    private titleText;
    private titlebg;
    private closeBtn;
    private dpr;
    private key;
    private closeHandler;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, key: string);
    create(): void;
    setContentSize(width: number, height: number): void;
    setTitleText(text: string): void;
    setCloseHandler(handler: Handler): void;
    private onCloseHandler;
}
