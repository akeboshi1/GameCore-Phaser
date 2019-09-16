import { ConnectionService } from "../net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_virtual_world } from "pixelpai_proto";
import { WorldService } from "./world.service";
import { IRoomService } from "../rooms/room";
import { Logger } from "../utils/log";

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
    // ===============================
    private mGame: Phaser.Game;
    private mScene: Phaser.Scene;
    private mConnect: ConnectionService;
    constructor(private worldService: WorldService) {
        super();
        this.mGame = worldService.game;
        this.mConnect = this.worldService.connection;
    }

    public changeRoom(room: IRoomService) {
        this.pause();
        this.mScene = room.scene;
        if (!this.mScene) return;
        this.mActivePointer = this.mScene.input.activePointer;
        new Promise((resolve, reject) => {
            try {
                room.addMouseListen();
                resolve();
            } catch (e) {
                reject(e);
            }
        }).then(() => {
            room.scene.input.on("gameobjectdown", this.groundDown, this);
            room.scene.input.on("gameobjectup", this.groundUp, this);
            this.resume();
        }).catch((reason: any) => {
            Logger.error(reason);
        }).finally(() => {
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

    public onUpdate(pointer: Phaser.Input.Pointer): void {
        if (this.running === false || this.mActivePointer === undefined) {
            return;
        }
        const events: number[] = [];
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

        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT = pkt.content;
        content.mouseEvent = events;
        content.point3f = { x: pointer.x, y: pointer.y };
        this.mConnect.send(pkt);
    }

    /**
     * 设置鼠标事件开关
     */
    public set enable(value: boolean) {
        if (this.mScene) {
            this.mScene.input.mouse.enabled = value;
        }
    }

    public get enable(): boolean {
        if (this.mScene) {
            return this.mScene.input.mouse.enabled;
        }
        return false;
    }

    public destroy() {
        this.mActivePointer = null;
        this.mScene = null;
        this.mConnect = null;
        this.mGroundLayer = null;
        this.running = false;
    }

    private groundDown(pointer, gameObject) {
        this.mActivePointer = pointer;
        this.onUpdate(pointer);
    }

    private groundUp(pointer, gameObject) {
        this.mActivePointer = pointer;
        this.onUpdate(pointer);
    }
}
