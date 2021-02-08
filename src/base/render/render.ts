import { ICameraService } from "./cameras/cameras.manager";

export interface IRender {
    readonly camerasManager: ICameraService;
    readonly scaleRatio: number;
    readonly game: Phaser.Game;

    getMainScene(): Phaser.Scene;
    getCurrentRoomSize(): any;
    getCurrentRoomMiniSize(): any;
}
