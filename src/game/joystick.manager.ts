import { PacketHandler } from "net-socket-packet";
import { WorldService } from "./world.service";
import { ConnectionService } from "../net/connection.service";
import { IRoomService } from "../rooms/room";
import { ICameraService } from "../rooms/cameras/cameras.manager";
import { Actor } from "../rooms/player/Actor";
import { Logger } from "../utils/log";

export class JoyStickManager extends PacketHandler {
    private mConnect: ConnectionService;
    private mRoom: IRoomService;
    private mScene: Phaser.Scene;
    private mJoyStick: JoyStick;
    constructor(private worldService: WorldService) {
        super();
        this.mConnect = this.worldService.connection;
    }

    public setRoom(room: IRoomService) {
        this.mRoom = room;
        this.mScene = room.scene;
        if (!this.mScene) return;
        // this.mJoyStick = new JoyStick(room);
        // this.mJoyStick.x = 500;
        // this.mJoyStick.y = 500;
        // this.mRoom.addToUI(this.mJoyStick);
    }

    public setActor(actor: Actor) {
        // this.mScene.physics.add.existing(actor.GameObject, false);
    }
}

export class JoyStick extends Phaser.GameObjects.Container {
    private bg: Phaser.GameObjects.Sprite;
    private btn: Phaser.GameObjects.Sprite;
    private bgRadius: number;
    private mScene: Phaser.Scene;
    constructor(private room: IRoomService) {
        super(room.scene);
        this.mScene = room.scene;
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
        this.addAt(this.bg, 0);
        this.addAt(this.btn, 1);
        this.setInteractive(new Phaser.Geom.Circle(0, 0, this.bgRadius), Phaser.Geom.Circle.Contains);
        this.btn.setInteractive();
        this.mScene.input.setDraggable(this.btn);
        this.btn.on("pointerdown", () => {
            this.btn.setTint(0xff0000);
        }, this);
        this.mScene.input.on("drag", this.dragUpdate, this);
        this.mScene.input.on("dragend", this.dragStop, this);
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
