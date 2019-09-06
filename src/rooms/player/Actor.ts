import { Player } from "./player";
import { IElementManager } from "../element/element.manager";
import { KeyboardListener } from "../../game/keyboard.manager";
import { op_client } from "pixelpai_proto";
import { DragonbonesModel } from "../display/dragonbones.model";
import { Pos } from "../../utils/pos";
import IActor = op_client.IActor;

// ME 我自己
export class Actor extends Player implements KeyboardListener {
    constructor(data: IActor, protected mElementManager: IElementManager) {
        super(data.id, new Pos(data.x, data.y, data.z | 0), mElementManager);
        this.mRenderable = true; // Actor is always renderable!!!
        const dbModel = new DragonbonesModel(data);
        this.load(dbModel);
        this.createDisplay();

        this.addDisplay();

        const camera: Phaser.Cameras.Scene2D.Camera | undefined = this.mElementManager.camera;
        if (camera && this.mDisplay) {
            camera.startFollow(this.mDisplay.GameObject);
        }
    }

    // override super's method.
    public setRenderable(isRenderable: boolean): void {
        // do nothing!
        // Actor is always renderable!!!
    }

    onKeyDown(keys: number[]): void {
        // TODO
    }

    onKeyUp(keys: number[]): void {
        // TODO
    }
}
