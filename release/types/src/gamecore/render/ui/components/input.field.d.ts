/// <reference types="tooqingphaser" />
import { InputText } from "apowophaserui";
export declare class InputField extends InputText {
    constructor(scene: Phaser.Scene, x: any, y?: number, width?: number, height?: number, config?: any);
    destroy(): void;
    private onKeypressHandler;
    private onFocusHandler;
    private onBlurHandler;
    private onGameobjectDown;
}
