import { PacketHandler } from "net-socket-packet";
import { WorldService } from "./world.service";
import { ConnectionService } from "../net/connection.service";
import { IRoomService } from "../rooms/room";
import { ICameraService } from "../rooms/cameras/cameras.manager";
import { Actor } from "../rooms/player/Actor";
import { Logger } from "../utils/log";

export class JoyStickManager extends PacketHandler {
    private mConnect: ConnectionService;
    private mScene: Phaser.Scene;
    private mJoyStick: JoyStick;
    constructor(private worldService: WorldService) {
        super();
        this.mConnect = this.worldService.connection;
    }

    public setRoom(scene: Phaser.Scene) {
        this.mScene = scene;
        if (!this.mScene) return;
        const con: Phaser.GameObjects.Container = this.mScene.add.container(500, 500);
        this.mJoyStick = new JoyStick(scene, con);
        // this.mRoom.addToUI(this.mJoyStick);
    }

    public setActor(actor: Actor) {
        // this.mScene.physics.add.existing(actor.GameObject, false);
    }
}

export class JoyStick {
    private bg: Phaser.GameObjects.Sprite;
    private btn: Phaser.GameObjects.Sprite;
    private bgRadius: number;
    private mScene: Phaser.Scene;
    private parentCon: Phaser.GameObjects.Container;
    constructor(scene: Phaser.Scene, parentCon: Phaser.GameObjects.Container) {
        this.mScene = scene;
        this.parentCon = parentCon;
        this.load();
    }

    public load() {
        this.mScene.load.atlas("joystick", "resources/button.png", "resources/button.json");
        this.mScene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
        this.mScene.load.start();
    }

    private onLoadCompleteHandler() {
        this.bg = this.mScene.add.sprite(0, 0, "joystick", "1.png");
        this.bgRadius = this.bg.width >> 1;
        this.btn = this.mScene.add.sprite(this.bg.x, this.bg.y, "joystick", "2.png");
        this.parentCon.addAt(this.bg, 0);
        this.parentCon.addAt(this.btn, 1);
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
    }

    private dragStop(pointer) {
        this.btn.x = this.bg.x;
        this.btn.y = this.bg.y;
        Logger.log("dragEnd");
    }

}
