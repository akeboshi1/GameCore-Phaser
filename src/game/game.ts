import { RPCPeer, Export, webworker_rpc } from "webworker-rpc";
import { op_gateway } from "pixelpai_proto";
import { PBpacket, Buffer } from "net-socket-packet";
import HeartBeatWorker from "worker-loader?filename=[hash][name].js!../game/heartBeat.worker";
import * as protos from "pixelpai_proto";
import { World } from "./world";
import { GameSocket, ConnListener, Connection } from "./net/connection";
import { RoomManager } from "./room/room.manager";
import { ServerAddress } from "../../lib/net/address";
import { Render } from "../render/render";
for (const key in protos) {
    PBpacket.addProtocol(protos[key]);
}

export class MainPeer extends RPCPeer {
    private mRoomManager: RoomManager;
    private world: World;
    private socket: GameSocket;
    private mRender: any;
    private connect: Connection;
    private heartBearPeer: any;
    constructor() {
        super("mainWorker");
        this.world = new World(this);
        this.socket = new GameSocket(this, new ConnListener(this));
        this.connect = new Connection(this.socket);
        this.world.setConnect(this.connect);
        this.linkTo(RENDER_PEER, "").onceReady(() => {
            this.mRender = this.remote[RENDER_PEER].Rener;
        });
        this.linkTo(HEARTBEAT_WORKER, "worker-loader?filename=[hash][name].js!../game/heartBeat.worker").onceReady(() => {
            this.heartBearPeer = this.remote[HEARTBEAT_WORKER].HeartBeatPeer;
        });
    }
    get render(): Render {
        return this.mRender;
    }
    // ============= connection调用主进程
    public onConnected() {
        // 告诉主进程链接成功
        this.mRender.onConnected();
        // 调用心跳
        this.startBeat();
        // 逻辑层world链接成功
        this.world.onConnected();
    }

    public onDisConnected() {
        // 告诉主进程断开链接
        this.mRender.onDisConnected();
        // 停止心跳
        this.endBeat();
        this.world.onDisConnected();
    }

    public onConnectError(error: string) {
        // 告诉主进程链接错误
        this.mRender.onConnectError(error);
        // 停止心跳
        this.endBeat();
        this.world.onError();
    }

    public onData(buffer: Buffer) {
        this.socket.onData(buffer);
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
        // todo manager resume
    }
    @Export()
    public blur() {
        this.socket.pause = true;
        // todo manager pause
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
    public creareRole() {
        this.
    }
    @Export()
    public reconnect() {
        // 告诉主进程重新连接
        this.mRender.reconnect();
    }
    @Export([webworker_rpc.ParamType.num])
    public syncClock(times: number) {
        this.world.syncClock(times);
    }
    @Export()
    public clearClock() {
        this.world.clearClock();
    }
    @Export()
    public requestCurTime() {
        this.mRender.getCurTime(this.world.clock.unixTime);
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
const mainPeer: MainPeer = new MainPeer();
