import { RPCPeer, Export, webworker_rpc } from "webworker-rpc";
import { op_gateway, op_virtual_world, op_client } from "pixelpai_proto";
import { PBpacket, Buffer } from "net-socket-packet";
// import HeartBeatWorker from "worker-loader?filename=js/[name].js!../services/heartBeat.worker";
import * as protos from "pixelpai_proto";
import { ServerAddress } from "../../lib/net/address";
import { Game } from "./game";
import { Logger, LogicPoint } from "utils";
import { ILauncherConfig, HEARTBEAT_WORKER, HEARTBEAT_WORKER_URL, MAIN_WORKER, RENDER_PEER, ModuleName } from "structure";
import { PicaGame } from "picaWorker";
import { CacheDataManager } from "./data.manager/cache.dataManager";
import { DataMgrType } from "./data.manager/dataManager";
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
    // private isReconnect: boolean = false;
    constructor() {
        super(MAIN_WORKER);
        Logger.getInstance().log("constructor mainPeer");
        this.game = new PicaGame(this);
    }

    get render() {
        return this.remote[RENDER_PEER].Render;
    }
    // ============= connection调用主进程
    public onConnected() {
        // 告诉主进程链接成功
        this.remote[RENDER_PEER].Render.onConnected();
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

    public workerEmitter(eventType: string, data: any) {
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
        this.remote[HEARTBEAT_WORKER].HeartBeatPeer.clearBeat();
    }

    // ============== render调用主进程
    @Export()
    public createGame(config: ILauncherConfig) {
        this.mConfig = config;
        // ============
        Logger.getInstance().log("createGame");
        // const url: string = "/js/game" + "_v1.0.398";
        Logger.getInstance().log("render link onReady");
        this.linkTo(HEARTBEAT_WORKER, HEARTBEAT_WORKER_URL).onceReady(() => {
            this.game.createGame(this.mConfig);
            Logger.getInstance().log("heartBeatworker onReady in mainworker");
        });
    }

    @Export()
    public refreshToken() {
        this.game.refreshToken();
    }

    @Export([webworker_rpc.ParamType.num])
    public completeDragonBonesAnimationQueue(id: number) {
        const dragonbones = this.game.roomManager.currentRoom.playerManager.get(id);
        if (dragonbones) dragonbones.completeAnimationQueue();
    }

    @Export([webworker_rpc.ParamType.num])
    public completeFrameAnimationQueue(id: number) {
        const frames = this.game.roomManager.currentRoom.elementManager.get(id);
        if (frames) frames.completeAnimationQueue();
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.str, webworker_rpc.ParamType.num])
    public changePlayerState(id: number, state: string, times: number) {
        const dragonbones = this.game.roomManager.currentRoom.playerManager.get(id);
        if (dragonbones) dragonbones.changeState(state, times);
    }

    @Export([webworker_rpc.ParamType.num])
    public setDragonBonesQueue(id: number, animation: any) {
        const dragonbones = this.game.roomManager.currentRoom.playerManager.get(id);
        if (dragonbones) dragonbones.setQueue(animation);
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

    @Export([webworker_rpc.ParamType.boolean])
    public closeConnect(boo: boolean) {
        if (boo) this.terminate();
        this.game.connection.closeConnect();
    }

    @Export()
    public reconnect() {
        // if (this.isReconnect) return;
        // this.isReconnect = true;
        // 告诉逻辑进程重新链接
        this.game.reconnect();
    }

    @Export()
    public onFocus() {
        this.game.onFocus();
    }

    @Export()
    public onBlur() {
        this.game.onBlur();
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
        if (this.game.roomManager.currentRoom) this.game.roomManager.currentRoom.initUI();
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

    @Export([webworker_rpc.ParamType.num])
    public getPlayerName(id: number): string {
        return this.game.roomManager.currentRoom.playerManager.get(id).nickname;
    }

    @Export()
    public getPlayerAvatar(): any {
        if (this.game.roomManager && this.game.roomManager.currentRoom && this.game.roomManager.currentRoom.playerManager && this.game.roomManager.currentRoom.playerManager.actor)
            return this.game.roomManager.currentRoom.playerManager.actor.model.avatar;

        return null;
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
    public sendMouseEvent(id: number, mouseEvent: any[], point3f) {
        if (id !== 0 && mouseEvent.indexOf(4) !== -1) {
            const elemgr = this.game.roomManager.currentRoom.elementManager;
            elemgr.checkElementAction(id);
        }
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT = pkt.content;
        content.id = id;
        content.mouseEvent = mouseEvent;
        content.point3f = point3f;
        this.game.connection.send(pkt);
    }

    @Export()
    public exitUser() {
        this.game.exitUser();
    }

    @Export([webworker_rpc.ParamType.num])
    public displayStartMove(id: number) {
        const element = this.game.roomManager.currentRoom.playerManager.get(id);
        if (element) element.startMove();
    }

    @Export([webworker_rpc.ParamType.num])
    public displayCompleteMove(id: number) {
        const element = this.game.roomManager.currentRoom.playerManager.get(id);
        if (element) element.completeMove();
    }

    @Export([webworker_rpc.ParamType.num])
    public displayStopMove(id: number) {
        const element = this.game.roomManager.currentRoom.playerManager.get(id);
        if (element) element.stopMove();
    }

    @Export()
    public now(): number {
        return this.game.roomManager.currentRoom.now();
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public setDirection(id: number, direction: number) {
        const element = this.game.roomManager.currentRoom.playerManager.get(id);
        if (element) element.setDirection(direction);
    }

    @Export()
    public onTapHandler(obj: any) {
        if (this.game.roomManager.currentRoom) this.game.roomManager.currentRoom.move(obj.id, obj.x, obj.y, obj.nodeType);
    }

    @Export()
    public isCurrentRoomEditEnable(): boolean {
        if (this.game.roomManager && this.game.roomManager.currentRoom) {
            return this.game.roomManager.currentRoom.enableEdit;
        }
        return false;
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

    @Export([webworker_rpc.ParamType.num])
    public syncClock(times: number) {
        this.game.syncClock(times);
    }

    @Export()
    public clearClock() {
        this.game.clearClock();
    }

    @Export()
    public requestCurTime(): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.remote[RENDER_PEER].Render.getCurTime(this.game.clock.unixTime)
                .then((t) => {
                    resolve(t);
                });
        });
    }

    @Export([webworker_rpc.ParamType.boolean])
    public httpClockEnable(enable: boolean) {
        this.game.httpClock.enable = enable;
    }

    @Export([webworker_rpc.ParamType.str])
    public showNoticeHandler(text: string) {
        const data = new op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI();
        data.text = [{ text, node: undefined }];
        this.game.showByName(ModuleName.PICANOTICE_NAME, data);
    }

    @Export([webworker_rpc.ParamType.str])
    public showPanelHandler(name: string, data?: any) {
        this.game.showByName(name, data);
    }

    @Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.boolean])
    public showMediator(name: string, isShow: boolean, param?: any) {
        if (name.length === 0) return;
        this.game.showMediator(name, isShow, param);
    }

    @Export()
    public exportUimanager(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.exportProperty(this.game.uiManager, this, "uiManager").onceReady(() => {
                resolve(true);
            });
        });
    }

    @Export([webworker_rpc.ParamType.str])
    public hideMediator(name: string) {
        this.game.hideMediator(name);
    }

    @Export([webworker_rpc.ParamType.str])
    public renderEmitter(eventType: string, data: any) {
        this.game.emitter.emit(eventType, data);
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

    @Export()
    public getUserData_PlayerProperty(): any {
        if (this.game.user && this.game.user.userData) {
            return this.game.user.userData.playerProperty;
        }

        return null;
    }

    @Export()
    public getUserData_CurRoomID(): string {
        if (this.game.user && this.game.user.userData) {
            return this.game.user.userData.curRoomID;
        }

        return null;
    }

    @Export()
    public getCurRoom() {
        const mgr = this.game.dataManager.getDataMgr<CacheDataManager>(DataMgrType.CacheMgr);
        return mgr ? mgr.curRoom : null;
    }

    @Export()
    public getRoomUserName() {
        return this.game.user.userData.playerProperty.nickname;
    }

    @Export()
    public getClockNow() {
        return this.game.clock.unixTime;
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public findPath(x: number, y: number, targetId?: number) {
        this.game.user.findPath(x, y, targetId);
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public moveMotion(x: number, y: number, targetId?: number) {
        this.game.user.moveMotion(x, y, targetId);
    }

    // ==== todo
    public terminate() {
        this.remote[HEARTBEAT_WORKER].HeartBeatPeer.terminate();
        self.close();
        // super.terminate();
    }

    /**
     * 慎用，super.destroy()会使worker.terminator,致使整个游戏进程关闭
     */
    public destroy() {
        super.destroy();
        this.remote[HEARTBEAT_WORKER].HeartBeatPeer.destroy();
    }

    // ==== config
    public isPlatform_PC() {
        return this.mConfig && this.mConfig.platform && this.mConfig.platform === "pc";
    }
}
const context: MainPeer = new MainPeer();
