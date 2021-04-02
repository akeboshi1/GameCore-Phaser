import { UIManager } from "./ui/ui.manager";
import { PBpacket, PacketHandler } from "net-socket-packet";
import { MainPeer } from "./main.peer";
import { op_def, op_client, op_virtual_world, op_gateway } from "pixelpai_proto";
import { Lite } from "game-capsule";
import { ConnectionService } from "../../lib/net/connection.service";
import { IConnectListener, SocketConnection } from "../../lib/net/socket";
import { Logger, ResUtils, Tool, load, EventDispatcher, Handler } from "utils";
import IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = op_gateway.IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT;
import { Connection, GameSocket } from "./net/connection";
import { Clock, ClockReadyListener } from "./loop/clock/clock";
import { HttpClock } from "./loop/httpClock/http.clock";
import { HttpService } from "./loop/httpClock/http.service";
import { LoadingManager } from "./loading/loading.manager";
import { GameState, ILauncherConfig, LoadState, MAIN_WORKER, RENDER_PEER, PHYSICAL_WORKER, ModuleName } from "structure";
import { ServerAddress } from "../../lib/net/address";
import { IRoomService } from "./room/room/room";
import { ElementStorage } from "../base/model/elementstorage/element.storage";
import { RoomManager } from "./room/room.manager";
import { User } from "./actor/user";
import { DataManager, DataMgrType } from "./data.manager/dataManager";
import { BaseConfigManager } from "./data.manager";
import { NetworkManager } from "./command";
import version from "../../version";
import { SoundManager } from "./sound.manager";
import { GuideManager } from "./guide.manager/guide.manager";
interface ISize {
    width: number;
    height: number;
}

export const fps: number = 45;
export const interval = fps > 0 ? 1000 / fps : 1000 / 30;
export class Game extends PacketHandler implements IConnectListener, ClockReadyListener {
    public isDestroy: boolean = false;
    protected mainPeer: MainPeer;
    protected connect: ConnectionService;
    protected mUser: User;
    // protected mUiManager: UiManager;
    // protected mMoveStyle: number = -1;
    protected mSize: ISize;
    protected mClock: Clock;
    protected mHttpClock: HttpClock;
    protected mHttpService: HttpService;
    protected mConfig: ILauncherConfig;
    protected mDataManager: DataManager;
    protected mGuideManager: GuideManager;
    // protected mAccount: Account;
    protected mRoomManager: RoomManager;
    protected mElementStorage: ElementStorage;
    // protected mPlayerDataManager: PlayerDataManager;
    protected mUIManager: UIManager;
    protected mSoundManager: SoundManager;
    protected mLoadingManager: LoadingManager;
    protected mConfigManager: BaseConfigManager;
    protected mNetWorkManager: NetworkManager;

    protected gameConfigUrls: Map<string, string> = new Map();
    protected gameConfigUrl: string;
    protected isPause: boolean = false;
    protected isAuto: boolean = true;
    protected mMoveStyle: number;
    protected mReconnect: number = 0;
    protected hasClear: boolean = false;
    protected currentTime: number = 0;
    protected mWorkerLoop: any;
    protected mAvatarType: op_def.AvatarStyle;
    protected mRunning: boolean = true;
    constructor(peer: MainPeer) {
        super();
        this.mainPeer = peer;
        this.connect = new Connection(peer);
        this.addPacketListener();
        this.update(new Date().getTime());
    }

    public addPacketListener() {
        if (this.connect) this.connect.addPacketListener(this);
    }

    public removePacketListener() {
        if (this.connect) this.connect.removePacketListener(this);
    }

    get scaleRatio(): number {
        return this.mConfig.scale_ratio;
    }

    public async createGame(config?: ILauncherConfig) {
        this.mConfig = config;
        await this.initWorld();
        this.peer.state = GameState.InitWorld;
        this.initGame();
        this.hasClear = false;
        this.login();
    }

    public setConfig(config: ILauncherConfig) {
        this.mConfig = config;
    }

    public startConnect() {
        const gateway: ServerAddress = this.mConfig.server_addr;
        if (!gateway || !gateway.host || !gateway.port) {
            this.renderPeer.showAlert("登录失败，请重新登录或稍后再试")
                .then(async () => {
                    await this.renderPeer.clearAccount();
                    this.login();
                });
            return;
        }
        if (gateway) {
            // connect to game server.
            this.mainPeer.startConnect(gateway.host, gateway.port, gateway.secure);
        }
    }

    public showLoading(data?: any) {
        this.mainPeer.render.showLoading(data);
    }

    public onConnected(isAuto?: boolean) {
        this.isAuto = isAuto;
        if (!this.mClock) this.mClock = new Clock(this.connect, this.mainPeer, this);
        if (!this.mHttpClock) this.mHttpClock = new HttpClock(this);
        this.hideMediator(ModuleName.PICA_BOOT_NAME);
        Logger.getInstance().info(`enterVirtualWorld`);
        this.connect.connect = true;
        this.loginEnterWorld();
        // if (this.mConfig.hasGameLoaded) this.renderPeer.gameLoadedCallBack();
        // this.enterVirtualWorld();
        // this.login();
    }

    public onDisConnected(isAuto?: boolean) {
        Logger.getInstance().debug("app connectFail=====");
        this.isAuto = isAuto;
        if (!this.isAuto) return;
        if (this.mConfig.hasConnectFail) {
            return this.mainPeer.render.connectFail();
        } else {
            this.renderPeer.showAlert("网络连接失败，请稍后再试").then(() => {
                const mediator = this.uiManager.getMed(ModuleName.PICA_BOOT_NAME);
                if (mediator && mediator.isShow()) {
                    mediator.show();
                } else {
                    this.renderPeer.hidden();
                }
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
                // 校验没成功
                this.renderPeer.showAlert("登陆过期，请重新登陆")
                    .then(this.login.bind(this));
                break;
        }
        Logger.getInstance().log(`Remote Trace[${content.responseStatus}]: ${content.msg}`);
    }

    public destroyClock() {
        if (this.mClock) {
            this.mClock.destroy();
            this.mClock = null;
        }
    }

    public loadSceneConfig(sceneID: string): Promise<any> {
        const remotePath = this.getConfigUrl(sceneID);
        this.mLoadingManager.start(LoadState.DOWNLOADSCENECONFIG);
        const result = this.preloadGameConfig();
        if (result === undefined) {
            return this.loadGameConfig(remotePath);
        } else {
            return result.then((req: any) => {
                return this.loadGameConfig(remotePath);

            }, (reason) => {
                // return this.loadGameConfig(remotePath);
                return new Promise((resolve, reject) => {
                    this.renderPeer.showAlert("配置加载错误，请重新登陆" + reason)
                        .then(() => {
                            this.renderPeer.hidden();
                        });
                    reject();
                });
            });
        }
    }

    public clearGameComplete() {
        this.initWorld();
    }

    // public addFillEffect(pos: IPoint, status: op_def.PathReachableStatus) {
    //     this.mainPeer.render.addFillEffect(pos.x, pos.y, status).then(() => {
    //     });
    // }

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
        return this.dataManager.getDataMgr<T>(type);
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

    public initgameConfigUrls(urls: string[]) {
        for (const url of urls) {
            const sceneId = Tool.baseName(url);
            this.gameConfigUrls.set(sceneId, url);
            if (url.split(sceneId).length === 3) {
                this.gameConfigUrl = url;
            }
        }
    }

    public getConfigUrl(sceneId: string) {
        return this.gameConfigUrls.get(sceneId);
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

    get soundManager(): SoundManager {
        return this.mSoundManager;
    }

    get clock(): Clock {
        return this.mClock;
    }

    get httpClock(): HttpClock {
        return this.mHttpClock;
    }

    get elementStorage(): ElementStorage {
        return this.mElementStorage;
    }

    get roomManager(): RoomManager {
        return this.mRoomManager;
    }

    get guideManager(): GuideManager {
        return this.mGuideManager;
    }

    get loadingManager(): LoadingManager {
        return this.mLoadingManager;
    }

    get dataManager(): DataManager {
        return this.mDataManager;
    }
    get configManager() {
        return this.mConfigManager;
    }
    get emitter(): EventDispatcher {
        return this.mDataManager.emitter;
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

    get physicalPeer() {
        const physicalPeer = this.peer.physicalPeer;
        if (!physicalPeer) {
            throw new Error("can't find physicalPeer");
        }
        return physicalPeer;
    }

    get avatarType() {
        return this.mAvatarType;
    }
    public onFocus() {
        if (this.mWorkerLoop) clearInterval(this.mWorkerLoop);
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
            // 同步心跳
            this.mClock.sync(-1);
        } else {
            Logger.getInstance().error("connection is undefined");
            return this.onDisConnected();
        }
    }

    public onBlur() {
        this.currentTime = 0;
        // if (this.mWorkerLoop) clearInterval(this.mWorkerLoop);
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

    public async enterVirtualWorld() {
        if (!this.mConfig || !this.connect) {
            return;
        }
        // const token = await this.peer.render.getLocalStorage("token");
        const account = await this.peer.render.getAccount();
        Logger.getInstance().log("account: ", account);
        if (account && account.accountData) {
            this.loginEnterWorld();
        } else {
            this.login();
        }
        // if (!this.mConfig.auth_token) {
        //     if (!account || !account.accessToken) {
        //         this.login();
        //         return;
        //     }
        //     this.peer.render.setAccount(account);
        //     this.refreshToken();
        // } else {
        //     this.peer.render.setAccount({
        //         token: this.mConfig.auth_token,
        //         expire: this.mConfig.token_expire,
        //         fingerprint: this.mConfig.token_fingerprint,
        //         refreshToken: account ? account.refreshToken : "",
        //         id: this.mConfig.user_id ? this.mConfig.user_id : account ? account.id : "",
        //     });
        //     this.loginEnterWorld();
        // }
    }

    public login() {
        this.renderPeer.showLogin();
        // this.mUIManager.showMed(ModuleName.LOGIN_NAME);
    }

    public async refreshToken() {
        const token = await this.peer.render.getLocalStorage("token");
        const account = token ? JSON.parse(token) : null;
        if (!account || !account.accessToken) {
            this.login();
            return;
        }
        this.peer.state = GameState.RequestToken;
        // this.peer.render[ModuleName.].then((account) => {
        this.httpService.refreshToekn(account.refreshToken, account.accessToken)
            .then((response: any) => {
                this.peer.state = GameState.GetToken;
                if (response.code === 200) {
                    this.peer.render.refreshAccount(response);
                    // this.mAccount.refreshToken(response);
                    this.loginEnterWorld();
                } else {
                    this.login();
                }
            }).catch((error) => {
                this.peer.state = GameState.GetToken;
                Logger.getInstance().error("refreshToken:", error);
                this.login();
            });
        // });
    }

    public async loginEnterWorld() {
        Logger.getInstance().debug("loginEnterWorld");
        this.mLoadingManager.start(LoadState.ENTERWORLD, { render: "构建现实世界" + `_v${version}`, main: "构建魔法世界" + `_v${version}`, physical: "构建物理世界" + `_v${version}` });
        this.renderPeer.hideLogin();
        const pkt: PBpacket = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT);
        const content: IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = pkt.content;
        Logger.getInstance().debug(`VW_id: ${this.mConfig.virtual_world_id}`);
        let game_id = this.mConfig.game_id;
        let virtualWorldUuid = this.mConfig.virtual_world_id;
        const worldId = this.mConfig.world_id;
        let sceneId = null;
        let loc = null;
        let spawnPointId = null;
        const account = await this.peer.render.getAccount();
        const accountData = account.accountData;
        if (account && account.gameId) {
            game_id = account.gameId;
            virtualWorldUuid = account.virtualWorldId;
            sceneId = account.sceneID;
            loc = account.loc;
            spawnPointId = account.spawnPointId;
        }
        content.virtualWorldUuid = virtualWorldUuid;
        content.gameId = game_id;
        content.userToken = this.mConfig.auth_token = accountData.accessToken;
        content.expire = this.mConfig.token_expire = accountData.expire + "";
        content.fingerprint = this.mConfig.token_fingerprint = accountData.fingerprint;
        content.sceneId = sceneId;
        content.worldUuid = worldId;
        // 后端有个Bug，loc是undefined位置会错误。修复后删掉{ locX: 0, locY: 0, locZ: 0}
        content.loc = loc || { locX: 0, locY: 0, locZ: 0 };
        content.spawnPointId = spawnPointId;
        this.connect.send(pkt);
        this.peer.state = GameState.EnterWorld;
        if (this.mHttpClock) this.mHttpClock.gameId = game_id;
    }

    public leaveRoom(room: IRoomService) {

    }

    public showByName(name: string, data?: any) {

    }

    public showMediator(name: string, isShow: boolean, param?: any) {
        if (isShow) {
            this.mUIManager.showMed(name, param);
        } else {
            this.mUIManager.hideMed(name);
        }
    }

    public hideMediator(name) {
        this.mUIManager.hideMed(name);
    }

    public gameCreated() {
        if (this.connection) {
            Logger.getInstance().debug("connection gameCreat");
            this.mLoadingManager.start(LoadState.WAITENTERROOM);
            const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_GAME_CREATED);
            this.connection.send(pkt);
            this.peer.state = GameState.GameCreate;
        } else {
            // Log
            Logger.getInstance().debug("no connection gameCreat");
        }
    }

    /**
     * 加载前端json文件
     * @param name
     */
    public loadJson() {
        this.mLoadingManager.start(LoadState.LOADJSON);
    }

    public preloadGameConfig(): Promise<any> {
        return undefined;
    }

    // public heartBeatCallBack() {
    //     this.mainPeer.clearBeat();
    // }

    protected async initWorld() {
        this.mUser = new User(this);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT, this.onInitVirtualWorldPlayerInit);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_ERROR, this.onClientErrorHandler);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SELECT_CHARACTER, this.onSelectCharacter);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_GOTO_ANOTHER_GAME, this.onGotoAnotherGame);
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
        this.peer.state = GameState.CreateManager;
        await this.mainPeer.render.createAccount(this.mConfig.game_id + "", this.mConfig.virtual_world_id + "");
        this.peer.state = GameState.CreateAccount;
    }

    protected createManager() {
        if (!this.mRoomManager) this.mRoomManager = new RoomManager(this);
        if (!this.mGuideManager) this.mGuideManager = new GuideManager(this);
        // this.mUiManager = new UiManager(this);
        if (!this.mElementStorage) this.mElementStorage = new ElementStorage();
        if (!this.mUIManager) this.mUIManager = new UIManager(this);
        if (!this.mHttpService) this.mHttpService = new HttpService(this);
        if (!this.mSoundManager) this.mSoundManager = new SoundManager(this);
        if (!this.mLoadingManager) this.mLoadingManager = new LoadingManager(this);
        if (!this.mDataManager) this.mDataManager = new DataManager(this);
        if (!this.mConfigManager) this.mConfigManager = new BaseConfigManager(this);
        if (!this.mNetWorkManager) this.mNetWorkManager = new NetworkManager(this);
        // this.mPlayerDataManager = new PlayerDataManager(this);

        this.mUIManager.addPackListener();
        this.mRoomManager.addPackListener();
        this.mGuideManager.addPackListener();
        this.user.addPackListener();
        this.mSoundManager.addPackListener();
        // this.mPlayerDataManager.addPackListener();
    }

    private initGame() {
        // if (this.mRoomManager) this.mRoomManager.addPackListener();
        // if (this.mUIManager) this.mUIManager.addPackListener();
        // if (this.mCreateRoleManager) this.mCreateRoleManager.register();
        // if (this.mSoundManager) this.mSoundManager.addPackListener();
        // if (this.mPlayerDataManager) this.mPlayerDataManager.addPackListener();
        // if (this.mElementStorage) {
        //     this.mElementStorage.on("SCENE_PI_LOAD_COMPELETE", this.loadSceneConfig);
        // }
    }

    private onGotoAnotherGame(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_GOTO_ANOTHER_GAME = packet.content;
        this._onGotoAnotherGame(content.gameId, content.virtualWorldId, content.sceneId, content.loc, content.spawnPointId, content.worldId);
    }

    private _createAnotherGame(gameId, virtualworldId, sceneId, loc, spawnPointId?, worldId?) {
        this.clearGame(true).then(() => {
            this.isPause = false;
            if (this.mUser) {
                this.mUser.clear();
            }
            if (this.connect) {
                this.removePacketListener();
                this.connect.closeConnect();
            }
            if (this.mClock) {
                this.mClock.destroy();
                this.mClock = null;
            }
            this.mainPeer.render.createAccount(gameId, virtualworldId, sceneId, loc, spawnPointId);
            // this.mConfig.game_id = gameId;
            // this.mConfig.virtual_world_id = virtualworldId;
            this.createManager();
            this.addPacketListener();
            this.startConnect();
            this.mClock = new Clock(this.connect, this.peer);
            // setTimeout(() => {
            this.mainPeer.render.createAnotherGame(gameId, virtualworldId, sceneId, loc ? loc.x : 0, loc ? loc.y : 0, loc ? loc.z : 0, spawnPointId, worldId);
            // }, 1000);
            // this.mGame.scene.start(LoadingScene.name, { world: this }););
        });
    }

    private _onGotoAnotherGame(gameId, virtualworldId, sceneId, loc, spawnPointId?, worldId?) {
        this.clearGame(true).then(() => {
            this.isPause = false;
            if (this.connect) {
                this.connect.closeConnect();
            }
            if (this.mClock) {
                this.mClock.destroy();
                this.mClock = null;
            }
            this.mainPeer.render.createAccount(gameId, virtualworldId, sceneId, loc, spawnPointId);
            this.createManager();
            this.removePacketListener();
            this.addPacketListener();
            this.startConnect();
            this.mClock = new Clock(this.connect, this.peer);
            // 告知render进入其他game
            this.mainPeer.render.createAnotherGame(gameId, virtualworldId, sceneId, loc ? loc.x : 0, loc ? loc.y : 0, loc ? loc.z : 0, spawnPointId, worldId);
        });
    }

    private clearGame(bool: boolean = false): Promise<void> {
        return new Promise((resolve, reject) => {
            this.renderPeer.clearGame(bool).then(() => {
                this.isAuto = true;
                if (this.mClock) {
                    this.mClock.destroy();
                    this.mClock = null;
                }
                if (this.mRoomManager) {
                    this.mRoomManager.destroy();
                    this.mRoomManager = null;
                }
                if (this.mGuideManager) {
                    this.mGuideManager.destroy();
                    this.mGuideManager = null;
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
                if (this.mConfigManager) {
                    this.mConfigManager.destory();
                    this.mConfigManager = null;
                }
                if (this.mDataManager) {
                    this.mDataManager.clear();
                    this.mDataManager = null;
                }

                if (this.mSoundManager) {
                    this.mSoundManager.destroy();
                    this.mSoundManager = null;
                }

                if (this.user) this.user.removePackListener();
                // this.peer.destroy();
                this.hasClear = true;
                resolve();
            });
        });
    }

    private async onInitVirtualWorldPlayerInit(packet: PBpacket) {
        this.peer.state = GameState.PlayerInit;
        Logger.getInstance().debug("onInitVirtualWorldPlayerInit");
        // if (this.mClock) this.mClock.sync(); // Manual sync remote time.
        // TODO 进游戏前预加载资源
        const content: op_client.IOP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT = packet.content;
        const configUrls = content.configUrls;
        this.moveStyle = content.moveStyle;

        this.mClock.sync(-1);

        this.initgameConfigUrls(configUrls);
        const account = await this.peer.render.getAccount();
        // const keyBoardPacket: PBpacket = new PBpacket();
        // keyBoardPacket.Deserialization(new Buffer(content.keyEvents));
        if (!configUrls || configUrls.length <= 0) {
            Logger.getInstance().error(`configUrls error: , ${configUrls}, gameId: ${account.gameID}`);
            this.mainPeer.render.createGameCallBack(content.keyEvents);
            // if (!this.mainPeer.physicalPeer) return;
            this.gameCreated();
            return;
        }
        Logger.getInstance().debug(`mMoveStyle:${content.moveStyle}`);
        let game_id = account.gameId;
        if (game_id === undefined) {
            Logger.getInstance().log("!game_ID");
            this.mainPeer.render.createGameCallBack(content.keyEvents);
            // if (!this.mainPeer.physicalPeer) return;
            this.gameCreated();
            return;
        }
        Logger.getInstance().debug("WorldPlayerInit");
        if (game_id.indexOf(".") > -1) {
            game_id = game_id.split(".")[1];
        }
        const mainGameConfigUrl = this.gameConfigUrl;
        this.mLoadingManager.start(LoadState.DOWNLOADGAMECONFIG);
        // this.connect.loadRes([mainGameConfigUrl]);
        Logger.getInstance().debug("onInitVirtualWorldPlayerInit====loadGameConfig");
        this.loadGameConfig(mainGameConfigUrl)
            .then((gameConfig: Lite) => {
                this.peer.state = GameState.CompleteDecodeConfig;
                this.mElementStorage.setGameConfig(gameConfig);
                this.mainPeer.render.createGameCallBack(content.keyEvents);
                // if (!this.mainPeer.physicalPeer) return;
                this.gameCreated();
                Logger.getInstance().log("created game suc");
            })
            .catch((err: any) => {
                Logger.getInstance().error(err);
            });
    }

    private loadGameConfig(remotePath): Promise<Lite> {
        if (this.configManager.initialize) {
            this.user.userData.querySYNC_ALL_PACKAGE();
        }
        const configPath = ResUtils.getGameConfig(remotePath);
        let index = 0;
        return load(configPath, "arraybuffer").then((req: any) => {
            this.peer.state = GameState.LoadGameConfig;
            this.mLoadingManager.start(LoadState.PARSECONFIG);
            Logger.getInstance().debug("start decodeConfig");
            return this.decodeConfigs(req);
        }, (reason) => {
            if (index > 3) {
                if (this.mConfig.hasReload) {
                    // app reload
                } else {
                    Logger.getInstance().log(reason);
                    this.renderPeer.reload();
                }
                return;
            }
            index++;
            Logger.getInstance().error("reload res ====>", reason, "reload count ====>", index);
            return this.loadGameConfig(remotePath);
        });
    }

    private onSelectCharacter() {
        const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_CHARACTER_CREATED);
        this.mainPeer.send(pkt.Serialization());
        const i18Packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SET_LOCALE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_SET_LOCALE = i18Packet.content;
        // content.localeCode = i18n.language;
        content.localeCode = "zh-CN";
        this.mainPeer.send(i18Packet.Serialization());
        //  this.user.userData.querySYNC_ALL_PACKAGE();
    }

    private decodeConfigs(req): Promise<Lite> {
        return new Promise((resolve, reject) => {
            const arraybuffer = req.response;
            if (arraybuffer) {
                try {
                    const gameConfig = new Lite();
                    gameConfig.deserialize(new Uint8Array(arraybuffer));
                    Logger.getInstance().debug("TCL: World -> gameConfig", gameConfig);
                    // const list = (<any>gameConfig)._root._moss._peersDict;
                    // list.forEach((dat) => {
                    //     if (dat.id === 1229472650) {
                    //         Logger.getInstance().debug("地毯=======", dat);
                    //     }
                    // });
                    resolve(gameConfig);
                } catch (error) {
                    Logger.getInstance().error("catch error", error);
                    reject(error);
                }
            } else {
                Logger.getInstance().error("reject error");
                reject("error");
            }
        });
    }
    private onAvatarGameModeHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_GAME_MODE = packet.content;
        this.mAvatarType = content.avatarStyle;
    }

    private _run(current: number, delta: number) {
        if (!this.mRunning) return;
        // Logger.getInstance.log(`_run at ${current} + delta: ${delta}`);

        // TODO do something here.
        if (this.connect) this.connect.update();
        if (this.mRoomManager) this.mRoomManager.update(current, delta);
    }

    private update(current: number, delta: number = 0) {
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
}
