import { RPCPeer, Export, webworker_rpc } from "../game/core/render/node_modules/webworker-rpc";
import { op_gateway } from "pixelpai_proto";
import { PBpacket, Buffer } from "net-socket-packet";
import { ServerAddress } from "../../lib/net/address";
import HeartBeatWorker from "worker-loader?filename=[hash][name].js!../game/heartBeat.worker";
import * as protos from "pixelpai_proto";
import { LogicWorld } from "./logic.world";
import { WorkerClient, ConnListener } from "./worker.client";
import Connection from "./connection";
import { RoomManager } from "../rooms/room.manager";

for (const key in protos) {
    PBpacket.addProtocol(protos[key]);
}

export class MainPeer extends RPCPeer {
    private mRoomManager: RoomManager;
    private world: LogicWorld;
    private socket: WorkerClient;
    private render: any;
    private connect: Connection;
    private heartBearPeer: any;
    constructor() {
        super("mainWorker");

        this.world = new LogicWorld(this);
        this.socket = new WorkerClient(this, new ConnListener(this));
        this.connect = new Connection(this.socket);
        this.world.setConnect(this.connect);
        this.linkTo(RENDER_PEER, "").onReady(() => {
            this.render = this.remote[RENDER_PEER].Rener;
        });
        this.linkTo(HEARTBEAT_WORKER, "worker-loader?filename=[hash][name].js!../game/heartBeat.worker").onReady(() => {
            this.heartBearPeer = this.remote[HEARTBEAT_WORKER].HeartBeatPeer;
        });
    }
    // ============= connection调用主进程
    public onConnected() {
        // 告诉主进程链接成功
        this.render.onConnected();
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

    /**
     * 告诉主进程加载场景pi
     * @param sceneID
     */
    public loadSceneConfig(sceneID: number) {
        this.render.loadSceneConfig(sceneID);
    }

    public connectFail() {
        this.render.connectFail();
    }

    public setMoveStyle(moveStyle: number) {
        this.render.setMoveStyle(null, moveStyle);
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

    public clearGame() {
        this.render.clearGame();
    }

    public roomResume() {
        this.render.roomResume();
    }

    public roomPause() {
        this.render.roomPause();
    }

    public showLoading() {
        this.render.showLoading();
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
    @Export([webworker_rpc.ParamType.str])
    public initGameConfig(str: string) {
        const config = JSON.parse(str);
        this.world.initGameConfig(config);
    }
    @Export()
    public createAccount(gameID: string, worldID: string, sceneID?: number, loc?: any) {
        this.world.createAccount(gameID, worldID, sceneID, loc);
    }
    @Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.num, webworker_rpc.ParamType.boolean])
    public startConnect(host: string, port: number, secure?: boolean) {
        const addr: ServerAddress = { host, port, secure };
        this.connect.startConnect(addr);
    }

    @Export()
    public closeConnect() {
        mainPeer.terminate();
        this.connect.closeConnect();
    }
    @Export()
    public focus() {
        this.socket.pause = false;
    }
    @Export()
    public blur() {
        this.socket.pause = true;
    }
    /**
     * 初始化world中的各个管理器,并添加socket事件监听
     */
    @Export([webworker_rpc.ParamType.boolean])
    public initWorld(desk: boolean) {
        this.world.initWorld(desk);
    }
    /**
     * 添加world中的socket消息监听
     */
    @Export()
    public initGame() {
        this.world.initGame();
    }
    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public setSize(width, height) {
        this.world.setSize(width, height);
    }
    @Export([webworker_rpc.ParamType.str])
    public setGameConfig(configStr: string) {
        this.world.setGameConfig(configStr);
    }
    @Export([webworker_rpc.ParamType.unit8array])
    public send(buffer: Buffer) {
        this.socket.send(buffer);
    }
    @Export()
    public destroyClock() {
        this.world.destroyClock();
    }
    @Export()
    public clearGameComplete() {
        this.world.clearGameComplete();
    }
    // ============= 心跳调用主进程
    @Export()
    public heartBeat() {
        // ==========同步心跳
        const pkt: PBpacket = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_GATEWAY_PING);
        this.socket.send(pkt.Serialization());
    }
    @Export()
    public reconnect() {
        // 告诉主进程重新连接
        this.render.reconnect();
    }
    @Export([webworker_rpc.ParamType.num])
    public syncClock(times: number) {
        this.world.syncClock(times);
    }
    @Export()
    public clearClock() {
        this.world.clearClock();
    }
    // ==== todo
    public terminate() {
        this.remote[HEARTBEAT_WORKER].HeartBeatPeer.terminate();
        self.close();
        // super.terminate();
    }
}

const RENDER_PEER = "renderPeer";
const MAIN_WORKER = "mainWorker";
const HEARTBEAT_WORKER = "heartBeatWorker";
const mainPeer: MainPeer = new MainPeer();
