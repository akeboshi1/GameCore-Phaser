import { ConnectionService } from "../net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_virtual_world, op_def } from "pixelpai_proto";
import { WorldService } from "./world.service";
import { IRoomService, Room } from "../rooms/room";
import { MessageType } from "../const/MessageType";
import { FramesDisplay } from "../rooms/display/frames.display";
import { Element } from "../rooms/element";

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
    private mGroundLayer: Phaser.GameObjects.Container;
    private running = false;
    // ===============================
    private mGame: Phaser.Game;
    private mScene: Phaser.Scene;
    private mConnect: ConnectionService;
    private mGameObject: Phaser.GameObjects.GameObject;
    private mDownDelay: number = 2000;
    private mDownTime: any;
    private readonly zoom: number;
    private mRoom: Room;
    constructor(private worldService: WorldService) {
        super();
        this.mGame = worldService.game;
        this.zoom = this.worldService.scaleRatio || 1;
        this.mConnect = this.worldService.connection;
    }

    public changeRoom(room: IRoomService) {
        this.pause();
        this.mScene = room.scene;
        this.mRoom = <Room>room;
        if (!this.mScene) return;
        try {
            room.addMouseListen();
        } catch (e) {
        }
        room.scene.input.on("gameobjectdown", this.groundDown, this);
        // room.scene.input.on("gameobjectup", this.groundUp, this);
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
        if (this.running === false || pointer === undefined) {
            return;
        }
        const events: number[] = [];
        if (pointer.leftButtonDown()) {
            events.push(MouseEvent.LeftMouseDown);
        } else if (pointer.leftButtonReleased()) {
            events.push(MouseEvent.LeftMouseUp);
        }
        if (pointer.middleButtonDown()) {
            events.push(MouseEvent.WheelDown);
        } else if (pointer.middleButtonReleased()) {
            events.push(MouseEvent.WheelUp);
        }
        if (pointer.rightButtonDown()) {
            events.push(MouseEvent.RightMouseDown);
        } else if (pointer.rightButtonReleased()) {
            events.push(MouseEvent.RightMouseUp);
        }
        let id = 0;
        let com = null;
        if (gameobject && gameobject.parentContainer) {
            id = gameobject.parentContainer.getData("id");
            // TODO 提供个接口
            com = gameobject.parentContainer.parentContainer || gameobject.parentContainer;
        }
        if (pointer.isDown === false) {
            const diffX = Math.abs(pointer.downX - pointer.upX);
            const diffY = Math.abs(pointer.downY - pointer.upY);
            if (diffX < 10 && diffY < 10) {
                // events.push(MouseEvent.Tap);
                this.worldService.emitter.emit("Tap", pointer, gameobject);
                if (pointer.isDown === false) {
                    if (com instanceof FramesDisplay) {
                        // com.element.scaleTween();
                        const ele = com.element;
                        if (ele instanceof Element) {
                            com.scaleTween();
                        }
                    }
                }
            }
        }
        if (events.length === 0) {
            return;
        }
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT = pkt.content;
        content.id = id;
        content.mouseEvent = events;
        content.point3f = { x: pointer.worldX / this.zoom, y: pointer.worldY / this.zoom };
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
        this.mScene = null;
        this.mConnect = null;
        this.mGroundLayer = null;
        this.running = false;
    }

    private groundDown(pointer, gameObject) {
        this.mGameObject = gameObject;
        this.mDownTime = setTimeout(() => {
            this.worldService.emitter.emit(MessageType.PRESS_ELEMENT, pointer, gameObject);
        }, this.mDownDelay);

    }

    private groundUp(pointer, gameObject) {
        // this.mGameObject = null;
        this.onUpdate(pointer, gameObject);
    }

    private pointerDownHandler(pointer, gameobject) {
        if (this.worldService) {
            if (this.worldService.emitter) {
                this.worldService.emitter.emit(MessageType.SCENE_BACKGROUND_CLICK, pointer);
            }
        }
        this.onUpdate(pointer, this.mGameObject);
    }

    private onPointerUpHandler(pointer) {
        clearTimeout(this.mDownTime);
        this.onUpdate(pointer, this.mGameObject);
        this.mGameObject = null;
    }

}
