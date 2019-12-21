import {PacketHandler, PBpacket} from "net-socket-packet";
import {IRoomService} from "../room";
import {ConnectionService} from "../../net/connection.service";
import {op_editor, op_virtual_world} from "pixelpai_proto";
import {Logger} from "../../utils/log";
import {Rectangle45} from "../../utils/rectangle45";
import {Pos} from "../../utils/pos";

export interface ICameraService {
    camera: Phaser.Cameras.Scene2D.Camera | undefined;

    startFollow(target: Phaser.GameObjects.GameObject): void;

    resize(width: number, height: number): void;

    getViewPort(): Phaser.Geom.Rectangle | undefined;

    getMiniViewPort(): Rectangle45 | undefined;

    setBounds(x: integer, y: integer, width: integer, height: integer, centerOn?: boolean): void;

    offsetScroll(x: number, y: number): void;
    syncToEditor(): void;
    centerCameas(): void;
}

export class CamerasManager extends PacketHandler implements ICameraService {

    readonly MINI_VIEW_SIZE = 28;
    readonly VIEW_PORT_SIZE = 30;
    private mCamera: Phaser.Cameras.Scene2D.Camera;
    private viewPort = new Phaser.Geom.Rectangle();
    private miniViewPort = new Phaser.Geom.Rectangle();

    constructor(private mRoomService: IRoomService) {
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

    public offsetScroll(x: number, y: number) {
        if (!this.mCamera) {
            return;
        }
        this.mCamera.scrollX += x;
        this.mCamera.scrollY += y;
        // this.mCamera.setScroll(x, y);

        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_RESET_CAMERA);
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_RESET_CAMERA = pkt.content;
        content.x = this.mCamera.scrollX;
        content.y = this.mCamera.scrollY;
        content.width = 0;
        content.height = 0;
        this.connection.send(pkt);
    }

    public startFollow(target: Phaser.GameObjects.GameObject) {
        if (this.mCamera) {
            this.mCamera.startFollow(target);
        }
    }

    public setBounds(x: integer, y: integer, width: integer, height: integer, centerOn?: boolean): void {
        if (!this.mCamera) {
            Logger.getInstance().error("camera does not exist");
            return;
        }
        this.mCamera.setBounds(x, y, width, height, centerOn);
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
        if (!this.mCamera || !this.mRoomService) {
            return;
        }
        const roomSize = this.mRoomService.roomSize;
        this.mCamera.setScroll((roomSize.sceneWidth - this.mCamera.width >> 1), (roomSize.sceneHeight - this.mCamera.height >> 1));
        const cameraView = this.mCamera.worldView;
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_RESET_CAMERA);
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_RESET_CAMERA = pkt.content;
        content.x = this.mCamera.scrollX;
        content.y = this.mCamera.scrollY;
        content.width = this.mCamera.width;
        content.height = this.mCamera.height;
        this.connection.send(pkt);
    }

    private resetCameraSize(width: number, height: number) {
        if (!this.connection) {
            Logger.getInstance().error("connection is undefined");
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
}
