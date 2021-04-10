import { ButtonEventDispatcher } from "./button.event.dispatch";
export declare class CommonBackground extends ButtonEventDispatcher {
    private background;
    private graphic;
    private bgFrame;
    private key;
    private bottomColor;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key?: string, bgframe?: string, color?: number);
    resize(width: number, height: number): void;
    protected init(): void;
}
