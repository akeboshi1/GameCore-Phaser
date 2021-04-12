import { Handler } from "utils";
import { PicaManorBasePanel } from "./PicaManorBasePanel";
export declare class PicaManorTipsPanel extends PicaManorBasePanel {
    private nineButton;
    private contentText;
    private zoom;
    private sendHandler;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string);
    setManorTipsData(tiptext: string): void;
    setHandler(send: Handler): void;
    protected create(): void;
    protected createBackground(width: number, height: number): void;
    private onNineButtonHandler;
}
