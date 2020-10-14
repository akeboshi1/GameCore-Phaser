import { RPCPeer, Export, webworker_rpc } from "webworker-rpc";
import { op_gateway } from "pixelpai_proto";
import { PBpacket, Buffer } from "net-socket-packet";
import HeartBeatWorker from "worker-loader?filename=[hash][name].js!../game/heartBeat.worker";
import * as protos from "pixelpai_proto";
import { GameSocket, ConnListener, Connection } from "./net/connection";
import { ServerAddress } from "../../lib/net/address";
import { Render } from "../render/render";
import { RoomManager } from "./room/roomManager/room.manager";
import { Game } from "./game";
import { ILauncherConfig } from "../structureinterface/lanucher.config";
for (const key in protos) {
    PBpacket.addProtocol(protos[key]);
}

export class MainPeer extends RPCPeer {
    private mRoomManager: RoomManager;
    private mGame: Game;
    // private socket: GameSocket;
    private mRender: any;
    // private connect: Connection;
    private heartBearPeer: any;
    constructor(private game: Game) {
        super("mainWorker");
        this.mGame = game;
        this.linkTo(RENDER_PEER, "").onceReady(() => {
            this.mRender = this.remote[RENDER_PEER];
        });
        this.linkTo(HEARTBEAT_WORKER, "worker-loader?filename=[hash][name].js!../game/heartBeat.worker").onceReady(() => {
            this.heartBearPeer = this.remote[HEARTBEAT_WORKER].HeartBeatPeer;
        });
    }
    get render(): Render {
        return this.mRender.Render;
    }
    // ============= connection调用主进程
    public onConnected() {
        // 告诉主进程链接成功
        this.mRender.onConnected();
        // 调用心跳
        this.startBeat();
        // 逻辑层game链接成功
        this.game.onConnected();
    }

    public onDisConnected() {
        // 告诉主进程断开链接
        this.mRender.onDisConnected();
        // 停止心跳
        this.endBeat();
        this.game.onDisConnected();
    }

    public onConnectError(error: string) {
        // 告诉主进程链接错误
        this.mRender.onConnectError(error);
        // 停止心跳
        this.endBeat();
        this.mGame.onError();
    }

    public onData(buffer: Buffer) {
        this.game.socket.onData(buffer);
    }

    // ============= 主进程调用心跳
    public startBeat() {
        this.heartBearPeer.startBeat();
    }
    public endBeat() {
        this.heartBearPeer.endBeat();
    }
    public clearBeat() {
        this.heartBearPeer.endBeat();
    }

    // ============== render调用主进程
    @Export()
    public createGame(config: ILauncherConfig) {
        this.game.createGame(config);
    }
    @Export()
    public createAccount(gameID: string, worldID: string, sceneID?: number, loc?: any) {
        this.game.createAccount(gameID, worldID, sceneID, loc);
    }
    @Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.num, webworker_rpc.ParamType.boolean])
    public startConnect(host: string, port: number, secure?: boolean) {
        const addr: ServerAddress = { host, port, secure };
        this.game.connection.startConnect(addr);
    }

    @Export()
    public closeConnect() {
        this.terminate();
        this.game.connection.closeConnect();
    }
    @Export()
    public focus() {
        this.game.socket.pause = false;
        // todo manager resume
    }
    @Export()
    public blur() {
        this.game.socket.pause = true;
        // todo manager pause
    }
    /**
     * 初始化world中的各个管理器,并添加socket事件监听
     */
    @Export([webworker_rpc.ParamType.boolean])
    public initWorld(desk: boolean) {
        this.game.initWorld(desk);
    }
    /**
     * 添加world中的socket消息监听
     */
    @Export()
    public initGame() {
        this.game.initGame();
    }
    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public setSize(width, height) {
        this.game.setSize(width, height);
    }
    @Export([webworker_rpc.ParamType.str])
    public setGameConfig(configStr: string) {
        this.game.setGameConfig(configStr);
    }
    @Export([webworker_rpc.ParamType.unit8array])
    public send(buffer: Buffer) {
        this.game.socket.send(buffer);
    }
    @Export()
    public destroyClock() {
        this.game.destroyClock();
    }
    @Export()
    public clearGameComplete() {
        this.game.clearGameComplete();
    }
    // ============= 心跳调用主进程
    @Export()
    public heartBeat() {
        // ==========同步心跳
        const pkt: PBpacket = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_GATEWAY_PING);
        this.game.socket.send(pkt.Serialization());
    }
    @Export()
    public creareRole() {

    }
    @Export()
    public reconnect() {
        // 告诉主进程重新连接
        this.mRender.reconnect();
    }
    @Export([webworker_rpc.ParamType.num])
    public syncClock(times: number) {
        this.game.syncClock(times);
    }
    @Export()
    public clearClock() {
        this.game.clearClock();
    }
    @Export()
    public requestCurTime() {
        this.mRender.getCurTime(this.game.clock.unixTime);
    }
    // ==== todo
    public terminate() {
        this.heartBearPeer.terminate();
        self.close();
        // super.terminate();
    }

    public destroy() {
        super.destroy();
    }
}

const RENDER_PEER = "renderPeer";
const MAIN_WORKER = "mainWorker";
const HEARTBEAT_WORKER = "heartBeatWorker";
