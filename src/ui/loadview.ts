import { Textures } from "phaser";
import { IRoomService } from "../rooms/room";
import { Size } from "../utils/size";

export class LoadingView {
    constructor(private mScene: Phaser.Scene, private mRoom: IRoomService) {
        this.createView();
    }

    public createView() {
        const size: Size = this.mRoom.world.getSize();
        const graphics = this.mScene.add.graphics();
        graphics.fillStyle(0xffffff);
        graphics.fillRect(0, 0, size.width, size.height);
        graphics.alpha = .8;
        this.mScene.add.sprite(size.width >> 1, size.height >> 1, "loading");
    }
    public show() {

    }
    public close() {

    }

    public resize() {

    }
    public destroy() {

    }
}
