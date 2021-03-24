import { RPCPeer, Export, webworker_rpc } from "webworker-rpc";
import { op_gateway, op_virtual_world, op_client } from "pixelpai_proto";
import { PBpacket, Buffer } from "net-socket-packet";
import * as protos from "pixelpai_proto";
import { ServerAddress } from "../../lib/net/address";
import { Game } from "./game";
import { IPos, Logger, LogicPoint } from "utils";
import { ILauncherConfig, MAIN_WORKER, RENDER_PEER, ModuleName, EventType, PHYSICAL_WORKER, PHYSICAL_WORKER_URL, GameState } from "structure";
import { PicaGame } from "picaWorker";
import { DataMgrType } from "./data.manager/dataManager";
import { SceneDataManager } from "./data.manager";
import version from "../../version";

for (const key in protos) {
    PBpacket.addProtocol(protos[key]);
}

export class MainPeer extends RPCPeer {
    private gameState;
    private stateTime: number = 0;
    @Export()
    private game: Game;
    private mConfig: ILauncherConfig;
    /**
     * 主进程和render之间完全链接成功
     */
    private isReady: boolean = false;
    private mPhysicalPeer: any;
    private delayTime: number = 15000;
    private reConnectCount: number = 0;
    private startDelay: any;
    private isStartUpdateFps: boolean = false;
    private startUpdateFps: any;
    // private isReconnect: boolean = false;
    constructor() {
        super(MAIN_WORKER);
        Logger.getInstance().log("Game version ====>:", `v${version}`);
        this.game = new PicaGame(this);
        this.stateTime = new Date().getTime();
    }

    get render() {
        return this.remote[RENDER_PEER].Render;
    }

    get physicalPeer() {
        return this.remote[PHYSICAL_WORKER].PhysicalPeer;
    }

    // get heartBeatPeer() {
    //     return this.remote[HEARTBEAT_WORKER].HeartBeatPeer;
    // }

    set state(val) {
        const now: number = new Date().getTime();
        Logger.getInstance().log("gameState: ====>", val, "delayTime:=====>", now - this.stateTime);
        this.gameState = val;
        this.stateTime = now;
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
        Logger.getInstance().log("heartBeat start");
        if (this.startDelay) return;
        this.startDelay = setInterval(() => {
            Logger.getInstance().log("heartBeat request");
            if (this.reConnectCount >= 8) {
                Logger.getInstance().log("reconnect ====>");
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
        // this.remote[MAIN_WORKER].MainPeer.endHeartBeat();
    }

    @Export()
    public clearBeat() {
        Logger.getInstance().log("heartBeat get");
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
        this.state = GameState.LinkWorker;
        // ============
        Logger.getInstance().debug("createGame");
        // const url: string = "/js/game" + "_v1.0.398";
        Logger.getInstance().debug("render link onReady");
        this.game.createGame(this.mConfig);
        this.linkTo(PHYSICAL_WORKER, PHYSICAL_WORKER_URL).onceReady(() => {
            this.mPhysicalPeer = this.remote[PHYSICAL_WORKER].PhysicalPeer;
            Logger.getInstance().debug("Physcialworker onReady");
            // this.linkTo(HEARTBEAT_WORKER, HEARTBEAT_WORKER_URL).onceReady(() => {
            //     Logger.getInstance().debug("heartBeatworker onReady in mainworker");
            // });
        });
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

    // @Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.num, webworker_rpc.ParamType.boolean])
    public startConnect(host: string, port: number, secure?: boolean) {
        const addr: ServerAddress = { host, port, secure };
        this.game.connection.startConnect(addr);
        this.state = GameState.StartConnect;
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
        Logger.getInstance().debug("peer startroom");
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

    @Export()
    public exitUser() {
        this.game.exitUser();
    }

    // @Export([webworker_rpc.ParamType.num])
    // public displayStartMove(id: number) {
    //     if (!this.game.roomManager.currentRoom) return;
    //     const element = this.game.roomManager.currentRoom.playerManager.get(id);
    //     if (element) element.startMove();
    // }

    @Export([webworker_rpc.ParamType.num])
    public displayCompleteMove(id: number) {
        if (!this.game.roomManager.currentRoom) return;
        const element = this.game.roomManager.currentRoom.playerManager.get(id);
        if (element) element.completeMove();
    }

    // @Export([webworker_rpc.ParamType.num])
    // public displayStopMove(id: number) {
    //     if (!this.game.roomManager.currentRoom) return;
    //     const element = this.game.roomManager.currentRoom.playerManager.get(id);
    //     if (element) element.stopMove();
    // }

    @Export()
    public syncPosition(targetPoint) {
        this.game.user.syncPosition(targetPoint);
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

    // ============= 心跳调用主进程
    // @Export()
    // public startHeartBeat() {
    //     // ==========同步心跳
    //     const pkt: PBpacket = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_GATEWAY_PING);
    //     this.game.socket.send(pkt.Serialization());
    // }

    // @Export()
    // public endHeartBeat() {

    // }

    // @Export()
    // public clearHeartBeat() {

    // }

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

    // display data getter
    @Export()
    public framesModel_getAnimations(id: number, name: string): any {// IAnimationData
        return null;
    }

    @Export()
    public framesModel_getCollisionArea(id: number): number[][] {
        return null;
    }

    @Export()
    public framesModel_getOriginPoint(id: number): LogicPoint {
        return null;
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
            const room = this.game.roomManager.currentRoom;
            this.game.user.tryStopMove({ targetId, interactiveBoo: false, stopPos });
            const needBroadcast = room.elementManager.checkElementAction(targetId);
            if (interactiveBoo) this.game.user.activeSprite(targetId, undefined, needBroadcast);
        }
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

    // @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    // public findPath(x: number, y: number, targets: [], targetId?: number, toReverse: boolean = false) {
    //     this.game.user.findPath(x, y, targets, targetId, toReverse);
    // }

    // @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    // public moveMotion(x: number, y: number, targetId?: number) {
    //     this.game.user.moveMotion(x, y, targetId);
    // }

    @Export([webworker_rpc.ParamType.num])
    public stopMove(id: number) {
        const ele = this.game.roomManager.currentRoom.getElement(id);
        if (ele) {
            ele.stopMove();
        }
    }

    // @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    // public tryMove(px, py, npx, npy) {
    //     this.game.roomManager.currentRoom.tryMove(px, py, npx, npy);
    // }

    // @Export([webworker_rpc.ParamType.num])
    // public getInteractivePosition(id: number) {
    //     const ele = this.game.roomManager.currentRoom.getElement(id);
    //     if (ele) {
    //         return ele.getInteractivePositionList();
    //     }
    //     return null;
    // }

    // @Export([webworker_rpc.ParamType.num])
    // public disableBlock(id: number) {
    //     const ele = this.game.roomManager.currentRoom.getElement(id);
    //     if (ele) {
    //         ele.disableBlock();
    //     }
    // }

    // @Export([webworker_rpc.ParamType.num])
    // public enableBlock(id: number) {
    //     const ele = this.game.roomManager.currentRoom.getElement(id);
    //     if (ele) {
    //         ele.enableBlock();
    //     }
    // }

    @Export([webworker_rpc.ParamType.str])
    public uploadHeadImage(url: string) {
        this.game.httpService.uploadHeadImage(url).then(() => {
            this.game.emitter.emit("updateDetail");
        });
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
        // this.remote[HEARTBEAT_WORKER].HeartBeatPeer.destroy();
    }

    // ==== config
    public isPlatform_PC() {
        return this.mConfig && this.mConfig.platform && this.mConfig.platform === "pc";
    }
}
const context: MainPeer = new MainPeer();
