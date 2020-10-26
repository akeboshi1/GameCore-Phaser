import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_editor, op_virtual_world, op_def } from "pixelpai_proto";
import { ConnectionService } from "../../../../lib/net/connection.service";
import { Logger, LogicPos, LogicRectangle, LogicRectangle45 } from "utils";
import { Game } from "../../game";
import { IRoomService } from "../room/room";

export interface ICameraService {
    getViewPort(): Promise<LogicRectangle | undefined>;
    getMiniViewPort(): Promise<LogicRectangle45 | undefined>;
    syncToEditor(): void;
    centerCameas(): void;
    syncCamera(): void;
    syncCameraScroll(): void;
    resetCameraSize(width: number, height: number);
    destroy(): void;
}

export class CamerasManager extends PacketHandler implements ICameraService {
    readonly MINI_VIEW_SIZE = 50;
    readonly VIEW_PORT_SIZE = 50;
    protected viewPort = new LogicRectangle();
    protected miniViewPort = new LogicRectangle();
    private zoom: number = 1;
    constructor(protected mGame: Game, private mRoomService: IRoomService) {
        super();
        this.zoom = this.mGame.scaleRatio;
    }

    public getViewPort(): Promise<LogicRectangle | undefined> {
        return new Promise<LogicRectangle | undefined>((resolve) => {
            this.mGame.peer.render.getWorldView().then((obj) => {
                const worldView = obj;
                this.viewPort.x = worldView.x / this.zoom + (worldView.width / this.zoom - this.viewPort.width >> 1);
                this.viewPort.y = worldView.y / this.zoom + (worldView.height / this.zoom - this.viewPort.height >> 1);
                resolve(this.viewPort);
            });
        });
    }

    public getMiniViewPort(): Promise<LogicRectangle45 | undefined> {
        return new Promise<LogicRectangle45 | undefined>((resolve) => {
            this.mGame.peer.render.getWorldView().then((obj) => {
                const worldView = obj;
                this.miniViewPort.x = worldView.x / this.zoom + (worldView.width / this.zoom - this.miniViewPort.width >> 1);
                this.miniViewPort.y = worldView.y / this.zoom + (worldView.height / this.zoom - this.miniViewPort.height >> 1);
                const pos = this.mRoomService.transformTo45(new LogicPos(this.miniViewPort.x + (this.miniViewPort.width >> 1), this.miniViewPort.y));
                resolve(new LogicRectangle45(pos.x, pos.y, this.MINI_VIEW_SIZE, this.MINI_VIEW_SIZE));
            });
        });
    }

    public syncToEditor() {
        const cameraView = this.mGame.peer.render.getWorldView();
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

    public async syncCamera() {
        const cameraView = await this.mGame.peer.render.getWorldView();
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_RESET_CAMERA_SIZE);
        const size: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_RESET_CAMERA_SIZE = packet.content;
        // TODO zoom统一使用一个
        size.width = cameraView.width / cameraView.zoom;
        size.height = cameraView.height / cameraView.zoom;
        this.connection.send(packet);
    }

    public async syncCameraScroll() {
        const cameraView = await this.mGame.peer.render.getWorldView();
        const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SET_CAMERA_POSITION);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_SET_CAMERA_POSITION = pkt.content;
        const pos = op_def.PBPoint3f.create();
        pos.x = cameraView.scrollX / Math.ceil(this.zoom);
        pos.y = cameraView.scrollY / Math.ceil(this.zoom);
        content.pos = pos;
        this.connection.send(pkt);
    }

    public resetCameraSize(width: number, height: number) {
        if (!this.connection) {
            Logger.getInstance().error("connection is undefined");
            return;
        }
        this.syncCamera();
    }

    public destroy() {
    }

    get connection(): ConnectionService {
        if (!this.mRoomService) {
            Logger.getInstance().error("room service is undefined");
            return;
        }
        return this.mGame.connection;
    }
}
