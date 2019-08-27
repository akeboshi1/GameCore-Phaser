import { ConnectionService } from "../net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { Geom } from "phaser";
import { op_virtual_world } from "pixelpai_proto";
import { WorldService } from "./world.service";
import { Room, RoomService } from "../rooms/room";


export enum MouseEvent {
    RightMouseDown = 1,
    RightMouseUp = 2,
    LeftMouseDown = 3,
    LeftMouseUp = 4,
    WheelDown = 5,
    WheelUp = 6,
    RightMouseHolding = 7,
    LeftMouseHolding = 8,
}

export class MouseManager extends PacketHandler {
    private mActivePointer: Phaser.Input.Pointer;
    private mGroundLayer: Phaser.GameObjects.Container;
    private running = false;
    //===============================
    private _game: Phaser.Game;
    private _scene: Phaser.Scene;
    private _connect: ConnectionService;
    constructor(private worldService: WorldService) {
        super();
        this._game = worldService.game;
        this._connect = this.worldService.connection;
    }

    public setRoom(room: RoomService) {
        this.pause();
        this._scene = room.scene;
        if (!this._scene) return;
        this.mActivePointer = this._scene.input.activePointer;
        room.addMouseListen((ground) => {
            this.mGroundLayer = ground;
            this.mGroundLayer.on("pointerdown", this.groundDown, this);
            this.mGroundLayer.on("pointerup", this.groundUp, this);
            this.resume();
        });
    }


    public resize(width: number, height: number) {

    }

    public pause(): void {
        this.running = false;
    }

    public resume(): void {
        this.running = true;
    }

    private groundDown(pointer) {
        this.mActivePointer = pointer;
        this.onUpdate(pointer);
    }

    private groundUp(pointer) {
        this.mActivePointer = pointer;
        this.onUpdate(pointer);
    }


    public onUpdate(pointer: Phaser.Input.Pointer): void {
        if (this.running === false || this.mActivePointer === undefined) {
            return;
        }
        let events: number[] = [];
        if (this.mActivePointer.leftButtonDown) {
            events.push(MouseEvent.LeftMouseDown);
        } else if (this.mActivePointer.leftButtonReleased) {
            events.push(MouseEvent.LeftMouseUp);
        }
        if (this.mActivePointer.middleButtonDown) {
            events.push(MouseEvent.WheelDown);
        } else if (this.mActivePointer.middleButtonReleased) {
            events.push(MouseEvent.WheelUp);
        }
        if (this.mActivePointer.rightButtonDown) {
            events.push(MouseEvent.RightMouseDown);
        } else if (this.mActivePointer.rightButtonReleased) {
            events.push(MouseEvent.RightMouseUp);
        }
        if (events.length === 0) {
            return;
        }


        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT);
        let content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT = pkt.content;
        content.mouseEvent = events;
        content.point3f = { x: pointer.x, y: pointer.y };
        this._connect.send(pkt);
    }

    /**
     * 设置鼠标事件开关
     */
    public set enable(value: boolean) {
        if (this._scene) {
            this._scene.input.mouse.enabled = value;
        }
    }

    public get enable(): boolean {
        if (this._scene) {
            return this._scene.input.mouse.enabled;
        }
        return false;
    }

    public dispose() {
        this.mActivePointer = null;
        this._scene = null;
        this._connect = null;
        this.mGroundLayer = null;
        this.running = false;
    }

}