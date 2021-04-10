import { NineSlicePatch } from "apowophaserui";
import { Handler } from "utils";
export declare class PicaManorBasePanel extends Phaser.GameObjects.Container {
    protected dpr: number;
    protected key: string;
    protected bg: NineSlicePatch | Phaser.GameObjects.Image;
    protected titleText: Phaser.GameObjects.Text;
    private titlebg;
    private closeBtn;
    private closeHandler;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, key: string);
    setTitleText(text: string): void;
    setCloseHandler(handler: Handler): void;
    protected create(): void;
    protected createBackground(width: number, height: number): void;
    private onCloseHandler;
}
