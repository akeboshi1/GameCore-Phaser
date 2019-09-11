
import { WorldService } from "./world.service";
import { Logger } from "../utils/log";
import { Size } from "../utils/size";

export interface JoyStickListener {
    dragUp(angle: number): void;
    dragStop(): void;
}

export class JoyStickManager {
    private mScene: Phaser.Scene;
    private mJoyStick: JoyStick;
    private mJoyListeners: JoyStickListener[];
    constructor(private worldService: WorldService) {
        this.mJoyListeners = [];
    }

    public setScene(scene: Phaser.Scene) {
        this.mScene = scene;
        if (!this.mScene) return;
        const size: Size = this.worldService.getSize();
        const con: Phaser.GameObjects.Container = this.mScene.add.container(250, size.height - 240);
        this.mJoyStick = new JoyStick(this.mScene, con, this.mJoyListeners);
    }

    public addListener(l: JoyStickListener) {
        // this.mJoyStick.addListener(l);
        this.mJoyListeners.push(l);
        if (this.mJoyStick) {
            this.mJoyStick.changeListeners(this.mJoyListeners);
        }
    }

    public removeListener(l: JoyStickListener) {
        // this.mJoyStick.removeListener(l);
        const idx: number = this.mJoyListeners.indexOf(l);
        if (idx >= 0) {
            this.mJoyListeners.splice(idx, 1);
        }
        if (this.mJoyStick) {
            this.mJoyStick.changeListeners(this.mJoyListeners);
        }
    }
}

export class JoyStick {
    public btn: Phaser.GameObjects.Sprite;
    private bg: Phaser.GameObjects.Sprite;
    private bgRadius: number;
    private mScene: Phaser.Scene;
    private parentCon: Phaser.GameObjects.Container;
    private mJoyListeners: JoyStickListener[];
    constructor(scene: Phaser.Scene, parentCon: Phaser.GameObjects.Container, joyListeners: JoyStickListener[]) {
        this.mScene = scene;
        this.parentCon = parentCon;
        this.mJoyListeners = joyListeners;
        this.load();
    }

    public load() {
        this.mScene.load.atlas("joystick", "resources/joystick.png", "resources/joystick.json");
        this.mScene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
        this.mScene.load.start();
    }

    public changeListeners(list: JoyStickListener[]) {
        this.mJoyListeners = list;
    }

    private onLoadCompleteHandler() {
        this.bg = this.mScene.add.sprite(0, 0, "joystick", "joystick_bg");
        this.bgRadius = this.bg.width - 70 >> 1;
        this.btn = this.mScene.add.sprite(this.bg.x, this.bg.y, "joystick", "joystick_tab");
        this.parentCon.addAt(this.bg, 0);
        this.parentCon.addAt(this.btn, 1);
        this.parentCon.alpha = .5;
        this.btn.setInteractive();
        this.mScene.input.setDraggable(this.btn);
        this.btn.on("drag", this.dragUpdate, this);
        this.btn.on("dragend", this.dragStop, this);
    }

    private dragUpdate(pointer, dragX, dragY) {
        let d = Math.sqrt(dragX * dragX + dragY * dragY);
        if (d > this.bgRadius) { d = this.bgRadius; }
        const r = Math.atan2(dragY, dragX);
        this.btn.x = Math.cos(r) * d + this.bg.x;
        this.btn.y = Math.sin(r) * d + this.bg.y;
        this.mJoyListeners.forEach((l: JoyStickListener) => {
            l.dragUp(r);
        });
    }

    private dragStop(pointer) {
        this.btn.x = this.bg.x;
        this.btn.y = this.bg.y;
        Logger.log("dragEnd");
        this.mJoyListeners.forEach((l: JoyStickListener) => {
            l.dragStop();
        });
    }

}
