import {PacketHandler, PBpacket} from "net-socket-packet";
import {IRoomService} from "../room";
import {ConnectionService} from "../../net/connection.service";
import {op_editor, op_virtual_world, op_client, op_def} from "pixelpai_proto";
import {Logger} from "../../utils/log";
import {Rectangle45} from "../../utils/rectangle45";
import {Pos} from "../../utils/pos";

export interface ICameraService {
    camera: Phaser.Cameras.Scene2D.Camera | undefined;
    moving: boolean;

    startFollow(target: Phaser.GameObjects.GameObject): void;
    stopFollow(): void;

    resize(width: number, height: number): void;

    getViewPort(): Phaser.Geom.Rectangle | undefined;

    getMiniViewPort(): Rectangle45 | undefined;

    setBounds(x: integer, y: integer, width: integer, height: integer, centerOn?: boolean): void;

    setPosition(x: number, y: number): void;

    setScroll(x: number, y: number): void;
    offsetScroll(x: number, y: number): void;
    syncToEditor(): void;
    centerCameas(): void;
    syncCamera(): void;
    syncCameraScroll(): void;
}

export class CamerasManager extends PacketHandler implements ICameraService {

    readonly MINI_VIEW_SIZE = 28;
    readonly VIEW_PORT_SIZE = 30;
    protected mCamera: Phaser.Cameras.Scene2D.Camera;
    protected viewPort = new Phaser.Geom.Rectangle();
    protected miniViewPort = new Phaser.Geom.Rectangle();
    protected mMoving: boolean;

    constructor(protected mRoomService: IRoomService) {
        super();
    }

    public getViewPort(): Phaser.Geom.Rectangle | undefined {
        if (!this.mCamera) return;
        const worldView = this.mCamera.worldView;
        // const out = new Phaser.Geom.Rectangle(worldView.x, worldView.y, worldView.width, worldView.height);
        // out.x -= out.width >> 1;
        // out.y -= out.height >> 1;
        // out.width *= 2;
        // out.height *= 2;
        // out.x -= 200;
        // out.y -= 200;
        // out.width += 400;
        // out.height += 400;
        // this.viewPort.setPosition(worldView.x - worldView.width / 2, worldView.y - worldView.height / 2);
        this.viewPort.x = worldView.x + (worldView.width - this.viewPort.width >> 1);
        this.viewPort.y = worldView.y + (worldView.height - this.viewPort.height >> 1);
        return this.viewPort;
    }

    public getMiniViewPort(): Rectangle45 {
        if (!this.mCamera) return;
        const worldView = this.mCamera.worldView;
        this.miniViewPort.x = worldView.x + (worldView.width - this.miniViewPort.width >> 1);
        this.miniViewPort.y = worldView.y + (worldView.height - this.miniViewPort.height >> 1);
        const pos = this.mRoomService.transformTo45(new Pos(this.miniViewPort.x + (this.miniViewPort.width >> 1), this.miniViewPort.y));
        return new Rectangle45(pos.x, pos.y, this.MINI_VIEW_SIZE, this.MINI_VIEW_SIZE);
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

    public setScroll(x: number, y: number) {
        if (!this.mCamera) {
            return;
        }
        this.mCamera.setScroll(x, y);
    }

    public offsetScroll(x: number, y: number) {
        if (!this.mCamera) {
            return;
        }
        this.mCamera.scrollX += x / this.camera.zoom;
        this.mCamera.scrollY += y / this.camera.zoom;
        this.moving = true;
        // this.mCamera.setScroll(x, y);
    }

    public startFollow(target: Phaser.GameObjects.GameObject) {
        if (this.mCamera && target) {
            this.mCamera.startFollow(target);
        }
    }

    public stopFollow() {
        if (this.mCamera) {
            this.mCamera.stopFollow();
        }
    }

    public setBounds(x: integer, y: integer, width: integer, height: integer, centerOn?: boolean): void {
        if (!this.mCamera) {
            Logger.getInstance().error("camera does not exist");
            return;
        }
        this.mCamera.setBounds(x, y, width, height, centerOn);
    }

    public setPosition(x: number, y: number) {
        if (!this.mCamera) {
            return;
        }
        this.mCamera.setPosition(x, y);
    }

    public syncToEditor() {
        if (!this.mCamera) {
            return;
        }
        const cameraView = this.mCamera.worldView;
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_RESET_CAMERA);
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_RESET_CAMERA = pkt.content;
        content.x = cameraView.x;
        content.y = cameraView.y;
        content.width = cameraView.width;
        content.height = cameraView.height;
        this.connection.send(pkt);
    }

    public centerCameas() {
    }

    public syncCamera() {
        if (!this.mCamera) {
            return;
        }

        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_RESET_CAMERA_SIZE);
        const size: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_RESET_CAMERA_SIZE = packet.content;
        size.width = this.mCamera.width / this.mCamera.zoom;
        size.height = this.mCamera.height / this.mCamera.zoom;
        this.connection.send(packet);
    }

    public syncCameraScroll() {
        if (!this.mCamera) {
            return;
        }
        const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SET_CAMERA_POSITION);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_SET_CAMERA_POSITION = pkt.content;
        const pos = op_def.PBPoint3f.create();
        pos.x = this.mCamera.scrollX + (this.mCamera.width * 0.5 - this.mCamera.width / this.mCamera.zoom * 0.5);
        pos.y = this.mCamera.scrollY + (this.mCamera.height * 0.5 - this.mCamera.height / this.mCamera.zoom * 0.5);
        content.pos = pos;
        this.connection.send(pkt);
    }

    private resetCameraSize(width: number, height: number) {
        if (!this.connection) {
            Logger.getInstance().error("connection is undefined");
            return;
        }
        this.syncCamera();
    }

    private setViewPortSize() {
        if (!this.mCamera) {
            Logger.getInstance().error("camera does not exist");
            return;
        }
        const size = this.mRoomService.roomSize;
        if (!size) {
            Logger.getInstance().error("room size does not exist");
            return;
        }
        const viewW = (this.VIEW_PORT_SIZE + this.VIEW_PORT_SIZE) * (size.tileWidth / 2);
        const viewH = (this.VIEW_PORT_SIZE + this.VIEW_PORT_SIZE) * (size.tileHeight / 2);
        this.viewPort.setSize(viewW, viewH);

        const miniViewW = (this.MINI_VIEW_SIZE + this.MINI_VIEW_SIZE) * (size.tileWidth / 2);
        const miniviewH = (this.MINI_VIEW_SIZE + this.MINI_VIEW_SIZE) * (size.tileHeight / 2);
        this.miniViewPort.setSize(miniViewW, miniviewH);
    }

    get connection(): ConnectionService {
        if (!this.mRoomService) {
            Logger.getInstance().error("room service is undefined");
            return;
        }
        return this.mRoomService.connection;
    }

    set moving(val: boolean) {
        this.mMoving = val;
    }

    get moving(): boolean {
        return this.mMoving;
    }
}
