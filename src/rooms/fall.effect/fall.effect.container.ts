import { FallEffect } from "./fall.effect";
import { Pos } from "../../utils/pos";
import { IRoomService } from "../room";

export class FallEffectContainer {
    private mFalls: FallEffect[];
    constructor(private scene: Phaser.Scene, private room: IRoomService) {
        this.mFalls = [];
    }

    public addFall(pos: Pos) {
        if (!pos) {
            return;
        }
        const fall = new FallEffect(this.scene);
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
