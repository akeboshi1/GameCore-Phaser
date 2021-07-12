/// <reference types="tooqingphaser" />
import { Render } from "../render";
import { MouseManager } from "./mouse.manager";
export declare class InputManager {
    private render;
    private mMouseManager;
    private mJoystickManager;
    private mScene;
    constructor(render: Render);
    showJoystick(): void;
    setScene(scene: Phaser.Scene): void;
    resize(width: number, height: number): void;
    update(time: number, delta: number): void;
    destroy(): void;
    changeMouseManager(mng: MouseManager): void;
}
