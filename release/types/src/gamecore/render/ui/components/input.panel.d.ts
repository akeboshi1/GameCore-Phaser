import { Render } from "../../render";
export declare class InputPanel extends Phaser.Events.EventEmitter {
    private render;
    private mBackground;
    private mInput;
    private scene;
    constructor(scene: Phaser.Scene, render: Render, text?: string);
    private onCloseHandler;
    private onFoucesHandler;
}
