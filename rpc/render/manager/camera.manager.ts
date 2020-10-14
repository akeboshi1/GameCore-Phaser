import { Export, RPCEmitter } from "webworker-rpc";
import { Logger } from "../../utils/log";
import { Rectangle45 } from "../../utils/rectangle45";
import { ICameraService, RoomCameras } from "../cameras/room.cameras";
import { SceneManager } from "./scene.manager";

export class CameraManager extends RPCEmitter {
    private roomCameras: Map<number, RoomCameras> = new Map<number, RoomCameras>();

    constructor() {
        super();
    }

    public addRoom(roomID: number) {
        if (this.roomCameras.has(roomID)) {
            return;
        }
        this.roomCameras.set(roomID, new RoomCameras());
    }

    @Export()
    public startFollow(roomID: number, target: any): void {
        if (!this.roomCameras.has(roomID)) {
            Logger.getInstance().error("RoomCameras not found: ", roomID);
            return;
        }

        const cams = this.roomCameras.get(roomID);
        cams.startFollow(target);
    }

    @Export()
    public stopFollow(roomID: number): void {
        if (!this.roomCameras.has(roomID)) {
            Logger.getInstance().error("RoomCameras not found: ", roomID);
            return;
        }

        const cams = this.roomCameras.get(roomID);
        cams.stopFollow();
    }

    @Export()// TODO: 使用id代替camera
    public addCamera(roomID: number, camera: Phaser.Cameras.Scene2D.Camera): void {
        if (!this.roomCameras.has(roomID)) {
            Logger.getInstance().error("RoomCameras not found: ", roomID);
            return;
        }

        const cams = this.roomCameras.get(roomID);
        cams.addCamera(camera);
    }

    @Export()// TODO: 使用id代替camera
    public removeCamera(roomID: number, camera: Phaser.Cameras.Scene2D.Camera): void {
        if (!this.roomCameras.has(roomID)) {
            Logger.getInstance().error("RoomCameras not found: ", roomID);
            return;
        }

        const cams = this.roomCameras.get(roomID);
        cams.removeCamera(camera);
    }

    @Export()
    public resize(roomID: number, width: number, height: number): void {
        if (!this.roomCameras.has(roomID)) {
            Logger.getInstance().error("RoomCameras not found: ", roomID);
            return;
        }

        const cams = this.roomCameras.get(roomID);
        cams.resize(width, height);
    }

    @Export()
    public getViewPort(roomID: number): Phaser.Geom.Rectangle | undefined {
        if (!this.roomCameras.has(roomID)) {
            Logger.getInstance().error("RoomCameras not found: ", roomID);
            return;
        }

        const cams = this.roomCameras.get(roomID);
        return cams.getViewPort();
    }

    @Export()
    public getMiniViewPort(roomID: number): Rectangle45 | undefined {
        if (!this.roomCameras.has(roomID)) {
            Logger.getInstance().error("RoomCameras not found: ", roomID);
            return;
        }

        const cams = this.roomCameras.get(roomID);
        return cams.getMiniViewPort();
    }

    @Export()
    public setBounds(roomID: number, x: integer, y: integer, width: integer, height: integer, centerOn?: boolean): void {
        if (!this.roomCameras.has(roomID)) {
            Logger.getInstance().error("RoomCameras not found: ", roomID);
            return;
        }

        const cams = this.roomCameras.get(roomID);
        cams.setBounds(x, y, width, height, centerOn);
    }

    @Export()
    public setPosition(roomID: number, x: number, y: number): void {
        if (!this.roomCameras.has(roomID)) {
            Logger.getInstance().error("RoomCameras not found: ", roomID);
            return;
        }

        const cams = this.roomCameras.get(roomID);
        cams.setPosition(x, y);
    }

    @Export()
    public setScroll(roomID: number, x: number, y: number): void {
        if (!this.roomCameras.has(roomID)) {
            Logger.getInstance().error("RoomCameras not found: ", roomID);
            return;
        }

        const cams = this.roomCameras.get(roomID);
        cams.setScroll(x, y);
    }

    @Export()
    public offsetScroll(roomID: number, x: number, y: number): void {
        if (!this.roomCameras.has(roomID)) {
            Logger.getInstance().error("RoomCameras not found: ", roomID);
            return;
        }

        const cams = this.roomCameras.get(roomID);
        cams.offsetScroll(x, y);
    }

    @Export()
    public scrollTargetPoint(roomID: number, x: number, y: number) {
        if (!this.roomCameras.has(roomID)) {
            Logger.getInstance().error("RoomCameras not found: ", roomID);
            return;
        }

        const cams = this.roomCameras.get(roomID);
        cams.scrollTargetPoint(x, y);
    }

    @Export()
    public syncToEditor(roomID: number): void {
        if (!this.roomCameras.has(roomID)) {
            Logger.getInstance().error("RoomCameras not found: ", roomID);
            return;
        }

        const cams = this.roomCameras.get(roomID);
        cams.syncToEditor();
    }

    @Export()
    public centerCameas(roomID: number): void {
        if (!this.roomCameras.has(roomID)) {
            Logger.getInstance().error("RoomCameras not found: ", roomID);
            return;
        }

        const cams = this.roomCameras.get(roomID);
        cams.centerCameas();
    }

    @Export()
    public syncCamera(roomID: number): void {
        if (!this.roomCameras.has(roomID)) {
            Logger.getInstance().error("RoomCameras not found: ", roomID);
            return;
        }

        const cams = this.roomCameras.get(roomID);
        cams.syncCamera();
    }

    @Export()
    public syncCameraScroll(roomID: number): void {
        if (!this.roomCameras.has(roomID)) {
            Logger.getInstance().error("RoomCameras not found: ", roomID);
            return;
        }

        const cams = this.roomCameras.get(roomID);
        cams.syncCameraScroll();
    }

    @Export()
    public destroy(roomID: number): void {
        if (!this.roomCameras.has(roomID)) {
            Logger.getInstance().error("RoomCameras not found: ", roomID);
            return;
        }

        const cams = this.roomCameras.get(roomID);
        cams.destroy();
    }
}
