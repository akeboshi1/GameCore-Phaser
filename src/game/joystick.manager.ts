import { WorldService } from "./world.service";
import { Logger } from "../utils/log";
import { Size } from "../utils/size";
import { InputListener, InputManager } from "./input.service";
import { IRoomService } from "../rooms/room";
import { Direction } from "../rooms/element/element";
import { op_def } from "pixelpai_proto";
import { PlayScene } from "../scenes/play";

const TEMP_CONST = {
    MOUSE_DOWN: 0,
    MOUSE_MOVE: 1,
    MOUSE_UP: 2,
    TOUCH_START: 3,
    TOUCH_MOVE: 4,
    TOUCH_END: 5,
    POINTER_LOCK_CHANGE: 6,
    TOUCH_CANCEL: 7,
    MOUSE_WHEEL: 8
};
export class JoyStickManager implements InputManager {
    private mRoom: IRoomService;
    private mScene: Phaser.Scene;
    private mJoyStick: JoyStick;
    private mJoyListeners: InputListener[];
    private mParentcon: Phaser.GameObjects.Container;
    private mScale: number;
    private mKeyEvents: op_def.IKeyCodeEvent[];
    private mKeyEventMap: Map<op_def.TQ_EVENT, op_def.IKeyCodeEvent>;
    private mEnabled: boolean = false;
    constructor(private worldService: WorldService, keyEvents: op_def.IKeyCodeEvent[]) {
        this.mJoyListeners = [];
        this.mScale = worldService.uiScale;
        this.mKeyEvents = keyEvents;
        this.mKeyEventMap = new Map();
        Logger.getInstance().debug(`JoyStickManager ${worldService.uiScale}`);
    }

    onRoomChanged(currentRoom: IRoomService, previousRoom?: IRoomService): void {
    }

    public setScene(scene: Phaser.Scene) {
        this.mScene = scene;
        if (!this.mScene || !this.mKeyEvents) return;
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

        this.mParentcon = this.mScene.add.container(0, 0); // (150, size.height - 150);
        const scale = !this.mScale ? 1 : this.mScale;
        this.mJoyStick = new JoyStick(this.mScene, this.worldService, this.mParentcon, this.mJoyListeners, scale);
    }

    public resize() {
        if (!this.mParentcon) return;
        this.mParentcon.scaleX = this.mParentcon.scaleY = this.worldService.uiScale;
        // const size: Size = this.worldService.getSize();
        // const mainUIMed = this.worldService.uiManager.getMediator(MainUIMediator.NAME) as MainUIMediator;
        // const padHei: number = !mainUIMed ? this.mParentcon.height : (mainUIMed.getView() as MainUIMobile).getBottomView().height;
        // if (this.mParentcon) {
        //     if (this.worldService.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
        //         this.mParentcon.x = this.mParentcon.width * this.worldService.uiScale;
        //         this.mParentcon.y = size.height - this.mParentcon.height * this.worldService.uiScale;
        //     } else {
        //         this.mParentcon.x = this.mParentcon.width * this.worldService.uiScale;
        //         this.mParentcon.y = size.height - (padHei + this.mParentcon.height) * this.worldService.uiScale;
        //     }
        //     this.mParentcon.scaleX = this.mParentcon.scaleY = this.worldService.uiScale;
        // }
    }

    public tweenView(show: boolean) {
        const toAlpha: number = show === true ? 1 : 0;
        this.mParentcon.visible = show;
        // const size: Size = this.worldService.getSize();
        // let baseX: number;
        // let baseY: number;
        // const mainUIMed = this.worldService.uiManager.getMediator(MainUIMediator.NAME) as MainUIMediator;
        // const padHei: number = !mainUIMed ? this.mParentcon.height : (mainUIMed.getView() as MainUIMobile).getBottomView().height;
        // if (this.worldService.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
        //     baseX = this.mParentcon.width * this.worldService.uiScale;
        //     baseY = size.height - this.mParentcon.height * this.worldService.uiScale;
        // } else {
        //     baseX = this.mParentcon.width * this.worldService.uiScale;
        //     baseY = size.height - (padHei + this.mParentcon.height) * this.worldService.uiScale;
        // }

        // const toX: number = show === true ? baseX : baseX - this.mParentcon.width;
        // const toY: number = baseY;
        // this.mScene.tweens.add({
        //     targets: this.mParentcon,
        //     duration: 200,
        //     ease: "Linear",
        //     props: {
        //         x: { value: toX },
        //         y: { value: toY },
        //         alpha: { value: toAlpha },
        //     },
        // });

    }

    public addListener(l: InputListener) {
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

    getKeyDowns(): number[] {
        return [];
    }

    getKeyUps(): number[] {
        return [];
    }

    downHandler() {
    }

    upHandler() {
    }

    set enable(val: boolean) {
        this.mEnabled = val;
    }

    get enable(): boolean {
        return this.mEnabled;
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
    // private mjoystickCon: Phaser.GameObjects.Container;
    private mKeyCodes: any[];
    private mDown: boolean = false;
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

    private onLoadCompleteHandler() {
        const size: Size = this.mWorld.getSize();
        this.bg = this.mScene.make.sprite(undefined, false);
        this.bg.setTexture("joystick", "joystick_bg.png");
        this.bgRadius = this.bg.width + 100 >> 1;
        this.btn = this.mScene.make.sprite(undefined, false);
        this.btn.name = "joystick_btn";
        this.btn.setTexture("joystick", "joystick_tab.png");
        this.btn.x = this.bg.x;
        this.btn.y = this.bg.y;
        this.parentCon.alpha = .5;
        this.parentCon.addAt(this.bg, 0);
        this.parentCon.addAt(this.btn, 1);
        this.btn.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.btn.width, this.btn.height), Phaser.Geom.Rectangle.Contains);
        // this.mScene.input.setDraggable(this.btn);
        this.mScene.input.on("pointerdown", this.downHandler, this);
        this.mScene.input.on("pointerup", this.upHandler, this);
        this.parentCon.setSize(this.bg.width, this.bg.height);
        this.parentCon.visible = false;
    }

    // private dragStart(pointer) {
    //     Logger.getInstance().log("dragstart");
    //     this.btn.on("drag", this.dragUpdate, this);
    //     this.btn.off("dragstart", this.dragStart, this);
    //     this.btn.on("dragend", this.dragStop, this);
    //     this.btn.on("dragcancel", this.dragStop, this);
    // }

    private downHandler(pointer, gameojectList) {
        if (!(this.mWorld.inputManager as JoyStickManager).enable) {
            return;
        }
        if (this.mDown) return;
        if (gameojectList) {
            if (gameojectList.length > 1) {
                return;
            } else if (gameojectList.length === 1) {
                if (gameojectList[0].name) {
                    if (gameojectList[0].name !== "joystick_btn") {
                        return;
                    }
                } else {
                    return;
                }
            }
        }
        this.mDown = true;
        this.mScene.input.on("pointermove", this.pointerMove, this);
        // 由于app环境下，游戏在浏览器中是全屏模式，所以需要在点击事件上除以当前UIscale调整位置
        this.parentCon.x = pointer.worldX;
        this.parentCon.y = pointer.worldY;
        this.parentCon.visible = true;
        // this.mScene.input.off("pointerdown", this.downHandler, this);
        // this.mScene.input.manager.updateInputPlugins(TEMP_CONST.TOUCH_END, [pointer]);
        // this.btn.on("dragstart", this.dragStart, this);
        // this.mScene.input.manager.updateInputPlugins(TEMP_CONST.TOUCH_START, [pointer]);
        // // phaser 的冒泡事件比较奇葩，没有停止冒泡的参数选项，只会把第一个有返回交互事件的scene返回过来，如果是多层scene，后续scene的交互就会return
        // // 实际是为了防止多个事件派发，其实很蠢，应该给参数让用户自己选择是否派发
        // const play: PlayScene = this.mWorld.game.scene.getScene(PlayScene.name) as PlayScene;
        // if (play) (play.input as any).update(TEMP_CONST.MOUSE_DOWN, [pointer]);
    }

    private pointerMove(pointer) {
        if (!(this.mWorld.inputManager as JoyStickManager).enable) {
            return;
        }
        const dragX = pointer.worldX - this.parentCon.x;
        const dragY = pointer.worldY - this.parentCon.y;
        let d = Math.sqrt(dragX * dragX + dragY * dragY);
        if (d > this.bgRadius) {
            d = this.bgRadius;
        }
        const r = Math.atan2(dragY, dragX);
        this.btn.x = Math.cos(r) * d;
        this.btn.y = Math.sin(r) * d;
        Logger.getInstance().debug(`dragX: ${dragX} / dragY: ${dragY} | this.parentCon.x: ${this.parentCon.x} / this.parentCon.y: ${this.parentCon.y}
        |this.btn.x:${this.btn.x}\this.btn.y:${this.btn.y}`);
        if (!(this.mWorld.inputManager as JoyStickManager).enable) {
            return;
        }
        this.mJoyListeners.forEach((l: InputListener) => {
            this.checkdragDown(l, r);
        });
    }

    // private dragUpdate(pointer, dragX, dragY) {
    //     Logger.getInstance().log("draging");
    //     let d = Math.sqrt(dragX * dragX + dragY * dragY);
    //     if (d > this.bgRadius) {
    //         d = this.bgRadius;
    //     }
    //     const r = Math.atan2(dragY, dragX);
    //     this.btn.x = Math.cos(r) * d + this.bg.x;
    //     this.btn.y = Math.sin(r) * d + this.bg.y;
    //     if (!(this.mWorld.inputManager as JoyStickManager).enable) {
    //         return;
    //     }
    //     this.mJoyListeners.forEach((l: InputListener) => {
    //         this.checkdragDown(l, r);
    //     });
    // }
    private upHandler(pointer?: Phaser.Geom.Point) {
        this.btn.x = this.bg.x;
        this.btn.y = this.bg.y;
        this.mDown = false;
        Logger.getInstance().log("pointerUp");
        this.parentCon.visible = false;
        this.mScene.input.off("pointermove", this.pointerMove, this);
        if (!(this.mWorld.inputManager as JoyStickManager).enable) {
            return;
        }
        this.mJoyListeners.forEach((l: InputListener) => {
            if (this.checkdragUp()) {
                l.upHandler();
            }
        });
    }

    // private dragStop(pointer) {
    //     this.btn.off("drag", this.dragUpdate, this);
    //     this.btn.off("dragend", this.dragStop, this);
    //     this.btn.off("dragcancel", this.dragStop, this);
    //     this.mScene.input.on("pointerdown", this.downHandler, this);
    //     this.btn.x = this.bg.x;
    //     this.btn.y = this.bg.y;
    //     Logger.getInstance().log("dragEnd");
    //     this.parentCon.visible = false;
    //     if (!(this.mWorld.inputManager as JoyStickManager).enable) {
    //         return;
    //     }
    //     this.mJoyListeners.forEach((l: InputListener) => {
    //         if (this.checkdragUp()) {
    //             l.upHandler();
    //         }
    //     });
    // }

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
        // if (!(this.mWorld.inputManager as JoyStickManager).enable) {
        //     return false;
        // }
        this.mWorld.roomManager.currentRoom.actor.setDirection(dir);
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
