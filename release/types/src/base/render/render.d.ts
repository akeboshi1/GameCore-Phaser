import { Url } from "utils";
import { IBaseCameraService } from "./cameras";
import { BaseSceneManager } from "./scene/base.scene.manager";
export interface IRender {
    readonly camerasManager: IBaseCameraService;
    readonly scaleRatio: number;
    readonly game: Phaser.Game;
    readonly emitter: Phaser.Events.EventEmitter;
    readonly sceneManager: BaseSceneManager;
    url: Url;
    getMainScene(): Phaser.Scene;
    getCurrentRoomSize(): any;
    getCurrentRoomMiniSize(): any;
}
