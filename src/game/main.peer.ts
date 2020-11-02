import { RPCPeer, Export, webworker_rpc } from "webworker-rpc";
import { op_gateway, op_virtual_world } from "pixelpai_proto";
import { PBpacket, Buffer } from "net-socket-packet";
// import HeartBeatWorker from "worker-loader?filename=js/[name].js!../services/heartBeat.worker";
import * as protos from "pixelpai_proto";
import { ServerAddress } from "../../lib/net/address";
import { Game } from "./game";
import { Logger, LogicPoint } from "utils";
import { EventType, ILauncherConfig, HEARTBEAT_WORKER, HEARTBEAT_WORKER_URL, MAIN_WORKER, RENDER_PEER } from "structure";
for (const key in protos) {
    PBpacket.addProtocol(protos[key]);
}

export class MainPeer extends RPCPeer {
    @Export()
    private game: Game;
    private mConfig: ILauncherConfig;
    /**
     * 主进程和render之间完全链接成功
     */
    private isReady: boolean = false;
    constructor() {
        super(MAIN_WORKER);
        Logger.getInstance().log("constructor mainPeer");
        this.game = new Game(this);
    }

    get render() {
        return this.remote[RENDER_PEER].Render;
    }
    // ============= connection调用主进程
    public onConnected() {
        // 告诉主进程链接成功
        this.remote[RENDER_PEER].Render.onConnected();
        // 调用心跳
        this.startBeat();
        // 逻辑层game链接成功
        this.game.onConnected();
    }

    public onDisConnected() {
        // 告诉主进程断开链接
        this.remote[RENDER_PEER].Render.onDisConnected();
        // 停止心跳
        this.endBeat();
        this.game.onDisConnected();
    }

    public onConnectError(error: string) {
        // 告诉主进程链接错误
        this.remote[RENDER_PEER].Render.onConnectError(error);
        // 停止心跳
        this.endBeat();
        this.game.onError();
    }

    public onData(buffer: Buffer) {
        this.game.connection.onData(buffer);
    }

    public workerEmitter(eventType: EventType, data: any) {
        this.render.workerEmitter(eventType, data);
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
            this.game.createGame(this.mConfig);
            Logger.getInstance().log("heartBeatworker onReady");
        });
    }

    @Export()
    public refreshToken() {
        this.game.refreshToken();
    }

    @Export()
    public loginEnterWorld() {
        Logger.getInstance().log("game======loginEnterWorld");
        this.game.loginEnterWorld();
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

    @Export()
    public initUI() {
        // 根据不同场景初始化不同场景ui
        this.game.roomManager.currentRoom.initUI();
    }

    @Export([webworker_rpc.ParamType.str])
    public getActiveUIData(str: string): any {
        return this.game.uiManager.getActiveUIData(str);
    }

    @Export()
    public startRoomPlay() {
        Logger.getInstance().log("peer startroom");
        this.game.roomManager.currentRoom.startPlay();
    }

    // @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    // public updateRoom(time: number, delta: number) {
    //     this.game.roomManager.currentRoom.update(time, delta);
    // }

    @Export()
    public allowLogin() {

    }

    @Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str, webworker_rpc.ParamType.str])
    public loginByPhoneCode(phone: string, code: string, areaCode: string) {

    }

    @Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str])
    public onVerifiedHandler(name: string, idcard: string) {

    }

    @Export()
    public getCurrentRoomSize(): any {
        return this.game.roomManager.currentRoom.roomSize;
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public resetGameraSize(width: number, height: number) {
        if (this.game.roomManager && this.game.roomManager.currentRoom && this.game.roomManager.currentRoom.cameraService) this.game.roomManager.currentRoom.cameraService.resetCameraSize(width, height);
    }

    @Export()
    public syncCameraScroll() {
        if (this.game.roomManager && this.game.roomManager.currentRoom && this.game.roomManager.currentRoom.cameraService) {
            Logger.getInstance().log("mainpeer====synccamerascroll");
            this.game.roomManager.currentRoom.cameraService.syncCameraScroll();
        }
    }

    @Export()
    public sendMouseEvent(id: number, mouseEvent, point3f) {
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT = pkt.content;
        content.id = id;
        content.mouseEvent = mouseEvent;
        content.point3f = point3f;
        this.game.connection.send(pkt);
    }

    @Export([webworker_rpc.ParamType.num])
    public displayStartMove(id: number) {
        const element = this.game.roomManager.currentRoom.elementManager.get(id);
        if (element) element.startMove();
    }

    @Export([webworker_rpc.ParamType.num])
    public displayCompleteMove(id: number) {
        const element = this.game.roomManager.currentRoom.elementManager.get(id);
        if (element) element.completeMove();
    }

    @Export([webworker_rpc.ParamType.num])
    public displayStopMove(id: number) {
        const element = this.game.roomManager.currentRoom.elementManager.get(id);
        if (element) element.stopMove();
    }

    @Export()
    public now(): number {
        return this.game.roomManager.currentRoom.now();
    }

    @Export()
    public onTapHandler(obj: any) {
        this.game.roomManager.currentRoom.move(obj.id, obj.x, obj.y, obj.nodeType);
    }

    // ============= 心跳调用主进程
    @Export()
    public startHeartBeat() {
        // ==========同步心跳
        const pkt: PBpacket = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_GATEWAY_PING);
        this.game.socket.send(pkt.Serialization());
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
        this.game.syncClock(times);
    }

    @Export()
    public clearClock() {
        this.game.clearClock();
    }

    @Export()
    public requestCurTime() {
        this.remote[RENDER_PEER].Render.getCurTime(this.game.clock.unixTime);
    }

    @Export([webworker_rpc.ParamType.boolean])
    public httpClockEnable(enable: boolean) {
        this.game.httpClock.enable = enable;
    }

    @Export()
    public showMediator(name, param?: any) {
        this.game.showMediator(name, param);
    }

    // display data getter
    @Export()
    public framesModel_getAnimations(id: number, name: string): any {// IAnimationData
        return null;
    }

    @Export()
    public framesModel_getCollisionArea(id: number, aniName: string, flip: boolean): number[][] {
        return null;
    }

    @Export()
    public framesModel_getOriginPoint(id: number, aniName: string, flip: boolean): LogicPoint {
        return null;
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
