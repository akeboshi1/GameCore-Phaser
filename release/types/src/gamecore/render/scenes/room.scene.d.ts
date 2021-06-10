/// <reference types="tooqinggamephaser" />
import { BasicScene } from "baseRender";
export declare class RoomScene extends BasicScene {
    protected mRoomID: any;
    init(data: any): void;
    create(): void;
    protected initListener(): void;
    protected onGameOutHandler(): void;
    protected onPointerDownHandler(pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]): void;
    protected onPointerUpHandler(pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]): void;
}
