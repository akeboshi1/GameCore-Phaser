import { RPCPeer, Export, webworker_rpc } from "webworker-rpc";
import { op_gateway } from "pixelpai_proto";
import { PBpacket, Buffer } from "net-socket-packet";
import HeartBeatWorker from "worker-loader?filename=[hash][name].js!../game/heartBeat.worker";
import * as protos from "pixelpai_proto";
import { World } from "./world";
import { GameSocket, ConnListener, Connection } from "./net/connection";
import { RoomManager } from "./room/room.manager";
import { ServerAddress } from "../../lib/net/address";
for (const key in protos) {
    PBpacket.addProtocol(protos[key]);
}

export class MainPeer extends RPCPeer {
    private mRoomManager: RoomManager;
    private world: World;
    private socket: GameSocket;
    private render: any;
    private connect: Connection;
    private heartBearPeer: any;
    constructor() {
        super("mainWorker");
        this.world = new World(this);
        this.socket = new GameSocket(this, new ConnListener(this));
        this.connect = new Connection(this.socket);
        this.world.setConnect(this.connect);
        this.linkTo(RENDER_PEER, "").onceReady(() => {
            this.render = this.remote[RENDER_PEER].Rener;
        });
        this.linkTo(HEARTBEAT_WORKER, "worker-loader?filename=[hash][name].js!../game/heartBeat.worker").onceReady(() => {
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
        this.render.onConnectError(error);
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
        this.render.setMoveStyle(moveStyle);
    }

    public onData(buffer: Buffer) {
        this.socket.onData(buffer);
    }

    public showAlert(text: string, title: string) {
        // 告诉render显示警告框
        this.render.showAlert(text, title);
    }

    public createAnotherGame(gameId: string, worldId: string, sceneId?: number, px?: number, py?: number, pz?: number) {
        this.render.createAnotherGame(gameId, worldId, sceneId, px, py, pz);
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
        this.render.createGame(buffer);
    }

    public clearGame() {
        //  if (this.mCameraService) this.mCameraService.destroy();
        this.render.clearGame();
    }

    public roomResume(roomID: number) {
        this.render.roomResume(roomID);
    }

    public roomPause(roomID: number) {
        this.render.roomPause(roomID);
    }

    public setCameraBounds(x: number, y: number, width: number, height: number) {
        this.render.setCameraBounds(x, y, width, height);
    }

    public fadeIn(id: number, type: number, callback?: Function) {
        this.render.fadeIn(id, type);
    }

    public fadeOut(id: number, type: number, callback?: Function) {
        this.render.fadeOut(id, type);
    }

    public fadeAlpha(id: number, type: number, alpha: number) {
        this.render.fadeAlpha(id, type, alpha);
    }

    public destroy() {
        // this.world.emitter.off(ClickEvent.Tap, this.onTapHandler, this);
        // this.mWorld.game.scene.remove(PlayScene.name);
        // this.world.emitter.off(MessageType.PRESS_ELEMENT, this.onPressElementHandler, this);
        // Logger.getInstance().log("#BlackSceneFromBackground; remove scene: ", PlayScene.name);
        this.render.destroy();
    }

    public showLoading() {
        this.render.showLoading();
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
    @Export()
    public requestCurTime() {
        this.render.getCurTime(this.world.clock.unixTime);
    }
    // ==== todo
    public terminate() {
        this.heartBearPeer.terminate();
        self.close();
        // super.terminate();
    }
}

const RENDER_PEER = "renderPeer";
const MAIN_WORKER = "mainWorker";
const HEARTBEAT_WORKER = "heartBeatWorker";
const mainPeer: MainPeer = new MainPeer();
