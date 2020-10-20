import { RPCPeer, Export, webworker_rpc } from "webworker-rpc";
import { op_gateway } from "pixelpai_proto";
import { PBpacket, Buffer } from "net-socket-packet";
// import HeartBeatWorker from "worker-loader?filename=js/[name].js!../services/heartBeat.worker";
import * as protos from "pixelpai_proto";
import { GameSocket, ConnListener, Connection } from "./net/connection";
import { ServerAddress } from "../../lib/net/address";
import { Render } from "../render/render";
import { Game } from "./game";
import { ILauncherConfig } from "../structureinterface/lanucher.config";
import { Logger } from "../utils/log";
import { HEARTBEAT_WORKER, HEARTBEAT_WORKER_URL, MAIN_WORKER, RENDER_PEER } from "../structureinterface/worker.name";
for (const key in protos) {
    PBpacket.addProtocol(protos[key]);
}

export class MainPeer extends RPCPeer {
    // private mRoomManager: RoomManager;
    private mGame: Game;
    private mConfig: ILauncherConfig;
    // private socket: GameSocket;
    // private connect: Connection;
    /**
     * 主进程和render之间完全链接成功
     */
    private isReady: boolean = false;
    constructor() {
        super(MAIN_WORKER);
        Logger.getInstance().log("constructor mainPeer");
        this.mGame = new Game(this);
    }
    get render(): Render {
        return this.remote[RENDER_PEER].Render;
    }
    // ============= connection调用主进程
    public onConnected() {
        // 告诉主进程链接成功
        this.remote[RENDER_PEER].Render.onConnected();
        // 调用心跳
        this.startBeat();
        // 逻辑层game链接成功
        this.mGame.onConnected();
    }

    public onDisConnected() {
        // 告诉主进程断开链接
        this.remote[RENDER_PEER].Render.onDisConnected();
        // 停止心跳
        this.endBeat();
        this.mGame.onDisConnected();
    }

    public onConnectError(error: string) {
        // 告诉主进程链接错误
        this.remote[RENDER_PEER].Render.onConnectError(error);
        // 停止心跳
        this.endBeat();
        this.mGame.onError();
    }

    public onData(buffer: Buffer) {
        this.mGame.connection.onData(buffer);
    }

    // ============= 主进程调用心跳
    public startBeat() {
        this.remote[HEARTBEAT_WORKER].HeartBeatPeer.startBeat();
    }
    public endBeat() {
        this.remote[HEARTBEAT_WORKER].HeartBeatPeer.endBeat();
    }
    public clearBeat() {
        this.remote[HEARTBEAT_WORKER].HeartBeatPeer.endBeat();
    }

    // ============== render调用主进程
    @Export()
    public createGame(config: ILauncherConfig) {
        this.mConfig = config;
        // ============
        Logger.getInstance().log("createGame");
        const url: string = "/js/game" + "_v1.0.398";
        Logger.getInstance().log("render link onReady");
        this.linkTo(HEARTBEAT_WORKER, HEARTBEAT_WORKER_URL).onceReady(() => {
            this.mGame.createGame(this.mConfig);
            Logger.getInstance().log("heartBeatworker onReady");
        });
    }

    @Export()
    public refreshToken() {
        this.mGame.refreshToken();
    }

    @Export()
    public loginEnterWorld() {
        Logger.getInstance().log("game======loginEnterWorld");
        this.mGame.loginEnterWorld();
    }

    @Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.num, webworker_rpc.ParamType.boolean])
    public startConnect(host: string, port: number, secure?: boolean) {
        const addr: ServerAddress = { host, port, secure };
        this.mGame.connection.startConnect(addr);
    }

    @Export()
    public closeConnect() {
        this.terminate();
        this.mGame.connection.closeConnect();
    }

    @Export()
    public focus() {
        this.mGame.socket.pause = false;
        // todo manager resume
    }

    @Export()
    public blur() {
        this.mGame.socket.pause = true;
        // todo manager pause
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public setSize(width, height) {
        this.mGame.setSize(width, height);
    }

    @Export([webworker_rpc.ParamType.str])
    public setGameConfig(configStr: string) {
        this.mGame.setGameConfig(configStr);
    }

    @Export([webworker_rpc.ParamType.unit8array])
    public send(buffer: Buffer) {
        this.mGame.socket.send(buffer);
    }

    @Export()
    public destroyClock() {
        this.mGame.destroyClock();
    }

    @Export()
    public clearGameComplete() {
        this.mGame.clearGameComplete();
    }

    @Export()
    public allowLogin() {

    }

    @Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str, webworker_rpc.ParamType.str])
    public loginByPhoneCode(phone: string, code: string, areaCode: string) {

    }

    @Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str])
    public onVerifiedHandler(name: string, idcard: string) {

    }

    // ============= 心跳调用主进程
    @Export()
    public startHeartBeat() {
        // ==========同步心跳
        const pkt: PBpacket = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_GATEWAY_PING);
        this.mGame.socket.send(pkt.Serialization());
    }

    @Export()
    public endHeartBeat() {

    }

    @Export()
    public clearHeartBeat() {

    }

    @Export()
    public creareRole() {

    }

    @Export()
    public reconnect() {
        // 告诉主进程重新连接
        this.remote[RENDER_PEER].Render.reconnect();
    }

    @Export([webworker_rpc.ParamType.num])
    public syncClock(times: number) {
        this.mGame.syncClock(times);
    }

    @Export()
    public clearClock() {
        this.mGame.clearClock();
    }

    @Export()
    public requestCurTime() {
        this.remote[RENDER_PEER].Render.getCurTime(this.mGame.clock.unixTime);
    }

    @Export([webworker_rpc.ParamType.boolean])
    public httpClockEnable(enable: boolean) {
        this.mGame.httpClock.enable = enable;
    }

    @Export()
    public showMediator(name, param?: any) {
        this.mGame.showMediator(name, param);
    }

    // ==== todo
    public terminate() {
        this.remote[HEARTBEAT_WORKER].HeartBeatPeer.terminate();
        self.close();
        // super.terminate();
    }

    public destroy() {
        super.destroy();
        this.remote[HEARTBEAT_WORKER].HeartBeatPeer.destroy();
    }
}
const context: MainPeer = new MainPeer();
