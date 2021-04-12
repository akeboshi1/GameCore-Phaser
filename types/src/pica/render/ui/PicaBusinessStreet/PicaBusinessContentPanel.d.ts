import { Handler } from "utils";
export declare class PicaBusinessContentPanel extends Phaser.GameObjects.Container {
    private bg;
    private topbg;
    private titleText;
    private titlebg;
    private closeBtn;
    private dpr;
    private key;
    private key2;
    private closeHandler;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, key: string, key2: string);
    create(): void;
    setContentSize(width: number, height: number): void;
    setTitleText(text: string): void;
    setCloseHandler(handler: Handler): void;
    private onCloseHandler;
}
