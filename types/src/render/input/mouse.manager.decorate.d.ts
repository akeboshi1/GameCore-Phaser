import { MouseManager } from "./mouse.manager";
import { Render } from "../render";
export declare class MouseManagerDecorate extends MouseManager {
    protected render: Render;
    private downGameObject;
    private downPointerPos;
    private downDisplayPos;
    private downDisplay;
    private roomSize;
    constructor(render: Render);
    destroy(): void;
    onUpdate(pointer: Phaser.Input.Pointer, gameobject: Phaser.GameObjects.GameObject): void;
    changeScene(scene: Phaser.Scene): void;
    protected onPointerDownHandler(pointer: Phaser.Input.Pointer): Promise<void>;
    protected onPointerUpHandler(pointer: Phaser.Input.Pointer): Promise<void>;
    protected onPointerMoveHandler(pointer: Phaser.Input.Pointer): Promise<void>;
    protected onPointeroutHandler(): void;
    protected onGameObjectDownHandler(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject): Promise<void>;
    private clearDownData;
    private addListener;
    private removeListener;
}
