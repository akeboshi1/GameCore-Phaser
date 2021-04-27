/// <reference types="tooqinggamephaser" />
import { Render } from "../render";
export declare enum MouseEvent {
    RightMouseDown = 1,
    RightMouseUp = 2,
    LeftMouseDown = 3,
    LeftMouseUp = 4,
    WheelDown = 5,
    WheelUp = 6,
    RightMouseHolding = 7,
    LeftMouseHolding = 8,
    Tap = 9
}
export declare class MouseManager {
    protected render: Render;
    protected running: boolean;
    protected zoom: number;
    protected scene: Phaser.Scene;
    private mGameObject;
    private mDownDelay;
    private mDownTime;
    private readonly delay;
    private debounce;
    private mClickID;
    constructor(render: Render);
    get clickID(): number;
    changeScene(scene: Phaser.Scene): void;
    resize(width: number, height: number): void;
    pause(): void;
    resume(): void;
    onUpdate(pointer: Phaser.Input.Pointer, gameobject: Phaser.GameObjects.GameObject): void;
    /**
     * 设置鼠标事件开关
     */
    set enable(value: boolean);
    get enable(): boolean;
    destroy(): void;
    protected onGameObjectDownHandler(pointer: any, gameObject: any): void;
    protected onGameObjectUpHandler(pointer: any, gameObject: any): void;
    protected onPointerDownHandler(pointer: any, gameobject: any): void;
    protected onPointerUp(pointer: any): void;
    private holdHandler;
    private sendMouseEvent;
}
