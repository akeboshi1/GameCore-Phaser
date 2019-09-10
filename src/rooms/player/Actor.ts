import {Player} from "./player";
import {IElementManager} from "../element/element.manager";
import {KeyboardListener} from "../../game/keyboard.manager";
import {op_client} from "pixelpai_proto";
import {DragonbonesModel} from "../display/dragonbones.model";
import {ISprite} from "../element/sprite";

// ME 我自己
export class Actor extends Player implements KeyboardListener {
    readonly GameObject: Phaser.GameObjects.GameObject;
    constructor(sprite: ISprite, protected mElementManager: IElementManager) {
        super(sprite, mElementManager);
        this.mRenderable = true; // Actor is always renderable!!!
        this.mDisplayInfo = new DragonbonesModel(sprite);
        // this.load(dbModel);
        this.createDisplay();
        this.setPosition(sprite.pos);
        this.addDisplay();

        const camera: Phaser.Cameras.Scene2D.Camera | undefined = this.mElementManager.camera;
        if (this.mElementManager) {
            const roomService = this.mElementManager.roomService;
            if (roomService && roomService.cameraService) {
                roomService.cameraService.startFollow(this.mDisplay.GameObject);
            }
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
