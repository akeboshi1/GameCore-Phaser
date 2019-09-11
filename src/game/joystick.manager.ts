import { PacketHandler, PBpacket } from "net-socket-packet";
import { WorldService } from "./world.service";
import { ConnectionService } from "../net/connection.service";
import { IRoomService, Room } from "../rooms/room";
import { ICameraService } from "../rooms/cameras/cameras.manager";
import { Actor } from "../rooms/player/Actor";
import { Logger } from "../utils/log";
import { Direction } from "../rooms/element/element";
import { op_virtual_world } from "pixelpai_proto";

export class JoyStickManager extends PacketHandler {
    private mConnect: ConnectionService;
    private mScene: Phaser.Scene;
    private mJoyStick: JoyStick;
    private mRoom: IRoomService;
    constructor(private worldService: WorldService) {
        super();
        this.mConnect = this.worldService.connection;
    }

    public setScene(scene: Phaser.Scene) {
        this.mScene = scene;
        if (!this.mScene) return;
        const con: Phaser.GameObjects.Container = this.mScene.add.container(500, 500);
        this.mJoyStick = new JoyStick(this.mScene, con, this.mRoom, this.mConnect);
    }

    public setRoom(room: IRoomService) {
        this.mRoom = room;
    }
}

export class JoyStick {
    private bg: Phaser.GameObjects.Sprite;
    private btn: Phaser.GameObjects.Sprite;
    private bgRadius: number;
    private mScene: Phaser.Scene;
    private parentCon: Phaser.GameObjects.Container;
    private mActor: Actor;
    private mRoom: IRoomService;
    private mdownStr: string;
    private mConnect: ConnectionService;
    constructor(scene: Phaser.Scene, parentCon: Phaser.GameObjects.Container, room: IRoomService, connect: ConnectionService) {
        this.mScene = scene;
        this.parentCon = parentCon;
        this.mRoom = room;
        this.mActor = room.actor;
        this.mConnect = connect;
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
        Logger.log("angle:" + r);
        let dir: number;
        let keyArr: number[] = [];
        if (r <= 0 && r > (-Math.PI / 2)) {
            dir = r !== 0 ? Direction.east_north : Direction.east;
        } else if (r <= (-Math.PI / 2) && r > (-Math.PI)) {
            dir = r !== (-Math.PI / 2) ? Direction.north_weat : Direction.north;
        } else if (r > (Math.PI / 2) && r <= Math.PI) {
            dir = r !== Math.PI ? Direction.weat_south : Direction.weat;
        } else if (r > 0 && r <= (Math.PI / 2)) {
            dir = r !== Math.PI / 2 ? Direction.south_east : Direction.south;
        }
        switch (dir) {
            case 0:
                keyArr = [38];
                break;
            case 1:
                keyArr = [37, 38];
                break;
            case 2:
                keyArr = [37];
                break;
            case 3:
                keyArr = [37, 40];
                break;
            case 4:
                keyArr = [40];
                break;
            case 5:
                keyArr = [39, 40];
                break;
            case 6:
                keyArr = [39];
                break;
            case 7:
                keyArr = [38, 39];
                break;
        }
        if (this.mdownStr === keyArr.toString()) return;
        this.mdownStr = keyArr.toString();
        this.mActor.setDirection(dir);
        this.mRoom.playerManager.startActorMove();
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN);
        const content: op_virtual_world.IOP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN = pkt.content;
        content.keyCodes = keyArr;
        this.mConnect.send(pkt);
    }

    private dragStop(pointer) {
        this.btn.x = this.bg.x;
        this.btn.y = this.bg.y;
        Logger.log("dragEnd");
        this.mRoom.playerManager.stopActorMove();
    }

}
