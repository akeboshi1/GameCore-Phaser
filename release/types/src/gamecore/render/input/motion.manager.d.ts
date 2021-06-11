/// <reference types="tooqinggamephaser" />
import { Render } from "../render";
export declare class MotionManager {
    protected render: Render;
    enable: boolean;
    protected scene: Phaser.Scene;
    protected uiScene: Phaser.Scene;
    private gameObject;
    private scaleRatio;
    private isHolding;
    private holdTime;
    private holdDelay;
    private curtime;
    private isRunning;
    constructor(render: Render);
    addListener(): void;
    removeListener(): void;
    resize(width: number, height: number): void;
    update(time: number, delta: number): void;
    setScene(scene: Phaser.Scene): void;
    pauser(): void;
    resume(): void;
    destroy(): void;
    onGuideOnPointUpHandler(pointer: Phaser.Input.Pointer, id: number): Promise<void>;
    protected onPointerDownHandler(pointer: Phaser.Input.Pointer): Promise<void>;
    protected onPointerUpHandler(pointer: Phaser.Input.Pointer): Promise<void>;
    protected getEleMovePath(id: any, pointer: any): Promise<void>;
    protected onPointerMoveHandler(pointer: Phaser.Input.Pointer): Promise<void>;
    protected onUiGameObjectDownHandler(pointer: any): void;
    protected onGameObjectDownHandler(pointer: any, gameObject: any): void;
    protected onGameObjectUpHandler(pointer: any, gameObject: any): void;
    protected getMountId(id: number): any;
    private start;
    private movePath;
    private stop;
    private getPreUserPos;
    private clearGameObject;
}
