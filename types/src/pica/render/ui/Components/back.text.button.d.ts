import { ButtonEventDispatcher } from "gamecoreRender";
export declare class BackTextButton extends ButtonEventDispatcher {
    private titleTex;
    constructor(scene: Phaser.Scene, dpr: number);
    setText(text: string): void;
    setTextStyle(style: any): void;
    setFontStyle(style?: string): void;
    protected init(): void;
}
