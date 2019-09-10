import { Player } from "./player";
import { IElementManager } from "../element/element.manager";
import { KeyboardListener } from "../../game/keyboard.manager";
import { op_client } from "pixelpai_proto";
import { DragonbonesModel } from "../display/dragonbones.model";
import { Pos } from "../../utils/pos";
import IActor = op_client.IActor;

// ME 我自己
export class Actor extends Player implements KeyboardListener {
    readonly GameObject: Phaser.GameObjects.GameObject;
    constructor(data: IActor, protected mElementManager: IElementManager) {
        super(data.id, null, mElementManager);
        this.mRenderable = true; // Actor is always renderable!!!
        this.mDisplayInfo = new DragonbonesModel(data);
        // this.load(dbModel);
        this.createDisplay();
        this.setPosition(new Pos(data.x, data.y, data.z | 0));
        this.addDisplay();
        this.mElementManager.roomService.world.keyboardManager.addListener(this);

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
        if (this.checkMoveKeyDown()) {
            this.mElementManager.roomService.playerManager.startActorMove();
        }
    }

    onKeyUp(keys: number[]): void {
        if (this.checkMoveKeyAllUp()) {
            this.mElementManager.roomService.playerManager.stopActorMove();
        }
    }

    private checkMoveKeyDown(): boolean {
        let key: Phaser.Input.Keyboard.Key;
        const keyList: Phaser.Input.Keyboard.Key[] = this.mElementManager.roomService.world.keyboardManager.keyList;
        const len = keyList.length;
        for (let i = 0; i < len; i++) {
            key = keyList[i];
            if (key && key.isDown) {
                return true;
            }
        }
        return false;
    }

    private checkMoveKeyAllUp(): boolean {
        let key: Phaser.Input.Keyboard.Key;
        const keyList: Phaser.Input.Keyboard.Key[] = this.mElementManager.roomService.world.keyboardManager.keyList;
        const len = keyList.length;
        for (let i = 0; i < len; i++) {
            key = keyList[i];
            if (key && key.isDown) {
                return false;
            }
        }
        return true;
    }

}
