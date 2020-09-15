import { RPCPeer, RPCFunction } from "../../lib/rpc/rpc.peer";
import { webworker_rpc, op_gateway, op_virtual_world, op_editor, op_client, op_def } from "pixelpai_proto";
import { PBpacket, Buffer, PacketHandler } from "net-socket-packet";
import { IConnectListener, SocketConnection, SocketConnectionError } from "../../lib/net/socket";
import { Logger } from "../utils/log";
import { ServerAddress } from "../../lib/net/address";
import HeartBeatWorker from "worker-loader?filename=[hash][name].js!../game/heartBeat.worker";
import { Lite } from "game-capsule";
import { IPosition45Obj, Position45 } from "../utils/position45";
import { ICameraService, CamerasManager } from "./cameras/cameras.manager";
import { WorldService } from "../game/world.service";
import { PlayScene } from "../scenes/play";
import { ViewblockManager, ViewblockService } from "./cameras/viewblock.manager";
import { Pos } from "../utils/pos";
import IActor = op_client.IActor;
import { Element, IElement } from "./element/element";
import { IBlockObject } from "./cameras/block.object";
import { Size } from "../utils/size";
import { MessageType } from "../const/MessageType";
import { ReferenceArea } from "./editor/reference.area";
import { IPoint } from "game-capsule";
import { IScenery } from "./sky.box/scenery";
import { State } from "./state/state.group";
import { Brush, BrushEnum } from "../const/brush";
import { MouseFollow } from "./editor/mouse.follow";
import { SelectedElement } from "./editor/selected.element";
import { DisplayObjectPool } from "./display-object.pool";
import { AlertView, Buttons } from "../ui/components/alert.view";
import { Algorithm } from "../utils/algorithm";
import IOP_CLIENT_REQ_VIRTUAL_WORLD_SYNC_TIME = op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_SYNC_TIME;
import IOP_VIRTUAL_WORLD_RES_CLIENT_SYNC_TIME = op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SYNC_TIME;

import * as protos from "pixelpai_proto";
import { i18n } from "../i18n";

for (const key in protos) {
    PBpacket.addProtocol(protos[key]);
}

class MainPeer extends RPCPeer {
    private heartBeatWorker: HeartBeatWorker;
    private mRoomManager: RoomManager;
    private world: LogicWorld;
    private socket: WorkerClient;
    private render: any;
    constructor() {
        const t = self as any;
        super("mainWorker", t);
        this.world = new LogicWorld();
        this.socket = new WorkerClient(new ConnListener());
        this.heartBeatWorker = new HeartBeatWorker();
        this.linkTo(HEARTBEAT_WORKER, "worker-loader?filename=[hash][name].js!../game/heartBeat.worker").onReady(() => {
            this.render = this.remote[RENDER_PEER].Rener;
        });
    }
    // ============= connection调用主进程
    public onConnected(moveStyle: number) {
        // 告诉主进程链接成功
        this.render.onConnected(null, moveStyle);
        // 调用心跳
        this.startBeat();
        // 逻辑层world链接成功
        this.world.onConnected();
    }

    public onDisConnected() {
        // 告诉主进程断开链接
        this.render.onDisConnected();
        // 停止心跳
        this.endBeat();
        this.world.onDisConnected();
    }

    public onConnectError(error: string) {
        // 告诉主进程链接错误
        this.render.onConnectError(null, error);
        // 停止心跳
        this.endBeat();
        this.world.onError();
    }

    public onData(buffer: Buffer) {
        this.socket.onData(buffer);
    }

    public showAlert(text: string, title: string) {
        // 告诉render显示警告框
        this.render.showAlert(null, text, title);
    }

    public createAnotherGame(gameId: string, worldId: string, sceneId?: number, px?: number, py?: number, pz?: number) {
        this.render.createAnotherGame(null, gameId, worldId, sceneId, px, py, pz);
    }
    public enterVirtualWorld() {
        this.render.enterVirtualWorld();
    }

    public onClockReady() {
        this.render.onClockReady();
    }
    public renderReconnect() {
        this.render.reconnect();
    }
    public createGame(buffer: Buffer) {
        this.render.createGame(null, buffer);
    }
    // ============= 主进程调用心跳
    public startBeat() {
        this.remote[HEARTBEAT_WORKER].HeartBeatPeer.startBeat(null);
    }
    public endBeat() {
        this.remote[HEARTBEAT_WORKER].HeartBeatPeer.endBeat(null);
    }
    public clearBeat() {
        this.remote[HEARTBEAT_WORKER].HeartBeatPeer.endBeat(null);
    }

    // ============== render调用主进程
    @RPCFunction()
    public createAccount(gameID: string, worldID: string, sceneID?: number, loc?: any) {
        this.world.createAccount(gameID, worldID, sceneID, loc);
    }
    @RPCFunction([webworker_rpc.ParamType.str, webworker_rpc.ParamType.num, webworker_rpc.ParamType.boolean])
    public startConnect(host: string, port: number, secure?: boolean) {
        const addr: ServerAddress = { host, port, secure };
        this.socket.startConnect(addr);
    }

    @RPCFunction()
    public closeConnect() {
        this.socket.stopConnect();
    }
    @RPCFunction()
    public focus() {
        this.socket.pause = false;
    }
    @RPCFunction()
    public blur() {
        this.socket.pause = true;
    }
    /**
     * 初始化world中的各个管理器,并添加socket事件监听
     */
    @RPCFunction()
    public initWorld() {
        this.world.initWorld();
    }
    /**
     * 添加world中的socket消息监听
     */
    @RPCFunction()
    public initGame() {
        this.world.initGame();
    }
    @RPCFunction([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public setSize(width, height) {
        this.world.setSize(width, height);
    }
    @RPCFunction([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str])
    public setGameConfig(root: string, gameID: string) {
        this.world.setGameConfig(root, gameID);
    }
    @RPCFunction([webworker_rpc.ParamType.unit8array])
    public send(buffer: Buffer) {
        this.socket.send(buffer);
    }
    // ============= 心跳调用主进程
    @RPCFunction()
    public heartBeat() {
        // ==========同步心跳
        const pkt: PBpacket = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_GATEWAY_PING);
        this.socket.send(pkt.Serialization());
    }
    @RPCFunction()
    public reconnect() {
        // 告诉主进程重新连接
        this.render.reconnect();
    }
    @RPCFunction([webworker_rpc.ParamType.num])
    public syncClock(times: number) {
        this.world.syncClock(times);
    }
    @RPCFunction()
    public clearClock() {
        this.world.clearClock();
    }
    // ==== todo
    public terminate() {
        this.remote[HEARTBEAT_WORKER].HeartBeatPeer.terminate();
        this.terminate();
        // super.terminate();
    }
}

const RENDER_PEER = "renderPeer";
const MAIN_WORKER = "mainWorker";
const HEARTBEAT_WORKER = "heartBeatWorker";
const mainPeer: MainPeer = new MainPeer();
