import { Export, RPCPeer, webworker_rpc } from "webworker-rpc";
import * as protos from "pixelpai_proto";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { Buffer, PBpacket } from "net-socket-packet";
import { ServerAddress } from "../../lib/net/address";
import { Game } from "./game";
import { IPos, Logger, LogicPos, Url } from "utils";
import { EventType, GameState, ILauncherConfig, MAIN_WORKER, ModuleName, RENDER_PEER } from "structure";
import { CheckPlaceResult, PicaGame } from "picaWorker";
import { DataMgrType } from "./data.manager/dataManager";
import { SceneDataManager } from "./data.manager";
import version from "../../version";
import { BaseState } from "./state/base.state";

for (const key in protos) {
    PBpacket.addProtocol(protos[key]);
}

export class MainPeer extends RPCPeer {
    @Export()
    private mGame: Game;
    private mConfig: ILauncherConfig;
    /**
     * 主进程和render之间完全链接成功
     */
    private isReady: boolean = false;
    private delayTime: number = 2000;
    private reConnectCount: number = 0;
    private startDelay: any;
    private isStartUpdateFps: boolean = false;
    private startUpdateFps: any;

    private mTmpTime: number = 0;
    // private isReconnect: boolean = false;
    constructor() {
        super(MAIN_WORKER);
        Logger.getInstance().log("Game version ====>:", `v${version}`);
        this.mGame = new PicaGame(this);
    }

    get config(): ILauncherConfig {
        return this.mConfig;
    }

    get game(): Game {
        return this.mGame;
    }

    get render() {
        return this.remote[RENDER_PEER].Render;
    }

    get physicalPeer() {
        throw new Error("physical has been discarded");
    }

    get state(): BaseState {
        return this.game.gameStateManager.curState;
    }

    // ============= connection调用主进程
    public onConnected(isAuto: boolean) {
        // 告诉主进程链接成功
        this.remote[RENDER_PEER].Render.onConnected(isAuto);
        // 逻辑层game链接成功
        this.game.onConnected(isAuto);
    }

    public onDisConnected(isAuto) {
        // 告诉主进程断开链接
        this.remote[RENDER_PEER].Render.onDisConnected();
        // 逻辑层game关闭链接
        this.game.onDisConnected(isAuto);
    }

    public onConnectError(error: string) {
        // 告诉主进程链接错误
        this.remote[RENDER_PEER].Render.onConnectError(error);
        // 停止心跳
        // this.endBeat();
        this.game.onError();
    }

    public onData(buffer: Buffer) {
        this.game.connection.onData(buffer);
    }

    public workerEmitter(eventType: string, data: any) {
        this.render.workerEmitter(eventType, data);
    }

    // ============= 主进程调用心跳
    @Export()
    public updateFps() {
        if (this.isStartUpdateFps) return;
        this.isStartUpdateFps = true;
        this.startUpdateFps = setInterval(() => {
            this.remote[RENDER_PEER].Render.updateFPS();
        }, 100);
    }

    @Export()
    public endFps() {
        if (this.startUpdateFps) {
            clearInterval(this.startUpdateFps);
            this.startUpdateFps = null;
        }
        // Logger.getInstance().debug("heartBeatWorker endBeat");
        this.remote[RENDER_PEER].Render.endFPS();
    }

    public startBeat() {
    }

    public endBeat() {
        this.reConnectCount = 0;
        if (this.startDelay) {
            clearInterval(this.startDelay);
            this.startDelay = null;
        }
        Logger.getInstance().log("heartBeat end");
        // this.remote[MAIN_WORKER].MainPeer.endHeartBeat();
    }

    @Export()
    public clearBeat() {
        this.reConnectCount = 0;
        // Logger.getInstance().debug("heartBeatWorker clearBeat");
        // this.remote[MAIN_WORKER].MainPeer.clearHeartBeat();
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
        // // ============
        // Logger.getInstance().debug("createGame");
        // // const url: string = "/js/game" + "_v1.0.398";
        // Logger.getInstance().debug("render link onReady");
        // this.game.createGame(this.mConfig);
    }

    @Export()
    public getScaleRatio() {
        return this.game.scaleRatio;
    }

    @Export()
    public updateMoss(moss) {
        this.game.elementStorage.updateMoss(moss);
    }

    @Export()
    public updatePalette(palette) {
        this.game.elementStorage.updatePalette(palette);
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

    @Export([webworker_rpc.ParamType.str])
    public refrehActiveUIState(panel: string) {
        return this.game.uiManager.refrehActiveUIState(panel);
    }

    @Export()
    public startRoomPlay() {
        Logger.getInstance().debug("peer startroom");
        this.game.roomManager.currentRoom.startPlay();
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
        return this.game.roomManager.currentRoom.playerManager.get(id).nickname;
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
    public getDecorateSelectedElementID() {
        if (!this.game.roomManager) return -1;
        if (!this.game.roomManager.currentRoom) return -1;
        if (!this.game.roomManager.currentRoom.isDecorating) return -1;
        if (!this.game.roomManager.currentRoom.decorateManager) return -1;
        return this.game.roomManager.currentRoom.decorateManager.selectedID;
    }

    @Export()
    public decorateSelectElement(id: number) {
        if (!this.game.roomManager) return;
        if (!this.game.roomManager.currentRoom) return;
        if (!this.game.roomManager.currentRoom.isDecorating) return;
        if (!this.game.roomManager.currentRoom.decorateManager) return;
        this.game.roomManager.currentRoom.decorateManager.select(id);
    }

    @Export()
    public decorateMoveElement(id: number, delta: IPos) {
        if (!this.game.roomManager) return;
        if (!this.game.roomManager.currentRoom) return;
        if (!this.game.roomManager.currentRoom.isDecorating) return;
        if (!this.game.roomManager.currentRoom.decorateManager) return;
        this.game.roomManager.currentRoom.decorateManager.moveSelected(id, delta);
    }

    @Export()
    public requestDecorate(id?: number, baseID?: string) {
        if (!this.game.roomManager) return;
        if (!this.game.roomManager.currentRoom) return;
        if (!this.game.roomManager.currentRoom.enableDecorate) return;
        if (this.game.roomManager.currentRoom.isDecorating) return;
        this.game.roomManager.currentRoom.requestDecorate(id, baseID);
    }

    @Export()
    public isElementLocked(id: number) {
        if (!this.game.roomManager) return false;
        if (!this.game.roomManager.currentRoom) return false;
        if (!this.game.roomManager.currentRoom.elementManager) return false;
        const element = this.game.roomManager.currentRoom.elementManager.get(id);
        if (!element) return false;
        return this.game.roomManager.currentRoom.elementManager.isElementLocked(element);
    }

    // 小屋装扮中，输入位置根据element种类，转换为有效位置
    // 墙饰：距离最近的墙面区域位置
    // 立地靠墙家具：距离最近的墙的地面网格坐标
    // 普通家具：自由坐标转换为吸附网格坐标
    @Export()
    public decoratePointerPosToElementPos(id: number, pos: IPos): IPos {
        if (!this.game.roomManager) return null;
        if (!this.game.roomManager.currentRoom) return null;
        if (!this.game.roomManager.currentRoom.isDecorating) return null;
        if (!this.game.roomManager.currentRoom.decorateManager) return null;
        return this.game.roomManager.currentRoom.decorateManager.limitPointerPosition(id, pos);
    }

    // 小屋装扮过程中，更新物件编辑可否放置提示（透明度&碰撞提示区域）
    @Export()
    public updateDecorateElementCanPlaceShow(id: number, x: number, y: number) {
        if (!this.game.roomManager) return;
        if (!this.game.roomManager.currentRoom) return;
        if (!this.game.roomManager.currentRoom.isDecorating) return;
        if (!this.game.roomManager.currentRoom.decorateManager) return;
        if (!this.game.roomManager.currentRoom.elementManager) return;
        const element = this.game.roomManager.currentRoom.elementManager.get(id);
        if (!element) return;
        const checkData = this.game.roomManager.currentRoom.decorateManager.checkCanPlace(id, new LogicPos(x, y));
        element.setAlpha(checkData.canPlace === CheckPlaceResult.CanPlace ? 1 : 0.5);
        element.showRefernceArea(checkData.conflictMap);
    }

    @Export()
    public exitUser() {
        this.game.exitUser();
    }

    @Export([webworker_rpc.ParamType.num])
    public displayCompleteMove(id: number) {
        if (!this.game.roomManager.currentRoom) return;
        const element = this.game.roomManager.currentRoom.playerManager.get(id);
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
    public isCurrentRoomEditEnable(): boolean {
        if (this.game.roomManager && this.game.roomManager.currentRoom) {
            return this.game.roomManager.currentRoom.enableDecorate;
        }
        return false;
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

    @Export([webworker_rpc.ParamType.str])
    public stopGuide(id: string) {
        if (this.game.guideManager) this.game.guideManager.stopGuide(id);
    }

    @Export()
    public startFireMove(pointer: any) {
        if (this.game.user) this.game.user.startFireMove(pointer);
    }

    @Export()
    public findPath(targets: [], targetId?: number, toReverse: boolean = false) {
        if (this.game.user) this.game.user.findPath(targets, targetId, toReverse);
    }

    @Export([webworker_rpc.ParamType.num])
    public getInteractivePosition(id: number) {
        const room = this.game.roomManager.currentRoom;
        if (!room) return;
        const ele = room.getElement(id);
        if (!ele) return;
        return ele.getInteractivePositionList();
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
        const mgr = this.game.dataManager.getDataMgr<SceneDataManager>(DataMgrType.SceneMgr);
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

    @Export([])
    public stopSelfMove() {
        // const ele = this.game.roomManager.currentRoom.getElement(id);
        // if (ele) {
        //     ele.stopMove();
        // }
        this.game.user.stopMove();
    }

    @Export([webworker_rpc.ParamType.str])
    public uploadHeadImage(url: string) {
        this.game.httpService.uploadHeadImage(url).then(() => {
            this.game.emitter.emit("updateDetail");
        });
    }

    @Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str, webworker_rpc.ParamType.str])
    public uploadDBTexture(key: string, url: string, json: string): Promise<any> {
        return this.game.httpService.uploadDBTexture(key, url, json);
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
}

const context: MainPeer = new MainPeer();
