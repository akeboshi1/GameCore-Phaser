import { FallEffect } from "./fall.effect";
import { Pos } from "../../game/core/utils/pos";
import { IRoomService } from "../room";

export class FallEffectContainer {
    private mFalls: FallEffect[];
    constructor(private scene: Phaser.Scene, private room: IRoomService) {
        this.mFalls = [];
    }

    public addFall(pos: Pos, enable: boolean) {
        if (!pos) {
            return;
        }
        const fall = new FallEffect(this.scene, this.room.world.scaleRatio);
        fall.once("remove", this.onRemoveHandler, this);
        fall.setPosition(pos.x, pos.y);
        this.room.addToSceneUI(fall);
    }

    private onRemoveHandler(fall: FallEffect) {
        if (!fall) {
            return;
        }
    }
}
