import { ICameraService } from "./cameras/cameras.manager";
import { BaseSceneManager } from "./scene/scene.manager";

export interface IRender {
    readonly camerasManager: ICameraService;
    readonly scaleRatio: number;
    readonly game: Phaser.Game;
    readonly emitter: Phaser.Events.EventEmitter;
    readonly sceneManager: BaseSceneManager;

    getMainScene(): Phaser.Scene;
    getCurrentRoomSize(): any;
    getCurrentRoomMiniSize(): any;
}
