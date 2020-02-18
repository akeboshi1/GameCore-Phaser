import { ConnectionService } from "../net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_virtual_world, op_def } from "pixelpai_proto";
import { WorldService } from "./world.service";
import { IRoomService, Room } from "../rooms/room";
import { Logger } from "../utils/log";
import { MessageType } from "../const/MessageType";
import { TerrainDisplay } from "../rooms/display/terrain.display";
import { DisplayObject } from "../rooms/display/display.object";
import { Data } from "phaser";

export enum MouseEvent {
    RightMouseDown = 1,
    RightMouseUp = 2,
    LeftMouseDown = 3,
    LeftMouseUp = 4,
    WheelDown = 5,
    WheelUp = 6,
    RightMouseHolding = 7,
    LeftMouseHolding = 8,
    Tap = 9
}

export class MouseManager extends PacketHandler {
    private mActivePointer: Phaser.Input.Pointer;
    private mGroundLayer: Phaser.GameObjects.Container;
    private running = false;
    // ===============================
    private mGame: Phaser.Game;
    private mScene: Phaser.Scene;
    private mConnect: ConnectionService;
    private mDownDelay: number = 2000;
    private mDownTime: any;
    private mRoom: Room;
    constructor(private worldService: WorldService) {
        super();
        this.mGame = worldService.game;
        this.mConnect = this.worldService.connection;
    }

    public changeRoom(room: IRoomService) {
        this.pause();
        this.mScene = room.scene;
        this.mRoom = <Room> room;
        if (!this.mScene) return;
        this.mActivePointer = this.mScene.input.activePointer;
        try {
            room.addMouseListen();
        } catch (e) {
        }
        room.scene.input.on("gameobjectdown", this.groundDown, this);
        room.scene.input.on("gameobjectup", this.groundUp, this);
        room.scene.input.on("pointerdown", this.pointerDownHandler, this);
        room.scene.input.on("pointerup", this.onPointerUpHandler, this);
        this.resume();
    }

    public resize(width: number, height: number) {

    }

    public pause(): void {
        this.running = false;
    }

    public resume(): void {
        this.running = true;
    }

    public onUpdate(pointer: Phaser.Input.Pointer, gameobject: Phaser.GameObjects.GameObject): void {
        if (this.running === false || this.mActivePointer === undefined) {
            return;
        }
        const events: number[] = [];
        if (this.mActivePointer.leftButtonDown()) {
            events.push(MouseEvent.LeftMouseDown);
        } else if (this.mActivePointer.leftButtonReleased()) {
            events.push(MouseEvent.LeftMouseUp);
        }
        if (this.mActivePointer.middleButtonDown()) {
            events.push(MouseEvent.WheelDown);
        } else if (this.mActivePointer.middleButtonReleased()) {
            events.push(MouseEvent.WheelUp);
        }
        if (this.mActivePointer.rightButtonDown()) {
            events.push(MouseEvent.RightMouseDown);
        } else if (this.mActivePointer.rightButtonReleased()) {
            events.push(MouseEvent.RightMouseUp);
        }
        if (pointer.isDown === false) {
            if (pointer.downX === pointer.upX && pointer.downY === pointer.upY) {
                events.push(MouseEvent.Tap);
                const player = this.mRoom.playerManager.actor;
                if (player) {
                    Logger.getInstance().log("astar actor position: ", player.getPosition());
                    const time = new Date().getTime();
                    player.moveTime = time;
                    Logger.getInstance().log("astar send time: ", time);
                }
            }
        }
        if (events.length === 0) {
            return;
        }
        let id = 0;
        if (gameobject.parentContainer) {
            id = gameobject.parentContainer.getData("id");
        }
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT = pkt.content;
        content.id = id;
        content.mouseEvent = events;
        content.point3f = { x: pointer.worldX, y: pointer.worldY };
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
        this.onUpdate(pointer, gameObject);

        this.mDownTime = setTimeout(() => {
            this.worldService.emitter.emit(MessageType.PRESS_ELEMENT, pointer, gameObject);
        }, this.mDownDelay);
    }

    private groundUp(pointer, gameObject) {
        this.mActivePointer = pointer;
        this.onUpdate(pointer, gameObject);
    }

    private pointerDownHandler() {
        if (this.worldService) {
            if (this.worldService.emitter) {
                this.worldService.emitter.emit(MessageType.SCENE_BACKGROUND_CLICK);
            }
        }
    }

    private onPointerUpHandler() {
        clearTimeout(this.mDownTime);
    }

    private selectedElement(pointer, gameobject) {
        const com = gameobject.parentContainer;
        if (!com) {
            return;
        }
        if (!(com instanceof DisplayObject)) {
            return;
        }
        if (com instanceof TerrainDisplay) {
            return;
        }
        // TODO Enter decorate mode
    }
}
