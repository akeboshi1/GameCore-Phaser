import { Player } from "./player";
import { IElementManager } from "../element/element.manager";
import { KeyboardListener } from "../../game/keyboard.manager";
import { ISprite } from "../element/sprite";

// ME 我自己
export class Actor extends Player implements KeyboardListener {
    readonly GameObject: Phaser.GameObjects.GameObject;
    constructor(sprite: ISprite, protected mElementManager: IElementManager) {
        super(sprite, mElementManager);
        this.mRenderable = true; // Actor is always renderable!!!
        // this.mDisplayInfo = new DragonbonesModel(sprite);
        // this.load(dbModel);
        // this.createDisplay();
        // this.setPosition(sprite.pos);
        this.addDisplay();
        this.mElementManager.roomService.world.keyboardManager.addListener(this);

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
        let keyCode: number;
        let outPut: number = 0;
        for (let i = 0; i < len; i++) {
            key = keyList[i];
            keyCode = key.keyCode;
            if (key && key.isDown) {
                switch (keyCode) {
                    case 37:
                        outPut += -1;
                        break;
                    case 38:
                        outPut += -3;
                        break;
                    case 39:
                        outPut += 1;
                        break;
                    case 40:
                        outPut += 3;
                        break;
                }
            }
        }
        if (outPut === 0) {
            return false;
        }
        const curDir: number = this.getDirection();
        let newDir: number;
        switch (outPut) {
            case -1:
                newDir = curDir <= 1 ? 1 : 3;
                break;
            case -2:
                newDir = 7;
                break;
            case -3:
                newDir = curDir <= 3 ? 1 : 7;
                break;
            case -4:
                newDir = 1;
                break;
            case 1:
                newDir = curDir <= 5 ? 5 : 7;
                break;
            case 2:
                newDir = 3;
                break;
            case 3:
                newDir = curDir <= 3 ? 3 : 5;
                break;
            case 4:
                newDir = 5;
                break;
        }
        this.setDirection(newDir);
        return true;
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
