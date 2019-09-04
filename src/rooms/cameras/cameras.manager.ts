import {PacketHandler, PBpacket} from "net-socket-packet";
import {IRoomService} from "../room";
import {ConnectionService} from "../../net/connection.service";
import {op_virtual_world} from "pixelpai_proto";
import {Console} from "../../utils/log";

export interface ICameraService {
    camera: Phaser.Cameras.Scene2D.Camera | undefined;

    startFollow(target: Phaser.GameObjects.GameObject): void;

    resize(width: number, height: number): void;

    getViewPort(): Phaser.Geom.Rectangle | undefined;
}

export class CamerasManager extends PacketHandler implements ICameraService {

    private mCamera: Phaser.Cameras.Scene2D.Camera;

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
        return out;
    }

    public set camera(camera: Phaser.Cameras.Scene2D.Camera | undefined) {
        this.mCamera = camera;
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

    private resetCameraSize(width: number, height: number) {
        if (!this.connection) {
            Console.error("connection is undefined");
            return;
        }
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_RESET_CAMERA_SIZE);
        const size: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_RESET_CAMERA_SIZE = packet.content;
        // TOOD move to cameras manager and not getting from document
        size.width = width;
        size.height = height;
        this.connection.send(packet);
    }

    get connection(): ConnectionService {
        if (!this.mRoomService) {
            Console.error("room service is undefined");
            return;
        }
        return this.mRoomService.connection;
    }
}
