import { IRoomService } from "../rooms/room";

export class BaseFace extends Phaser.GameObjects.Container {
    private mBtnF;
    constructor(scene: Phaser.Scene, room: IRoomService) {
        super(scene);
    }
}
