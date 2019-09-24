import {WorldService} from "./world.service";
import {Logger} from "../utils/log";
import {Size} from "../utils/size";
import {InputListener, InputManager} from "./input.service";
import {IRoomService} from "../rooms/room";
import {Direction} from "../rooms/element/element";

export class JoyStickManager implements InputManager {
    private mRoom: IRoomService;
    private mScene: Phaser.Scene;
    private mJoyStick: JoyStick;
    private mJoyListeners: InputListener[];
    private mParentcon: Phaser.GameObjects.Container;
    private mScale: number;

    constructor(private worldService: WorldService) {
        this.mJoyListeners = [];
        this.mScale = worldService.uiScale;
    }

    onRoomChanged(currentRoom: IRoomService, previousRoom?: IRoomService): void {
    }

    public setScene(scene: Phaser.Scene) {
        this.mScene = scene;
        if (!this.mScene) return;
        const size: Size = this.worldService.getSize();
        this.mParentcon = this.mScene.add.container(150, size.height - 150);
        this.mJoyStick = new JoyStick(this.mScene, this.mParentcon, this.mJoyListeners, this.mScale);
    }

    public resize() {
        const size: Size = this.worldService.getSize();
        this.mParentcon.x = 150;
        this.mParentcon.y = size.height - 150;
    }

    public addListener(l: InputListener) {
        // this.mJoyStick.addListener(l);
        this.mJoyListeners.push(l);
        if (this.mJoyStick) {
            this.mJoyStick.changeListeners(this.mJoyListeners);
        }
    }

    public removeListener(l: InputListener) {
        // this.mJoyStick.removeListener(l);
        const idx: number = this.mJoyListeners.indexOf(l);
        if (idx >= 0) {
            this.mJoyListeners.splice(idx, 1);
        }
        if (this.mJoyStick) {
            this.mJoyStick.changeListeners(this.mJoyListeners);
        }
    }

    downHandler() {
    }

    upHandler() {
    }
}

export class JoyStick {
    public btn: Phaser.GameObjects.Sprite;
    private bg: Phaser.GameObjects.Sprite;
    private bgRadius: number;
    private mScene: Phaser.Scene;
    private parentCon: Phaser.GameObjects.Container;
    private mJoyListeners: InputListener[];
    private mdownStr: string;
    private mScale: number;

    constructor(scene: Phaser.Scene, parentCon: Phaser.GameObjects.Container, joyListeners: InputListener[], scale?: number) {
        this.mScene = scene;
        this.parentCon = parentCon;
        this.mJoyListeners = joyListeners;
        this.mScale = scale | 1;
        this.load();
    }

    public load() {
        this.mScene.load.atlas("joystick",
            "./resources/ui/joystick/joystick.png",
            "./resources/ui/joystick/joystick.json");
        this.mScene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
        this.mScene.load.start();
    }

    public changeListeners(list: InputListener[]) {
        this.mJoyListeners = list;
    }

    private onLoadCompleteHandler() {
        this.bg = this.mScene.make.sprite(undefined, false);
        this.bg.setTexture("joystick", "joystick_bg");
        this.bgRadius = this.bg.width - 70 >> 1;
        this.btn = this.mScene.make.sprite(undefined, false);
        this.btn.setTexture("joystick", "joystick_tab");
        this.btn.x = this.bg.x;
        this.btn.y = this.bg.y;
        this.parentCon.addAt(this.bg, 0);
        this.parentCon.addAt(this.btn, 1);
        this.parentCon.alpha = .5;
        this.parentCon.scaleX = this.parentCon.scaleY = this.mScale;
        this.btn.setInteractive();
        this.mScene.input.setDraggable(this.btn);
        this.btn.on("drag", this.dragUpdate, this);
        this.btn.on("dragend", this.dragStop, this);
    }

    private dragUpdate(pointer, dragX, dragY) {
        let d = Math.sqrt(dragX * dragX + dragY * dragY);
        if (d > this.bgRadius) {
            d = this.bgRadius;
        }
        const r = Math.atan2(dragY, dragX);
        this.btn.x = Math.cos(r) * d + this.bg.x;
        this.btn.y = Math.sin(r) * d + this.bg.y;
        this.mJoyListeners.forEach((l: InputListener) => {
            this.checkdragDown(l, r);
        });
    }

    private dragStop(pointer) {
        this.btn.x = this.bg.x;
        this.btn.y = this.bg.y;
        Logger.log("dragEnd");
        this.mJoyListeners.forEach((l: InputListener) => {
            if (this.checkdragUp()) {
                l.upHandler();
            }
        });
    }

    private checkdragDown(l: InputListener, r: number): boolean {
        let dir: number;
        let keyArr: number[] = [];
        if (r <= 0 && r > (-Math.PI / 2)) {
            dir = r !== 0 ? Direction.right_up : Direction.right;
        } else if (r <= (-Math.PI / 2) && r > (-Math.PI)) {
            dir = r !== (-Math.PI / 2) ? Direction.up_left : Direction.up;
        } else if (r > (Math.PI / 2) && r <= Math.PI) {
            dir = r !== Math.PI ? Direction.left_down : Direction.left;
        } else if (r > 0 && r <= (Math.PI / 2)) {
            dir = r !== Math.PI / 2 ? Direction.down_right : Direction.down;
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
        if (this.mdownStr === keyArr.toString()) return false;
        this.mdownStr = keyArr.toString();
        l.downHandler(dir, keyArr);
        return true;
    }

    private checkdragUp(): boolean {
        this.mdownStr = "";
        return true;
    }

    // todo resize

}
