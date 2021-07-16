/// <reference types="tooqingphaser" />
import { BasicScene } from "baseRender";
export declare class RoomScene extends BasicScene {
    protected mRoomID: any;
    constructor(config: string | Phaser.Types.Scenes.SettingsConfig);
    init(data: any): void;
    create(): void;
    protected initListener(): void;
    protected onGameOutHandler(): void;
    protected onPointerDownHandler(pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]): void;
    protected onPointerUpHandler(pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]): void;
}
