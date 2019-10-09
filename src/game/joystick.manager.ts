import { WorldService } from "./world.service";
import { Logger } from "../utils/log";
import { Size } from "../utils/size";
import { InputListener, InputManager } from "./input.service";
import { IRoomService } from "../rooms/room";
import { Direction } from "../rooms/element/element";
import { op_def } from "pixelpai_proto";

export class JoyStickManager implements InputManager {
    private mRoom: IRoomService;
    private mScene: Phaser.Scene;
    private mJoyStick: JoyStick;
    private mJoyListeners: InputListener[];
    private mParentcon: Phaser.GameObjects.Container;
    private mScale: number;
    private mKeyEvents: op_def.IKeyCodeEvent[];
    private mKeyEventMap: Map<op_def.TQ_EVENT, op_def.IKeyCodeEvent>;
    constructor(private worldService: WorldService, keyEvents: op_def.IKeyCodeEvent[]) {
        this.mJoyListeners = [];
        this.mScale = worldService.uiScale;
        this.mKeyEvents = keyEvents;
        this.mKeyEventMap = new Map();
        Logger.debug(`JoyStickManager ${worldService.uiScale}`);
    }

    onRoomChanged(currentRoom: IRoomService, previousRoom?: IRoomService): void {
    }

    public setScene(scene: Phaser.Scene) {
        this.mScene = scene;
        if (!this.mScene) return;
        const len = this.mKeyEvents.length;
        let keyEvent: op_def.IKeyCodeEvent;
        let codes: op_def.KeyCode[];
        let eventName: op_def.TQ_EVENT;
        for (let i = 0; i < len; i++) {
            keyEvent = this.mKeyEvents[i];
            codes = keyEvent.keyCodes;
            eventName = keyEvent.tqEvent;
            if (!this.mKeyEventMap.get(eventName)) {
                this.mKeyEventMap.set(eventName, keyEvent);
            }
        }
        this.mKeyEvents.length = 0;
        this.mKeyEvents = null;

        const size: Size = this.worldService.getSize();
        this.mParentcon = this.mScene.add.container(0, 0); // (150, size.height - 150);
        const scale = !this.mScale ? 1 : this.mScale;
        this.mJoyStick = new JoyStick(this.mScene, this.worldService, this.mParentcon, this.mJoyListeners, this.mScale);
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

    public getKeyCodes(eventName: number): number[] {
        if (!this.mKeyEventMap.has(eventName)) return undefined;
        const len: number = this.mKeyEventMap.get(eventName).keyCodes.length;
        const keyCodes: number[] = [];
        for (let i: number = 0; i < len; i++) {
            const keyCode: op_def.KeyCode = this.mKeyEventMap.get(eventName).keyCodes[i];
            keyCodes.push(keyCode);
        }
        return keyCodes;
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

    set enable(val: boolean) {
    }

    get enable(): boolean {
        return true;
    }
}

export class JoyStick {
    public btn: Phaser.GameObjects.Sprite;
    private bg: Phaser.GameObjects.Sprite;
    private bgRadius: number;
    private mScene: Phaser.Scene;
    private mWorld: WorldService;
    private parentCon: Phaser.GameObjects.Container;
    private mJoyListeners: InputListener[];
    private mdownStr: string;
    private mScale: number;
    private mbtn0: Phaser.GameObjects.Sprite;
    private mjoystickCon: Phaser.GameObjects.Container;
    private mbtnCon: Phaser.GameObjects.Container;
    private mKeyCodes: any[];
    constructor(scene: Phaser.Scene, world: WorldService, parentCon: Phaser.GameObjects.Container, joyListeners: InputListener[], scale: number) {
        this.mScene = scene;
        this.mWorld = world;
        this.parentCon = parentCon;
        this.mJoyListeners = joyListeners;
        this.mScale = scale;
        this.mKeyCodes = [];
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

    public resize() {
        const size: Size = this.mWorld.getSize();
        if (this.mbtnCon) {
            this.mbtnCon.x = size.width - this.mScale * 120;
            this.mbtnCon.y = size.height - this.mScale * 120;
        }
        if (this.mjoystickCon) {
            this.mjoystickCon.x = this.mScale * 260;
            this.mjoystickCon.y = size.height - this.mScale * 260;
        }
    }

    private onLoadCompleteHandler() {
        const size: Size = this.mWorld.getSize();
        this.bg = this.mScene.make.sprite(undefined, false);
        this.bg.setTexture("joystick", "joystick_bg");
        this.bgRadius = this.bg.width - 70 >> 1;
        this.btn = this.mScene.make.sprite(undefined, false);
        this.btn.setTexture("joystick", "joystick_tab");
        this.btn.x = this.bg.x;
        this.btn.y = this.bg.y;
        this.mjoystickCon = this.mScene.make.container(undefined, false);
        this.mjoystickCon.alpha = .5;
        // this.mjoystickCon.x = 150;
        // this.mjoystickCon.y = size.height - 150;
        this.mjoystickCon.addAt(this.bg, 0);
        this.mjoystickCon.addAt(this.btn, 1);
        this.parentCon.add(this.mjoystickCon);
        // this.parentCon.alpha = .5;
        this.btn.setInteractive();
        this.mScene.input.setDraggable(this.btn);
        this.btn.on("drag", this.dragUpdate, this);
        this.btn.on("dragend", this.dragStop, this);
        this.mbtnCon = this.mScene.make.container(undefined, false);
        this.mbtn0 = this.mScene.add.sprite(0, 0, "joystick", "btn");
        this.mbtnCon.add(this.mbtn0);
        this.mbtn0.setInteractive();
        this.mjoystickCon.scaleX = this.mjoystickCon.scaleY = this.mScale;
        this.mbtnCon.scaleX = this.mbtnCon.scaleY = this.mScale;
        this.parentCon.add(this.mbtnCon);
        this.parentCon.setSize(size.width, size.height);
        this.mbtn0.on("pointerup", this.uiUp, this);
        this.resize();
    }

    private uiUp(pointer, gameObject) {
        this.mScene.tweens.add({
            targets: this.mbtn0,
            duration: 50,
            ease: "Linear",
            props: {
                scaleX: { value: .5 },
                scaleY: { value: .5 },
            },
            yoyo: true,
            repeat: 0,
        });
        this.mbtn0.scaleX = this.mbtn0.scaleY = 1;
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
        keyArr = this.getKeys(dir);
        if (this.mdownStr === keyArr.toString()) return false;
        this.mdownStr = keyArr.toString();
        l.downHandler(dir, keyArr);
        return true;
    }

    private getKeys(dir: number): number[] {
        let keyArr: any[] = this.mKeyCodes[dir];
        if (keyArr) {
            return keyArr;
        }
        switch (dir) {
            case 0:
                keyArr = this.mWorld.inputManager.getKeyCodes(op_def.TQ_EVENT.TQ_MOVE_UP);
                break;
            case 1:
                keyArr = Array.prototype.concat.apply(this.mWorld.inputManager.getKeyCodes(op_def.TQ_EVENT.TQ_MOVE_UP).concat,
                    this.mWorld.inputManager.getKeyCodes(op_def.TQ_EVENT.TQ_MOVE_LEFT));
                break;
            case 2:
                keyArr = this.mWorld.inputManager.getKeyCodes(op_def.TQ_EVENT.TQ_MOVE_LEFT);
                break;
            case 3:
                keyArr = Array.prototype.concat.apply(this.mWorld.inputManager.getKeyCodes(op_def.TQ_EVENT.TQ_MOVE_DOWN),
                    this.mWorld.inputManager.getKeyCodes(op_def.TQ_EVENT.TQ_MOVE_LEFT));
                break;
            case 4:
                keyArr = this.mWorld.inputManager.getKeyCodes(op_def.TQ_EVENT.TQ_MOVE_DOWN);
                break;
            case 5:
                keyArr = Array.prototype.concat.apply(this.mWorld.inputManager.getKeyCodes(op_def.TQ_EVENT.TQ_MOVE_DOWN),
                    this.mWorld.inputManager.getKeyCodes(op_def.TQ_EVENT.TQ_MOVE_RIGHT));
                break;
            case 6:
                keyArr = this.mWorld.inputManager.getKeyCodes(op_def.TQ_EVENT.TQ_MOVE_RIGHT);
                break;
            case 7:
                keyArr = Array.prototype.concat.apply(this.mWorld.inputManager.getKeyCodes(op_def.TQ_EVENT.TQ_MOVE_UP),
                    this.mWorld.inputManager.getKeyCodes(op_def.TQ_EVENT.TQ_MOVE_RIGHT));
                break;
        }
        this.mKeyCodes[dir] = keyArr;
        return keyArr;
    }

    private checkdragUp(): boolean {
        this.mdownStr = "";
        return true;
    }
}
