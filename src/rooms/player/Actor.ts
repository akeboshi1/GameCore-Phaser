import { Player } from "./player";
import { IElementManager } from "../element/element.manager";
import { KeyboardListener } from "../../game/keyboard.manager";
import { ISprite } from "../element/sprite";
import { JoyStickListener } from "../../game/joystick.manager";
import { Direction } from "../element/element";
import { IRoomService } from "../room";

// ME 我自己
export class Actor extends Player implements KeyboardListener, JoyStickListener {
    readonly GameObject: Phaser.GameObjects.GameObject;
    private mdownStr: string;
    private mRoom: IRoomService;
    constructor(sprite: ISprite, protected mElementManager: IElementManager) {
        super(sprite, mElementManager);
        this.mRenderable = true; // Actor is always renderable!!!
        this.addDisplay();
        this.mRoom = this.mElementManager.roomService;

        this.mRoom.world.inputManager.addListener(this);

        if (this.mElementManager) {
            const roomService = this.mElementManager.roomService;
            if (roomService && roomService.cameraService) {
                roomService.cameraService.startFollow(this.mDisplay);
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

    dragUp(r: number) {
        let dir: number;
        let keyArr: number[] = [];
        if (r <= 0 && r > (-Math.PI / 2)) {
            dir = r !== 0 ? Direction.east_north : Direction.east;
        } else if (r <= (-Math.PI / 2) && r > (-Math.PI)) {
            dir = r !== (-Math.PI / 2) ? Direction.north_west : Direction.north;
        } else if (r > (Math.PI / 2) && r <= Math.PI) {
            dir = r !== Math.PI ? Direction.west_south : Direction.west;
        } else if (r > 0 && r <= (Math.PI / 2)) {
            dir = r !== Math.PI / 2 ? Direction.south_east : Direction.south;
        }
        switch (dir) {
            case 0:
                keyArr = [38, 87];
                break;
            case 1:
                keyArr = [37, 38, 65, 87];
                break;
            case 2:
                keyArr = [37, 65];
                break;
            case 3:
                keyArr = [37, 40, 65, 83];
                break;
            case 4:
                keyArr = [40, 83];
                break;
            case 5:
                keyArr = [39, 40, 68, 87];
                break;
            case 6:
                keyArr = [39, 68];
                break;
            case 7:
                keyArr = [38, 39, 87, 68];
                break;
        }
        if (this.mdownStr === keyArr.toString()) return;
        this.mdownStr = keyArr.toString();
        this.mRoom.requestActorMove(dir, keyArr);
    }

    dragStop() {
        this.mdownStr = "";
        this.mElementManager.roomService.playerManager.stopActorMove();
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
                // 65, 87, 68, 83
                switch (keyCode) {
                    case 37:
                    case 65:
                        outPut += -1;
                        break;
                    case 38:
                    case 87:
                        outPut += -3;
                        break;
                    case 39:
                    case 68:
                        outPut += 1;
                        break;
                    case 40:
                    case 83:
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
