import { ConnectionService } from "../net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { Geom } from "phaser";
import { op_virtual_world } from "pixelpai_proto";
import { WorldService } from "./world.service";
import { Room } from "../rooms/room";
import { LayerType } from "../rooms/layer/layer.manager";

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
    private _activePointer: Phaser.Input.Pointer;
    private _groundLayer: Phaser.GameObjects.Container;
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

    public setRoom(room: Room) {
        this._scene = room.scene;
        if (!this._scene) return;
        this._activePointer = this._scene.input.activePointer;

        this._groundLayer = room.layerManager.getLayerByType(LayerType.GroundClickLayer);
        this._groundLayer.setInteractive(new Geom.Rectangle(0, 0, window.innerWidth, window.innerHeight), Phaser.Geom.Rectangle.Contains);
        this._groundLayer.on("gameobjectdown", this.groundDown, this);
        this._groundLayer.on("gameobjectup", this.groundUp, this)
    }


    public resize(width: number, height: number) {
        this._groundLayer.setInteractive(new Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    }

    public pause(): void {
        this.running = false;
    }

    public resume(): void {
        this.running = true;
    }

    private groundDown(pointer, gameOject) {
        this._activePointer = pointer;
        this.onUpdate(pointer);
    }

    private groundUp(pointer, gameOject) {
        this._activePointer = pointer;
        this.onUpdate(pointer);
    }


    public onUpdate(pointer: Phaser.Input.Pointer): void {
        if (this.running === false || this._activePointer === undefined) {
            return;
        }
        let events: number[] = [];
        if (this._activePointer.leftButtonDown) {
            events.push(MouseEvent.LeftMouseDown);
        } else if (this._activePointer.leftButtonReleased) {
            events.push(MouseEvent.LeftMouseUp);
        }
        if (this._activePointer.middleButtonDown) {
            events.push(MouseEvent.WheelDown);
        } else if (this._activePointer.middleButtonReleased) {
            events.push(MouseEvent.WheelUp);
        }
        if (this._activePointer.rightButtonDown) {
            events.push(MouseEvent.RightMouseDown);
        } else if (this._activePointer.rightButtonReleased) {
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
        this._activePointer = null;
        this._scene = null;
        this._connect = null;
        this._groundLayer = null;
        this.running = false;
    }

}