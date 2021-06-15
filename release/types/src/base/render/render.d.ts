/// <reference types="tooqingphaser" />
import { IBaseCameraService } from "./cameras";
import { BaseSceneManager } from "./scene/scene.manager";
export interface IRender {
    readonly camerasManager: IBaseCameraService;
    readonly scaleRatio: number;
    readonly game: Phaser.Game;
    readonly emitter: Phaser.Events.EventEmitter;
    readonly sceneManager: BaseSceneManager;
    getMainScene(): Phaser.Scene;
    getCurrentRoomSize(): any;
    getCurrentRoomMiniSize(): any;
}
