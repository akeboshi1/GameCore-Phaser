import { RoomManager } from "../rooms/room.manager";
import { ConnectionService } from "../net/connection.service";
import { PacketHandler } from "net-socket-packet";

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
    private _scene: Phaser.Scene;
    private _connect: ConnectionService;

    constructor(private roomManager: RoomManager) {
        super();
        this._scene = this.roomManager.scene;
        this._connect = this.roomManager.connection;

    }

    /**
     * 给某个元素添加鼠标事件
     * @param element 
     * @param callBack 
     */
    public addElementMouseHandler(element: Phaser.GameObjects.GameObject, callBack: Function, once: boolean, target: any) {
        element.setInteractive({ pixelperfect: true });
        if (once) {
            element.once("", () => {
                callBack.apply(target);
            }, target);
        } else {
            element.on("", () => {

                callBack.apply(target);
            }, target);
        }

    }

    public removeElementMouseHandler(element: Phaser.GameObjects.GameObject, target: any) {
        element.off("", () => {

        }, target);
    }

    /**
     * 设置鼠标事件开关
     */
    public set enable(value: boolean) {
        if (this._scene && this._scene.input && this._scene.input.mouse) {
            this._scene.input.mouse.enabled = value;
        }
    }

    public get enable(): boolean {
        if (this._scene && this._scene.input && this._scene.input.mouse) {
            return this._scene.input.mouse.enabled;
        }
        return false;
    }

    public dispose() {

    }











}