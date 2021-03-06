import { RPCPeer, Export, webworker_rpc } from "webworker-rpc";
import { op_gateway, op_virtual_world } from "pixelpai_proto";
import { PBpacket, Buffer } from "net-socket-packet";
import * as protos from "pixelpai_proto";
import { Game } from "./game";
import { IPos, Logger, ILauncherConfig, EventType, IWorkerParam, LogicPos } from "structure";
import { BaseState } from "./state";
import { Player } from "./room/player/player";

for (const key in protos) {
    PBpacket.addProtocol(protos[key]);
}
export class MainPeer extends RPCPeer {
    @Export()
    protected mGame: Game;
    protected mRenderParam: IWorkerParam;
    protected mMainPeerParam: IWorkerParam;
    protected mStartRoomPlay: boolean = false;
    private stateTime: number = 0;
    private mConfig: ILauncherConfig;
    /**
     * 主进程和render之间完全链接成功
     */
    private isReady: boolean = false;
    private delayTime: number = 15000;
    private reConnectCount: number = 0;
    private startDelay: any;

    // private isReconnect: boolean = false;
    constructor(workerName: string) {
        super(workerName);
        this.game = new Game(this);
        this.stateTime = Date.now();
    }

    get renderParam() {
        return this.mRenderParam;
    }

    get mainPeerParam() {
        return this.mMainPeerParam;
    }

    get render() {
        return this.remote[this.mRenderParam.key][this.mRenderParam.name];
    }

    get config(): ILauncherConfig {
        return this.mConfig;
    }

    get game(): Game {
        return this.mGame;
    }

    set game(val) {
        this.mGame = val;
    }

    get state(): BaseState {
        return this.game.gameStateManager.curState;
    }

    set state(val) {
        const now: number = new Date().getTime();
        Logger.getInstance().log("gameState: ====>", val, "delayTime:=====>", now - this.stateTime);
        this.stateTime = now;
    }
    // ============= connection调用主进程
    public onConnected(isAuto: boolean) {
        // 逻辑层game链接成功
        this.game.onConnected(isAuto);
    }

    public onDisConnected(isAuto) {
        // 告诉主进程断开链接
        this.render.onDisConnected();
        // 停止心跳
        this.endBeat();
        this.game.onDisConnected(isAuto);
    }

    public onConnectError(error: string) {
        // 告诉主进程链接错误
        this.render.onConnectError(error);
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

    public startBeat() {
        if (this.startDelay) return;
        this.startDelay = setInterval(() => {
            if (this.reConnectCount >= 8) {
                this.game.reconnect();
                return;
            }
            this.reConnectCount++;
            const pkt: PBpacket = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_GATEWAY_PING);
            this.game.socket.send(pkt.Serialization());
        }, this.delayTime);
    }

    public endBeat() {
        this.reConnectCount = 0;
        if (this.startDelay) {
            clearInterval(this.startDelay);
            this.startDelay = null;
        }
        Logger.getInstance().log("heartBeat end");
        // this.mainPeer.endHeartBeat();
    }

    @Export()
    public clearBeat() {
        this.reConnectCount = 0;
        // Logger.getInstance().debug("heartBeatWorker clearBeat");
        // this.mainPeer.clearHeartBeat();
    }

    @Export([webworker_rpc.ParamType.str])
    public refrehActiveUIState(panel: string) {
        return this.game.uiManager.refrehActiveUIState(panel);
    }

    @Export([webworker_rpc.ParamType.boolean])
    public showMovePoint(val: boolean) {
        if (this.game && this.game.user) this.game.user.debugPoint = val;
    }

    // ============== render调用主进程
    @Export()
    public createGame(config: ILauncherConfig) {
        this.mConfig = config;
        this.game.init(config);
        // log 在不同进程中都需要设置debug参数
        Logger.getInstance().isDebug = config.debugLog || false;
    }

    @Export()
    public getScaleRatio() {
        return this.game.scaleRatio;
    }

    @Export()
    public updateMoss(moss) {
        if (this.game.elementStorage) this.game.elementStorage.updateMoss(moss);
    }

    @Export([webworker_rpc.ParamType.num])
    public removeElement(id: number) {
        if (this.game.roomManager && this.game.roomManager.currentRoom && this.game.roomManager.currentRoom.elementManager) {
            this.game.roomManager.currentRoom.elementManager.remove(id);
        }
    }

    @Export()
    public refreshToken() {
        this.game.refreshToken();
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.str])
    public changePlayerState(id: number, state: string, times?: number) {
        const playser = <Player>this.game.roomManager.currentRoom.playerManager.get(id);
        if (playser) playser.changeState(state, times);
    }

    @Export([webworker_rpc.ParamType.num])
    public setDragonBonesQueue(id: number, animation: any) {
        const dragonbones = this.game.roomManager.currentRoom.playerManager.get(id);
        if (dragonbones) dragonbones.setQueue(animation);
    }

    @Export()
    public loginEnterWorld() {
        Logger.getInstance().debug("game======loginEnterWorld");
        this.game.loginEnterWorld();
    }

    @Export([webworker_rpc.ParamType.boolean])
    public closeConnect(boo: boolean) {
        if (boo) this.terminate();
        this.game.connection.closeConnect();
    }

    @Export()
    public reconnect(isAuto: boolean) {
        // if (this.isReconnect) return;
        // this.isReconnect = true;
        // 告诉逻辑进程重新链接
        this.game.reconnect();
    }

    @Export()
    public refreshConnect() {
        this.game.onRefreshConnect();
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
        return this.game.uiManager.getUIStateData(str);
    }

    @Export()
    public startRoomPlay() {
        this.mStartRoomPlay = true;
        Logger.getInstance().debug("peer startroom");
        if (!this.game.roomManager || !this.game.roomManager.currentRoom) {
            Logger.getInstance().log("scene no peer startroom");
            return;
        }
        Logger.getInstance().log("scene has peer startroom");
        this.removeListen();
        this.game.roomManager.currentRoom.startPlay();
    }

    public addListen() {
        this.removeListen();
        Logger.getInstance().log("scene addListen");
        this.game.emitter.on("EnterRoom", this.enterRoomHander, this);
    }

    public removeListen() {
        Logger.getInstance().log("scene removeListen");
        this.game.emitter.off("EnterRoom", this.enterRoomHander, this);
    }

    @Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str])
    public onVerifiedHandler(name: string, idcard: string) {

    }

    @Export()
    public getRoomTransformTo90(p: any) {
        return this.game.roomManager.currentRoom.transformTo90(p);
    }

    @Export()
    public getCurrentRoomSize(): any {
        return this.game.roomManager.currentRoom.roomSize;
    }

    @Export()
    public getCurrentRoomMiniSize(): any {
        return this.game.roomManager.currentRoom.miniSize;
    }

    @Export([webworker_rpc.ParamType.num])
    public getPlayerName(id: number): string {
        const player = <Player>this.game.roomManager.currentRoom.playerManager.get(id);
        return player.nickname;
    }

    @Export()
    public getPlayerAvatar(): any {
        if (this.game.roomManager && this.game.roomManager.currentRoom && this.game.roomManager.currentRoom.playerManager && this.game.roomManager.currentRoom.playerManager.actor) {
            const avatar = this.game.roomManager.currentRoom.playerManager.actor.model.avatar;
            const suits = this.game.roomManager.currentRoom.playerManager.actor.model.suits;
            return { avatar, suits };
        }
        return null;
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public resetGameraSize(width: number, height: number) {
        if (this.game.roomManager && this.game.roomManager.currentRoom && this.game.roomManager.currentRoom.cameraService) this.game.roomManager.currentRoom.cameraService.resetCameraSize(width, height);
    }

    @Export()
    public syncCameraScroll() {
        if (this.game.roomManager && this.game.roomManager.currentRoom && this.game.roomManager.currentRoom.cameraService) {
            Logger.getInstance().debug("mainpeer====synccamerascroll");
            this.game.roomManager.currentRoom.cameraService.syncCameraScroll();
        }
    }

    @Export()
    public sendMouseEvent(id: number, mouseEvent: any[], point3f) {
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
    public displayCompleteMove(id: number) {
        if (!this.game.roomManager.currentRoom) return;
        const element = <Player>this.game.roomManager.currentRoom.playerManager.get(id);
        if (element) element.completeMove();
    }

    @Export()
    public syncPosition(targetPoint) {
        this.game.user.syncPosition();
    }

    @Export([webworker_rpc.ParamType.num])
    public syncElementPosition(id, targetPoint) {
        if (!this.game.roomManager || this.game.roomManager.currentRoom) return;
        const elementManager = this.game.roomManager.currentRoom.elementManager;
        if (!elementManager) return;
        const ele = elementManager.get(id);
        if (!ele) return;
        // ele.syncPosition(targetPoint);
    }

    @Export([webworker_rpc.ParamType.boolean])
    public setSyncDirty(boo: boolean) {
        if (!this.game.roomManager.currentRoom) return;
        this.game.roomManager.currentRoom.cameraService.syncDirty = boo;
    }

    @Export()
    public elementDisplayReady(id: number) {
        if (!this.game) return;
        if (!this.game.roomManager) return;
        if (!this.game.roomManager.currentRoom) return;
        const elementManager = this.game.roomManager.currentRoom.elementManager;
        if (elementManager) elementManager.onDisplayReady(id);
    }

    @Export([webworker_rpc.ParamType.num])
    public elementDisplaySyncReady(id: number) {
        const elementManager = this.game.roomManager.currentRoom.elementManager;
        if (elementManager) elementManager.elementDisplaySyncReady(id);
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

    @Export([webworker_rpc.ParamType.str])
    public getMed(name: string) {
        return this.game.uiManager.getMed(name);
    }

    @Export()
    public elementsShowReferenceArea() {
        const elementManager = this.game.roomManager.currentRoom.elementManager;
        if (elementManager) elementManager.showReferenceArea();
    }

    @Export()
    public elementsHideReferenceArea() {
        const elementManager = this.game.roomManager.currentRoom.elementManager;
        if (elementManager) elementManager.hideReferenceArea();
    }

    @Export([webworker_rpc.ParamType.num])
    public pushMovePoints(id: number, points: any) {
        const elementManager = this.game.roomManager.currentRoom.elementManager;
        if (elementManager) {
            const ele = elementManager.get(id);
            if (ele) ele.startMove(points);
        }
    }

    @Export()
    public onTapHandler(obj: any) {
        // if (this.game.roomManager.currentRoom) this.game.roomManager.currentRoom.move(obj.id, obj.x, obj.y, obj.nodeType);
    }

    @Export()
    public getCurrentRoomType() {
        return this.game.roomManager.currentRoom.sceneType;
    }

    @Export()
    public activePlayer(id: number) {
        const playermgr = this.game.roomManager.currentRoom.playerManager;
        if (playermgr.has(id)) {
            this.game.emitter.emit(EventType.SCENE_INTERACTION_ELEMENT, id);
        }
    }

    @Export([webworker_rpc.ParamType.num])
    public activeSprite(id: number) {
        if (this.game.user) this.game.user.activeSprite(id);
    }

    @Export([webworker_rpc.ParamType.num])
    public getInteractivePosition(id: number) {
        const room = this.game.roomManager.currentRoom;
        if (!room) return;
        const ele = room.getElement(id);
        if (!ele) return;
        return ele.getInteractivePositionList();
    }

    @Export([webworker_rpc.ParamType.boolean])
    public stopSelfMove(stopActive = false) {
        this.game.user.stopMove(undefined, stopActive);
    }

    @Export([webworker_rpc.ParamType.str])
    public stopGuide(id: string) {
        if (this.game.guideWorkerManager) this.game.guideWorkerManager.stopGuide(id);
    }

    @Export()
    public findPath(targets: [], targetId?: number, toReverse: boolean = false) {
        if (this.game.user) this.game.user.findPath(targets, targetId, toReverse);
    }

    @Export()
    public startFireMove(pointer: any) {
        if (this.game.user) this.game.user.startFireMove(pointer);
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
            this.render.getCurTime(this.game.clock.unixTime)
                .then((t) => {
                    resolve(t);
                });
        });
    }

    @Export()
    public showNoticeHandler(text: { msg?: string, i18nMsg?: string, i18nData?: any }) {
        // const data = new op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI();
        // data.text = [{ text, node: undefined }];
        // this.game.showByName(ModuleName.PICANOTICE_NAME, data);
    }

    @Export([webworker_rpc.ParamType.str])
    public showPanelHandler(name: string, data?: any) {
        this.game.showByName(name, data);
    }

    @Export([webworker_rpc.ParamType.num])
    public closePanelHandler(id: number) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_CLOSE_UI);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_CLOSE_UI = packet.content;
        content.uiIds = [id];
        this.game.connection.send(packet);
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

    @Export([webworker_rpc.ParamType.num])
    public fetchProjectionSize(id: number) {
        const room = this.game.roomManager.currentRoom;
        if (!room) {
            return;
        }
        const ele = room.getElement(id);
        if (!ele) {
            return;
        }
        return ele.getProjectionSize();
    }

    @Export()
    public getClockNow() {
        return this.game.clock.unixTime;
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.boolean, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public setPosition(id: number, updateBoo: boolean, x: number, y: number, z?: number) {
        const ele = this.game.roomManager.currentRoom.getElement(id);
        if (ele) {
            ele.setPosition({ x, y, z }, updateBoo);
        }
    }

    // @Export([webworker_rpc.ParamType.num])
    // public removePartMount(id: number, targets?: any, paths?: any) {
    //     const ele: IElement = this.game.roomManager.currentRoom.elementManager.get(id);
    //     if (!ele) return;
    //     ele.removePartMount(targets, paths);
    // }

    @Export()
    public selfStartMove() {
        const user = this.game.user;
        if (user) {
            user.startMove();
        }
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.boolean])
    public tryStopMove(id: number, interactiveBoo: boolean, targetId?: number, stopPos?: any) {
        if (this.game.user) {
            // const room = this.game.roomManager.currentRoom;
            // this.game.user.tryStopMove({ targetId, interactiveBoo: false, stopPos });
            // room.elementManager.checkElementAction(targetId);
            // const needBroadcast = room.elementManager.checkActionNeedBroadcast(targetId);
            // if (interactiveBoo) this.game.user.activeSprite(targetId, undefined, needBroadcast);
        }
    }

    @Export([webworker_rpc.ParamType.num])
    public tryStopElementMove(id: number, points?: any) {
        const ele = this.game.roomManager.currentRoom.elementManager.get(id);
        if (!ele) return;
        ele.stopMove(points);
    }

    @Export([webworker_rpc.ParamType.num])
    public requestPushBox(id: number) {
        this.game.user.requestPushBox(id);
    }

    @Export()
    public async removeMount(id: number, mountID: number, stopPos: IPos) {
        const room = this.game.roomManager.currentRoom;
        if (!room) {
            return Logger.getInstance().error(`room not exist`);
        }
        const ele = room.getElement(id);
        const target = room.getElement(mountID);
        if (!ele || !target) {
            return Logger.getInstance().error(`target not exist`);
        }
        return ele.removeMount(target, stopPos);
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public stopMove(x: number, y: number) {
        this.game.user.stopMove(new LogicPos(x, y));
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

    @Export()
    public setConfig(config: ILauncherConfig) {
        this.mConfig = config;
        this.game.setConfig(config);
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public moveMotion(x: number, y: number) {
        this.game.user.moveMotion(x, y);
    }

    // ==== todo
    public terminate() {
        // this.remote[HEARTBEAT_WORKER].HeartBeatPeer.terminate();
        self.close();
        // super.terminate();
    }

    /**
     * 慎用，super.destroy()会使worker.terminator,致使整个游戏进程关闭
     */
    @Export()
    public destroy() {
        if (this.game) this.game.isDestroy = true;
        super.destroy();
    }

    // ==== config
    public isPlatform_PC() {
        return this.mConfig && this.mConfig.platform && this.mConfig.platform === "pc";
    }

    public clearGame() {
        this.mStartRoomPlay = false;
        this.removeListen();
    }

    protected enterRoomHander() {
        if (!this.mStartRoomPlay) return;
        this.removeListen();
        Logger.getInstance().log("scene getlisten");
        this.game.roomManager.currentRoom.startPlay();
        this.mStartRoomPlay = false;
    }
}
