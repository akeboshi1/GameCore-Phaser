import {PacketHandler, PBpacket} from "net-socket-packet";
import {IRoomService} from "../room";
import {ConnectionService} from "../../net/connection.service";
import {op_virtual_world} from "pixelpai_proto";
import {Logger} from "../../utils/log";
import {IPosition45Obj} from "../../utils/position45";
import {Rectangle45} from "../../utils/rectangle45";
import {Pos} from "../../utils/pos";

export interface ICameraService {
    camera: Phaser.Cameras.Scene2D.Camera | undefined;

    startFollow(target: Phaser.GameObjects.GameObject): void;

    resize(width: number, height: number): void;

    getViewPort(): Phaser.Geom.Rectangle | undefined;

    getMiniViewPort(): Rectangle45 | undefined;

    setBounds(x: integer, y: integer, width: integer, height: integer, centerOn?: boolean): void;
}

export class CamerasManager extends PacketHandler implements ICameraService {

    private mCamera: Phaser.Cameras.Scene2D.Camera;
    private viewPort = new Phaser.Geom.Rectangle();
    private miniViewPort = new Phaser.Geom.Rectangle();

    constructor(private mRoomService: IRoomService) {
        super();
    }

    public getViewPort(): Phaser.Geom.Rectangle | undefined {
        if (!this.mCamera) return;
        const worldView = this.mCamera.worldView;
        const out = new Phaser.Geom.Rectangle(worldView.x, worldView.y, worldView.width, worldView.height);
        out.x -= out.width >> 1;
        out.y -= out.height >> 1;
        out.width *= 2;
        out.height *= 2;
        // this.viewPort.setPosition(worldView.x - worldView.width / 2, worldView.y - worldView.height / 2);
        return out;
    }

    public getMiniViewPort(): Rectangle45 {
        if (!this.mCamera) return;
        const worldView = this.mCamera.worldView;
        this.miniViewPort.x = worldView.x + (worldView.width - this.miniViewPort.width >> 1);
        this.miniViewPort.y = worldView.y + (worldView.height - this.miniViewPort.height >> 1);
        const pos = this.mRoomService.transformTo45(new Pos(this.miniViewPort.x + (this.miniViewPort.width >> 1) + 30, this.miniViewPort.y));
        return new Rectangle45(pos.x, pos.y, pos.x + 21, pos.y + 21);
    }

    public set camera(camera: Phaser.Cameras.Scene2D.Camera | undefined) {
        this.mCamera = camera;
        this.setViewPortSize();
    }

    public get camera(): Phaser.Cameras.Scene2D.Camera | undefined {
        return this.mCamera;
    }

    public resize(width: number, height: number) {
        this.resetCameraSize(width, height);
    }

    public startFollow(target: Phaser.GameObjects.GameObject) {
        if (this.mCamera) {
            this.mCamera.startFollow(target);
        }
    }

    public setBounds(x: integer, y: integer, width: integer, height: integer, centerOn?: boolean): void {
        if (!this.mCamera) {
            Logger.error("camera does not exist");
            return;
        }
        this.mCamera.setBounds(x, y, width, height, centerOn);
    }

    private resetCameraSize(width: number, height: number) {
        if (!this.connection) {
            Logger.error("connection is undefined");
            return;
        }
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_RESET_CAMERA_SIZE);
        const size: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_RESET_CAMERA_SIZE = packet.content;
        size.width = width;
        size.height = height;
        this.connection.send(packet);
    }

    private setViewPortSize() {
        if (!this.mCamera) {
            Logger.error("camera does not exist");
            return;
        }
        const size = this.mRoomService.roomSize;
        if (!size) {
            Logger.error("room size does not exist");
            return;
        }
        const colSize = 17;
        const viewW = (colSize + colSize) * (size.tileWidth / 2);
        const viewH = (colSize + colSize) * (size.tileHeight / 2);
        this.miniViewPort.setSize(viewW, viewH);
    }

    get connection(): ConnectionService {
        if (!this.mRoomService) {
            Logger.error("room service is undefined");
            return;
        }
        return this.mRoomService.connection;
    }
}
