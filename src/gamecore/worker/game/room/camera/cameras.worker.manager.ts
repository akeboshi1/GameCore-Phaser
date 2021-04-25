import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_editor, op_virtual_world } from "pixelpai_proto";
import { ConnectionService } from "structure";
import { Tool } from "utils";
import { Logger, LogicPos, LogicRectangle, LogicRectangle45 } from "structure";
import { Game } from "../../game";
import { IRoomService } from "../room";

export interface ICameraService {
    syncDirty: boolean;
    initialize: boolean;
    getViewPort(): Promise<LogicRectangle | undefined>;
    getMiniViewPort(): Promise<LogicRectangle45 | undefined>;
    syncToEditor(): void;
    centerCameas(): void;
    syncCamera(): void;
    syncCameraScroll(): void;
    resetCameraSize(width: number, height: number);
    startFollow(target: any, effect?: string);
    stopFollow();
    setCamerasScroll(x: number, y: number, effect?: string);
    update(time?: number, delta?: number): void;
    destroy(): void;
}

export class CamerasWorkerManager extends PacketHandler implements ICameraService {
    public syncDirty: boolean = false;
    readonly m_blockWidth = 300; // 暂定
    readonly m_blockHeight = 150; // 暂定
    readonly MINI_VIEW_SIZE = 50;
    readonly VIEW_PORT_SIZE = 50;
    protected viewPort = new LogicRectangle();
    protected miniViewPort = new LogicRectangle();
    private zoom: number = 1;
    private syncTime: number = 0;
    private target: any;
    private preCamerasList: any[];
    private mInitialize: boolean = false;
    constructor(protected mGame: Game, private mRoomService: IRoomService) {
        super();
        this.zoom = this.mGame.scaleRatio;
    }

    public set initialize(val: boolean) {
        this.mInitialize = val;
        this.syncDirty = true;
    }

    public get initialize(): boolean {
        return this.mInitialize;
    }

    public getViewPort(): Promise<LogicRectangle | undefined> {
        return new Promise<LogicRectangle | undefined>((resolve, reject) => {
            this.mGame.peer.render.getWorldView().then((obj) => {
                const worldView = obj;
                if (!worldView) return;
                const width = worldView.width / this.zoom;
                const height = worldView.height / this.zoom;
                this.viewPort.x = worldView.x / this.zoom - width * 0.5;
                this.viewPort.y = worldView.y / this.zoom - height * 0.5;
                this.viewPort.width = worldView.width / this.zoom + width;
                this.viewPort.height = worldView.height / this.zoom + height;
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
        size.width = cameraView.width / this.zoom;
        size.height = cameraView.height / this.zoom;
        this.connection.send(packet);
    }

    public async syncCameraScroll() {
        if (!this.mInitialize) return;
        // todo 前端先判断进入不同区块，然后告知服务端进入不同区块
        const cameraView = await this.mGame.peer.render.getWorldView();
        if (!cameraView) {
            Logger.getInstance().error("no cameraView");
            return;
        }
        // ==== 判断4个顶点在那几个block中
        const width = cameraView.width / this.zoom;
        const height = cameraView.height / this.zoom;
        const baseX = cameraView.x / this.zoom;
        const baseY = cameraView.y / this.zoom;
        const aPoint = { x: baseX, y: baseY };
        const bPoint = { x: baseX + width, y: baseY + height };
        const cPoint = { x: baseX, y: baseY + height };
        const dPoint = { x: baseX + width, y: baseY };
        const list = [aPoint, bPoint, cPoint, dPoint];
        const size = this.mGame.roomManager.currentRoom.roomSize;
        const cols = size.cols;
        const rows = size.rows;
        const tileWidth = size.tileWidth;
        const tileHeight = size.tileHeight;
        const blockWidth = this.m_blockWidth;
        const blockHeight = this.m_blockHeight;
        const max_h = Math.ceil((cols + rows) * (tileHeight / 2) / blockHeight);

        const pointerList = [];
        let minX = 0;
        let minY = 0;
        let maxX = 0;
        let maxY = 0;
        list.forEach((pos) => {
            if (pos.x < minX) {
                minX = pos.x;
            }
            if (pos.x > maxX) {
                maxX = pos.x;
            }
            if (pos.y < minY) {
                minY = pos.y;
            }
            if (pos.y > maxY) {
                maxY = pos.y;
            }
        });
        const widLen = Math.ceil((maxX - minX) / blockWidth);
        const heiLen = Math.ceil((maxY - minY) / blockHeight);
        for (let i = 0; i < widLen + 1; i++) {
            for (let j = 0; j < heiLen + 1; j++) {
                pointerList.push({ x: minX + i * blockWidth, y: minY + j * blockHeight });
            }
        }
        // 检查4个定点
        const len = pointerList.length;
        const blockIndex = [];
        for (let i: number = 0; i < len; i++) {
            const pos = pointerList[i];
            const h = Math.floor(pos.y / blockHeight);
            const w = Math.floor((pos.x + rows * tileWidth / 2) / blockWidth);
            const index = h + w * max_h;
            blockIndex.push(index);
        }
        if (!this.preCamerasList) {
            this.preCamerasList = [];
        }
        // 数组去重
        Array.from(new Set(blockIndex));
        // Logger.getInstance().log("cameraview ----->", cameraView);
        // Logger.getInstance().log("List ----->", list);
        // Logger.getInstance().log("pointer ----->", pointerList);
        // Logger.getInstance().log("blockIndex ----->", blockIndex);
        if (!Tool.equalArr(this.preCamerasList, blockIndex)) {
            const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_UPDATE_HOT_BLOCK);
            const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_UPDATE_HOT_BLOCK = pkt.content;
            content.blockIndex = blockIndex;
            this.connection.send(pkt);
            this.preCamerasList = blockIndex;
        }

    }

    public resetCameraSize(width: number, height: number) {
        if (!this.connection) {
            Logger.getInstance().error("connection is undefined");
            return;
        }
        this.syncCamera();
    }

    public update(time?: number, delta?: number) {
        if (!this.syncDirty || !this.mInitialize) {
            return;
        }
        // 除了客户端移动镜头，后端也会改变镜头位置
        this.syncTime += delta;
        if (this.syncTime > 1000) {
            this.syncTime = 0;
            this.syncCameraScroll();
            this.syncDirty = false;
        }
    }

    public destroy() {
        this.mInitialize = false;
        this.preCamerasList.length = 0;
        this.preCamerasList = null;
    }

    public startFollow(target: any, effect?: string) {
        this.target = target;
        this.mGame.renderPeer.cameraFollow(target, effect);
    }

    public stopFollow() {
        this.target = undefined;
        this.mGame.renderPeer.stopFollow();
    }

    public setCamerasScroll(x: number, y: number, effect?: string) {
        this.mGame.renderPeer.setCamerasScroll(x, y, effect);
    }

    get connection(): ConnectionService {
        if (!this.mRoomService) {
            Logger.getInstance().error("room service is undefined");
            return;
        }
        return this.mGame.connection;
    }
}
