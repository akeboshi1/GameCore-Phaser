import { UIManager } from "./ui/ui.manager";
import { PBpacket, PacketHandler } from "net-socket-packet";
import { MainPeer } from "./main.peer";
import { op_def, op_client, op_virtual_world, op_gateway } from "pixelpai_proto";
import { load, HttpLoadManager } from "utils";
import { Connection, GameSocket } from "./net/connection";
import { Clock, ClockReadyListener } from "./loop/clock/clock";
import { HttpClock } from "./loop/httpClock/http.clock";
import { HttpService } from "./loop/httpClock/http.service";
import { LoadingManager } from "./loading/loading.manager";
import { ChatCommandInterface, ConnectionService, EventDispatcher, GameState, IConfigPath, IConnectListener, ILauncherConfig, LoadState, Logger } from "structure";
import { RoomManager } from "./room/room.manager";
import { User } from "./actor/user";
import { NetworkManager } from "./command";
import { ConfigPath } from "./config/config/config";
import { ElementStorage } from "baseGame";
import { BaseDataControlManager, DataMgrType } from "./config";
import { GuideWorkerManager } from "./guide.manager";
import { SoundWorkerManager } from "./sound.manager";
import { IRoomService } from "./room";
import { GameStateManager } from "./state/game.state.manager";
interface ISize {
    width: number;
    height: number;
}

export const fps: number = 30;
export const interval = fps > 0 ? 1000 / fps : 1000 / 30;
export class Game extends PacketHandler implements IConnectListener, ClockReadyListener, ChatCommandInterface {
    public isDestroy: boolean = false;
    public isAuto: boolean = true;
    protected mainPeer: MainPeer;
    protected connect: ConnectionService;
    protected mUser: User;
    protected mSize: ISize;
    protected mClock: Clock;
    protected mHttpClock: HttpClock;
    protected mHttpService: HttpService;
    protected mConfig: ILauncherConfig;
    protected mDataControlManager: BaseDataControlManager;
    protected mGuideWorkerManager: GuideWorkerManager;
    protected mRoomManager: RoomManager;
    protected mElementStorage: ElementStorage;
    protected mUIManager: UIManager;
    protected mSoundManager: SoundWorkerManager;
    protected mLoadingManager: LoadingManager;
    // protected mConfigManager: BaseConfigManager;
    protected mNetWorkManager: NetworkManager;
    protected mHttpLoadManager: HttpLoadManager;
    // ?????????????????????
    protected mGameStateManager: GameStateManager;

    protected mGameConfigUrls: Map<string, string> = new Map();
    protected curSceneConfigUrl: string;
    protected mGameConfigUrl: string;
    protected mGameConfigState: Map<string, boolean> = new Map();
    protected isPause: boolean = false;
    /**
     * ??????????????????
     */
    protected mDebugReconnect: boolean = true;
    protected mMoveStyle: number;
    protected mReconnect: number = 0;
    protected hasClear: boolean = false;
    protected currentTime: number = 0;
    protected mHeartBeat: any;
    protected mHeartBeatDelay: number = 1000;
    protected mAvatarType: op_def.AvatarStyle;
    protected mRunning: boolean = true;
    protected remoteIndex = 0;
    protected isSyncPackage: boolean = false;
    protected mConfigPath: IConfigPath;
    constructor(peer: MainPeer) {
        super();
        this.mainPeer = peer;
        this.boot();
    }

    public setConfigPath(path: any) {
        this.mConfigPath = {
            notice_url: path.notice_url
        };
    }

    /**
     * ?????????
     * @param config
     */
    init(config: ILauncherConfig) {
        this.mGameStateManager.state = GameState.Init;
        this.mGameStateManager.startRun(config);
    }

    /**
     * ??????
     */
    login() {
        this.mGameStateManager.state = GameState.Login;
        this.mGameStateManager.startRun();
    }

    /**
     * ????????????
     */
    startConnect() {
        this.mGameStateManager.refreshStateTime();
        this.mGameStateManager.state = GameState.Connecting;
        this.mGameStateManager.startRun();
    }

    /**
     * ????????????
     * @param isAuto
     */
    onConnected(isAuto?: boolean) {
        this.mGameStateManager.update(isAuto);
    }

    /**
     * ??????????????????
     */
    async loginEnterWorld() {
        this.mGameStateManager.state = GameState.EnterWorld;
        this.mGameStateManager.startRun();
    }

    v() {
        this.debugReconnect = true;
    }
    q() {
        this.debugReconnect = false;
    }

    public addPacketListener() {
        if (this.connect) this.connect.addPacketListener(this);
    }

    public removePacketListener() {
        if (this.connect) this.connect.removePacketListener(this);
    }

    public async createGame(config?: ILauncherConfig) {
        this.setConfig(config);
        await this.initWorld();
        this.hasClear = false;
    }

    public setConfig(config: ILauncherConfig) {
        this.mConfig = config;
        if (config.config_root) {
            ConfigPath.ROOT_PATH = config.config_root;
            this.debugReconnect = config.debugReconnect;
        }
    }

    public showLoading(data?: any) {
        this.mainPeer.render.showLoading(data);
    }

    public onDisConnected(isAuto?: boolean) {
        if (!this.debugReconnect) return;
        // ??????socket?????????????????????????????????????????????????????????????????????????????????????????????????????????
        const stateKey = this.peer.state.key;
        if (stateKey === GameState.ChangeGame || stateKey === GameState.OffLine) return;
        Logger.getInstance().debug("app connectFail=====");
        this.isAuto = isAuto;
        if (!this.isAuto) return;
        if (this.mConfig.hasConnectFail) {
            return this.mainPeer.render.connectFail();
        } else {
            this.renderPeer.showAlert("????????????????????????????????????", true, false).then(() => {
                // const mediator = this.uiManager.getMed(ModuleName.PICA_BOOT_NAME);
                // if (mediator && mediator.isShow()) {
                //     mediator.show();
                // } else {
                //     this.renderPeer.hidden();
                // }
                this.renderPeer.hidden();
            });
        }
    }

    public onRefreshConnect(isAuto?: boolean) {
        this.isAuto = isAuto;
        if (!this.isAuto) return;
        // if (this.hasClear || this.isPause) return;
        Logger.getInstance().debug("game onrefreshconnect");
        if (this.mConfig.hasConnectFail) {
            Logger.getInstance().debug("app connectfail");
            this.onError();
        } else {
            this.clearGame().then(() => {
                Logger.getInstance().debug("clearGame");
                this.createGame(this.mConfig);
            });
        }
    }

    public onError(): void {
        if (!this.isAuto) return;
        Logger.getInstance().debug("socket error");
        if (this.mReconnect > 2) {
            // todo reconnect scene
            return;
        }
        if (!this.connect.connect) {
            if (this.mConfig.hasConnectFail) {
                Logger.getInstance().debug("app connectFail");
                return this.mainPeer.render.connectFail();
            } else {
                Logger.getInstance().debug("reconnect");
                this.reconnect();
            }
        }
    }

    public async reconnect() {
        if (!this.isAuto) return;
        // if (this.hasClear || this.isPause) return;
        this.manualReconnect();
    }

    public async manualReconnect() {
        if (!this.debugReconnect) return;
        Logger.getInstance().debug("game reconnect");
        if (this.mConfig.hasConnectFail) return this.mainPeer.render.connectFail();
        let gameID: string = this.mConfig.game_id;
        let virtualWorldId: string = this.mConfig.virtual_world_id;
        const worldId: string = this.mConfig.world_id;
        const account = await this.mainPeer.render.getAccount();
        if (account.gameID && account.virtualWorldId) {
            gameID = account.gameID;
            virtualWorldId = account.virtualWorldId;
        }
        this._createAnotherGame(gameID, virtualWorldId, null, null, null, worldId);
    }

    public exitUser() {
        this.mConfig.token_expire = this.mConfig.token_fingerprint = this.mConfig.user_id = this.mConfig.auth_token = null;
        this.renderPeer.destroyAccount().then(() => {
            this._createAnotherGame(this.mConfig.game_id, this.mConfig.virtual_world_id, null, null);
        });
    }

    public onClientErrorHandler(packet: PBpacket): void {
        const content: op_client.IOP_GATEWAY_RES_CLIENT_ERROR = packet.content;
        switch (content.responseStatus) {
            case op_def.ResponseStatus.REQUEST_UNAUTHORIZED:
                // ???????????????
                this.renderPeer.showAlert("??????????????????????????????", true, false)
                    .then(() => {
                        this.renderPeer.hidden();
                    });
                break;
        }
        // ???????????????????????????
        const errorLevel = content.errorLevel;
        const msg = content.msg;
        // ??????phaser????????????????????????phaser?????????ui?????????ui
        if (errorLevel >= op_def.ErrorLevel.SERVICE_GATEWAY_ERROR && this.debugReconnect) {
            let str: string = msg;
            if (msg.length > 100) str = msg.slice(0, 99);
            this.renderPeer.showAlert(str, true, false).then(() => {
                // ??????????????????
                // this.manualReconnect();
            });
        } else {
            // ???????????????
            // this.renderPeer.showErrorMsg(msg);
        }
        Logger.getInstance().log(`Remote Trace[${content.responseStatus}]: ${msg}`);
    }

    public destroyClock() {
        if (this.mClock) {
            this.mClock.destroy();
            this.mClock = null;
        }
    }

    /**
     * todo
     * ??????????????????????????????????????????pi
     * @returns
     */
    public loadTotalSceneConfig() {
        if (!this.gameConfigUrls) return;
        this.gameConfigUrls.forEach((remotePath) => {
            if (!this.mGameConfigState.get(remotePath)) {
                const url = ConfigPath.getSceneConfigUrl(remotePath);
                return load(url, "arraybuffer").then((req: any) => {
                    Logger.getInstance().debug("start decodeConfig");
                }, (reason) => {
                    Logger.getInstance().error("reload res ====>", reason, "reload count ====>", this.remoteIndex);
                });
            }
        });
    }

    public clearGameComplete() {
        this.initWorld();
    }

    public setSize(width, height) {
        this.mSize = {
            width,
            height
        };
    }
    public getSize(): ISize {
        return this.mSize;
    }
    public setGameConfig(config: any) {
        this.mConfig = config;
    }
    public getGameConfig(): ILauncherConfig {
        return this.mConfig;
    }
    public getDataMgr<T>(type: DataMgrType) {
        return !this.dataControlManager ? null : this.dataControlManager.getDataMgr<T>(type);
    }
    public clearClock() {
        if (this.mClock) {
            this.mClock.destroy();
            this.mClock = null;
        }
        this.mClock = new Clock(this.connect, this.mainPeer, this);
    }

    public roomResume(roomID: number) {
        this.mainPeer.render.roomResume(roomID);
    }

    public roomPause(roomID: number) {
        this.mainPeer.render.roomPause(roomID);
    }

    public setCamerasBounds(x: number, y: number, width: number, height: number) {
        this.mainPeer.render.setCamerasBounds(x, y, width, height);
    }

    public getConfigUrl(sceneId: string) {
        return this.gameConfigUrls.get(sceneId);
    }

    public setCurSceneConfigUrl(val) {
        this.curSceneConfigUrl = val;
    }

    public getCurSceneConfigUrl() {
        return this.curSceneConfigUrl;
    }

    onClockReady(): void {
        this.mainPeer.render.onClockReady();
    }

    syncClock(times: number = 1) {
        this.mClock.sync(times);
    }

    set moveStyle(moveStyle: number) {
        this.mMoveStyle = moveStyle;
        this.mainPeer.render.setMoveStyle(moveStyle);
    }

    get moveStyle(): number {
        return this.mMoveStyle;
    }

    get scaleRatio(): number {
        return this.mConfig.scale_ratio;
    }

    get debugReconnect(): boolean {
        return this.mDebugReconnect;
    }

    set debugReconnect(val) {
        this.mDebugReconnect = val;
    }

    get httpService(): HttpService {
        return this.mHttpService;
    }

    get peer(): MainPeer {
        return this.mainPeer;
    }

    get connection(): ConnectionService {
        return this.connect;
    }

    get socket(): GameSocket {
        return this.connect.socket as GameSocket;
    }

    get uiManager(): UIManager {
        return this.mUIManager;
    }

    get soundManager(): SoundWorkerManager {
        return this.mSoundManager;
    }

    get clock(): Clock {
        return this.mClock;
    }

    set clock(val) {
        this.mClock = val;
    }

    get httpClock(): HttpClock {
        return this.mHttpClock;
    }

    set httpClock(val) {
        this.mHttpClock = val;
    }

    get elementStorage(): ElementStorage {
        return this.mElementStorage;
    }

    get roomManager(): RoomManager {
        return this.mRoomManager;
    }

    get guideWorkerManager(): GuideWorkerManager {
        return this.mGuideWorkerManager;
    }

    get loadingManager(): LoadingManager {
        return this.mLoadingManager;
    }

    get dataControlManager(): BaseDataControlManager {
        return this.mDataControlManager;
    }
    get gameConfigUrl(): string {
        return this.mGameConfigUrl;
    }

    set gameConfigUrl(val) {
        this.mGameConfigUrl = val;
    }

    get gameConfigUrls(): Map<string, string> {
        return this.mGameConfigUrls;
    }

    get gameConfigState(): Map<string, boolean> {
        return this.mGameConfigState;
    }

    get httpLoaderManager() {
        return this.mHttpLoadManager;
    }
    get emitter(): EventDispatcher {
        if (!this.mDataControlManager) return undefined;
        return this.mDataControlManager.emitter;
    }

    get user() {
        return this.mUser;
    }

    get renderPeer() {
        const render = this.peer.render;
        if (!render) {
            throw new Error("can't find render");
        }
        return render;
    }

    get gameStateManager(): GameStateManager {
        return this.mGameStateManager;
    }

    get avatarType() {
        return this.mAvatarType;
    }

    public onFocus() {
        // if (this.mHeartBeat) clearInterval(this.mHeartBeat);
        this.mRunning = true;
        this.connect.onFocus();
        if (this.connection) {
            if (!this.connection.connect) {
                if (this.mConfig.hasConnectFail) {
                    return this.mainPeer.render.connectFail();
                } else {
                    return this.onDisConnected();
                }
            }
            const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS);
            const context: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS = pkt.content;
            context.gameStatus = op_def.GameStatus.Focus;
            this.connection.send(pkt);
            // ????????????
            this.mClock.sync(-1);
        } else {
            Logger.getInstance().error("connection is undefined");
            return this.onDisConnected();
        }
    }

    public onBlur() {
        this.currentTime = 0;
        // if (this.mHeartBeat) clearInterval(this.mHeartBeat);
        this.mRunning = false;
        this.connect.onBlur();
        Logger.getInstance().debug("#BlackSceneFromBackground; world.onBlur()");
        if (this.connection) {
            const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS);
            const context: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS = pkt.content;
            context.gameStatus = op_def.GameStatus.Blur;
            this.connection.send(pkt);
        } else {
            Logger.getInstance().error("connection is undefined");
        }
    }

    public async refreshToken() {
        const token = await this.peer.render.getLocalStorage("token");
        const account = token ? JSON.parse(token) : null;
        if (!account || !account.accessToken) {
            this.login();
            return;
        }
        this.httpService.refreshToekn(account.refreshToken, account.accessToken)
            .then((response: any) => {
                if (response.code === 200) {
                    this.peer.render.refreshAccount(response);
                    this.loginEnterWorld();
                } else {
                    this.login();
                }
            }).catch((error) => {
                Logger.getInstance().error("refreshToken:", error);
                this.login();
            });
        // });
    }

    public leaveRoom(room: IRoomService) {

    }

    public showByName(name: string, data?: any) {

    }

    public showMediator(name: string, isShow: boolean, param?: any) {
        if (!this.mUIManager) return;
        if (isShow) {
            this.mUIManager.showMed(name, param);
        } else {
            this.mUIManager.hideMed(name);
        }
    }

    public hideMediator(name) {
        if (!this.mUIManager) return;
        this.mUIManager.hideMed(name);
    }

    /**
     * ????????????json??????
     * @param name
     */
    public loadJson() {
        this.mLoadingManager.start(LoadState.LOADJSON);
    }

    public preloadGameConfig(): Promise<any> {
        return undefined;
    }

    protected async initWorld() {
        this.createUser();
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_ERROR, this.onClientErrorHandler);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SELECT_CHARACTER, this.onSelectCharacter);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_GOTO_ANOTHER_GAME, this.onGotoAnotherGame);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_PING, this.onClientPingHandler);
        // this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_PONG, this.heartBeatCallBack);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_GAME_MODE, this.onAvatarGameModeHandler);
        this.createManager();
        const gameID = this.mConfig.game_id;
        const worldId = this.mConfig.virtual_world_id;
        if (typeof gameID !== "string") {
            Logger.getInstance().error("gameID is not string");
        }
        if (typeof worldId !== "string") {
            Logger.getInstance().error("worldId is not string");
        }
        await this.mainPeer.render.createAccount(this.mConfig.game_id + "", this.mConfig.virtual_world_id + "");
    }

    protected createUser() {
        this.mUser = new User();
    }

    protected async createManager() {
        if (!this.mRoomManager) this.mRoomManager = new RoomManager(this);
        if (!this.mGuideWorkerManager) this.mGuideWorkerManager = new GuideWorkerManager(this);
        if (!this.mUIManager) this.mUIManager = new UIManager(this);
        if (!this.mHttpService) this.mHttpService = new HttpService(this);
        if (!this.mSoundManager) this.mSoundManager = new SoundWorkerManager(this);
        if (!this.mLoadingManager) this.mLoadingManager = new LoadingManager(this);
        if (!this.mDataControlManager) this.mDataControlManager = new BaseDataControlManager(this);
        // if (!this.mConfigManager) this.mConfigManager = new BaseConfigManager(this);
        if (!this.mNetWorkManager) this.mNetWorkManager = new NetworkManager(this);
        if (!this.mHttpLoadManager) this.mHttpLoadManager = new HttpLoadManager();
        // this.mPlayerDataManager = new PlayerDataManager(this);

        this.mUIManager.addPackListener();
        this.mRoomManager.addPackListener();
        this.mGuideWorkerManager.addPackListener();
        this.user.addPackListener();
        this.mSoundManager.addPackListener();
        // this.mPlayerDataManager.addPackListener();
        // this.mUiManager = new UiManager(this);
        const resPath = await this.renderPeer.getResPath();
        const osdPath = await this.renderPeer.getOsdPath();
        this.mElementStorage = new ElementStorage({ resPath, osdPath });
        this.peer.addListen();
    }
    protected onClearGame() {

    }

    protected boot() {
        this.connect = new Connection(this.peer);
        this.addPacketListener();
        if (!this.mGameStateManager) this.mGameStateManager = new GameStateManager(this.peer);
        this.update(new Date().getTime());
    }

    protected onSelectCharacter() {
        const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_CHARACTER_CREATED);
        this.mainPeer.send(pkt.Serialization());
        this.renderPeer.getI18nLanguages().then((language) => {
            const i18Packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SET_LOCALE);
            const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_SET_LOCALE = i18Packet.content;
            content.localeCode = language[0];
            this.mainPeer.send(i18Packet.Serialization());
        });
    }
    protected onGotoAnotherGame(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_GOTO_ANOTHER_GAME = packet.content;
        this._onGotoAnotherGame(content.gameId, content.virtualWorldId, content.sceneId, content.loc, content.spawnPointId, content.worldId);
    }

    protected onAvatarGameModeHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_GAME_MODE = packet.content;
        this.mAvatarType = content.avatarStyle;
    }

    protected update(current: number = 0, delta: number = 0) {
        if (this.isDestroy) return;
        this._run(current, delta);

        const now: number = new Date().getTime();
        const run_time: number = now - current;

        if (run_time >= interval) {
            // I am late.
            Logger.getInstance().info(`Update late.  run_time: ${run_time} `);
            this.update(now, run_time);
        } else {
            // Logger.getInstance().info(`${interval - run_time}`);
            setTimeout(() => {
                const when: number = new Date().getTime();
                this.update(when, when - now);

            }, interval - run_time);
        }
    }

    protected clearGame(bool: boolean = false): Promise<void> {
        return new Promise((resolve, reject) => {
            this.renderPeer.clearGame(bool).then(() => {
                this.isAuto = true;
                if (this.peer) this.peer.clearGame();
                if (this.mClock) {
                    this.mClock.destroy();
                    this.mClock = null;
                }
                if (this.mRoomManager) {
                    this.mRoomManager.destroy();
                    this.mRoomManager = null;
                }
                if (this.mGuideWorkerManager) {
                    this.mGuideWorkerManager.destroy();
                    this.mGuideWorkerManager = null;
                }
                if (this.mUIManager) {
                    this.mUIManager.destroy();
                    this.mUIManager = null;
                }
                if (this.mElementStorage) {
                    this.mElementStorage.destroy();
                    this.mElementStorage = null;
                }
                if (this.mLoadingManager) {
                    this.mLoadingManager.destroy();
                    this.mLoadingManager = null;
                }
                if (this.mNetWorkManager) {
                    this.mNetWorkManager.destory();
                    this.mNetWorkManager = null;
                }
                if (this.mHttpLoadManager) {
                    this.mHttpLoadManager.destroy();
                    this.mHttpLoadManager = null;
                }
                if (this.mDataControlManager) {
                    this.mDataControlManager.clear();
                    this.mDataControlManager = null;
                }
                if (this.mSoundManager) {
                    this.mSoundManager.destroy();
                    this.mSoundManager = null;
                }
                if (this.user) this.user.removePackListener();
                // this.peer.destroy();
                this.hasClear = true;
                this.onClearGame();
                resolve();
            });
        });
    }

    private _createAnotherGame(gameId, virtualworldId, sceneId, loc, spawnPointId?, worldId?) {
        this.mGameStateManager.startState(GameState.ChangeGame);
        this.clearGame(true).then(() => {
            this.isPause = false;
            if (this.mUser) {
                this.mUser.clear();
            }
            if (this.mClock) {
                this.mClock.destroy();
                this.mClock = null;
            }
            if (this.connect) {
                this.removePacketListener();
                this.connect.closeConnect(() => {
                    this.initConnect(gameId, virtualworldId, sceneId, loc, spawnPointId, worldId);
                });
            } else {
                this.initConnect(gameId, virtualworldId, sceneId, loc, spawnPointId, worldId);
            }
        });
    }

    private initConnect(gameId, virtualworldId, sceneId, loc, spawnPointId?, worldId?) {
        this.createUser();
        this.createManager();
        this.addPacketListener();
        this.startConnect();
        // TODO createAccount createAnotherGame?????????????????????
        this.mainPeer.render.createAccount(gameId, virtualworldId, sceneId, loc, spawnPointId);
        this.mClock = new Clock(this.connect, this.peer);
        this.mainPeer.render.createAnotherGame(gameId, virtualworldId, sceneId, loc ? loc.x : 0, loc ? loc.y : 0, loc ? loc.z : 0, spawnPointId, worldId);
    }

    private _onGotoAnotherGame(gameId, virtualworldId, sceneId, loc, spawnPointId?, worldId?) {
        this.mGameStateManager.startState(GameState.ChangeGame);
        this.clearGame(true).then(() => {
            this.isPause = false;
            if (this.mClock) {
                this.mClock.destroy();
                this.mClock = null;
            }
            if (this.connect) {
                this.removePacketListener();
                this.connect.closeConnect(() => {
                    this.initConnect(gameId, virtualworldId, sceneId, loc, spawnPointId, worldId);
                });
            } else {
                this.initConnect(gameId, virtualworldId, sceneId, loc, spawnPointId, worldId);
            }
        });
    }

    private onClientPingHandler(packet: PBpacket) {
        this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_RES_VIRTUAL_WORLD_PONG));
    }

    private _run(current: number, delta: number) {
        if (!this.mRunning) return;
        // Logger.getInstance.log(`_run at ${current} + delta: ${delta}`);

        // TODO do something here.
        if (this.connect) this.connect.update();
        if (this.mRoomManager) this.mRoomManager.update(current, delta);
        if (this.mHttpLoadManager) this.mHttpLoadManager.update(current, delta);
    }
}
