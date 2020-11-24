import { UIManager } from "./ui/ui.manager";
import { PBpacket, PacketHandler } from "net-socket-packet";
import { MainPeer } from "./main.peer";
import { op_def, op_client, op_virtual_world, op_gateway } from "pixelpai_proto";
import { IPoint, Lite } from "game-capsule";
import { ConnectionService } from "../../lib/net/connection.service";
import { IConnectListener } from "../../lib/net/socket";
import { Logger, ResUtils, Tool, load, EventDispatcher } from "utils";
import IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = op_gateway.IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT;
import { Connection, ConnListener, GameSocket } from "./net/connection";
import { Clock, ClockReadyListener } from "./loop/clock/clock";
import { HttpClock } from "./loop/httpClock/http.clock";
import { HttpService } from "./loop/httpClock/http.service";
import { LoadingManager } from "./loading/loading.manager";
import { LoadingTips } from "./loading/loading.tips";
import { ILauncherConfig } from "structure";
import { ServerAddress } from "../../lib/net/address";
import { IRoomService } from "./room/room/room";
import { ElementStorage } from "./room/elementstorage/element.storage";
import { RoomManager } from "./room/room.manager";
import { User } from "./actor/user";
import { DataManager, DataMgrType } from "./data.manager/dataManager";
interface ISize {
    width: number;
    height: number;
}

const fps: number = 30;
const delayTime = 1000 / fps;
export class Game extends PacketHandler implements IConnectListener, ClockReadyListener {
    protected mainPeer: MainPeer;
    protected connect: ConnectionService;
    protected mSocket: GameSocket;
    protected mUser: User;
    // protected mUiManager: UiManager;
    // protected mMoveStyle: number = -1;
    protected mSize: ISize;
    protected mClock: Clock;
    protected mHttpClock: HttpClock;
    protected mHttpService: HttpService;
    protected mConfig: ILauncherConfig;
    protected mDataManager: DataManager;
    // protected mAccount: Account;
    protected mRoomManager: RoomManager;
    protected mElementStorage: ElementStorage;
    // protected mPlayerDataManager: PlayerDataManager;
    protected mUIManager: UIManager;
    // protected mSoundManager: SoundManager;
    protected mLoadingManager: LoadingManager;
    protected gameConfigUrls: Map<string, string> = new Map();
    protected gameConfigUrl: string;
    protected isPause: boolean = false;
    protected mMoveStyle: number;
    protected mWorkerLoop: any;
    protected currentTime: number = 0;
    constructor(peer: MainPeer) {
        super();
        this.mainPeer = peer;
        this.mSocket = new GameSocket(peer, new ConnListener(peer));
        this.connect = new Connection(this.mSocket);
        this.connect.addPacketListener(this);
        this.update();
    }

    public run(): Promise<any> {
        return new Promise<any>((resolve) => {
            this.currentTime = new Date().getTime();
            this.mWorkerLoop = setInterval(() => {
                resolve(new Date().getTime() - this.currentTime);
            }, delayTime);
        });
    }

    public async update() {
        for (; ;) {
            await this.run();
            if (this.user) this.user.update();
            if (this.mRoomManager) this.mRoomManager.update(this.currentTime, delayTime);
        }
    }

    get scaleRatio(): number {
        return this.mConfig.devicePixelRatio;
    }

    public createGame(config?: ILauncherConfig) {
        this.mConfig = config;
        this.initWorld();
        this.initGame();
        const gateway: ServerAddress = this.mConfig.server_addr;
        if (gateway) {
            // connect to game server.
            this.mainPeer.startConnect(gateway.host, gateway.port, gateway.secure);
        }
    }

    public showLoading(data?: any) {
        this.mainPeer.render.showLoading(data);
    }

    public onConnected() {
        if (!this.mClock) this.mClock = new Clock(this.connect, this.mainPeer, this);
        if (!this.mHttpClock) this.mHttpClock = new HttpClock(this);
        Logger.getInstance().info(`enterVirtualWorld`);
        this.enterVirtualWorld();
        // this.login();
    }

    public onDisConnected() {
        Logger.getInstance().log("app connectFail=====");
        if (this.connect.pause) return;
        if (this.mConfig.connectFail) {
            this.onError();
        } else {
            this.mainPeer.render.clearGame();
        }
    }

    public onError() {
        Logger.getInstance().log("socket error");
        if (!this.connect.connect) {
            if (this.mConfig.connectFail) {
                Logger.getInstance().log("app connectFail");
                if (this.mConfig.connectFail) return this.mainPeer.render.connectFail();
            } else {
                this.mainPeer.reconnect();
            }
        }
    }

    public onClientErrorHandler(packet: PBpacket): void {
        const content: op_client.OP_GATEWAY_RES_CLIENT_ERROR = packet.content;
        Logger.getInstance().error(`Remote Error[${content.responseStatus}]: ${content.msg}`);
    }

    public destroyClock() {
        if (this.mClock) {
            this.mClock.destroy();
            this.mClock = null;
        }
    }

    public loadSceneConfig(sceneID: string): Promise<any> {
        const remotePath = this.getConfigUrl(sceneID);
        this.mLoadingManager.start(LoadingTips.downloadSceneConfig());
        return this.loadGameConfig(remotePath);
    }

    public clearGameComplete() {
        this.initWorld();
    }

    public addFillEffect(pos: IPoint, status: op_def.PathReachableStatus) {
        this.mainPeer.render.addFillEffect(pos.x, pos.y, status).then(() => {

        });
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
        return this.mSocket;
    }

    get uiManager(): UIManager {
        return this.mUIManager;
    }

    // get soundManager(): SoundManager {
    //     return this.mSoundManager;
    // }

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

    get loadingManager(): LoadingManager {
        return this.mLoadingManager;
    }

    get dataManager(): DataManager {
        return this.mDataManager;
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

    public async enterVirtualWorld() {
        if (!this.mConfig || !this.connect) {
            return;
        }
        const token = await this.peer.render.getLocalStorage("token");
        const account = token ? JSON.parse(token) : null;
        if (!this.mConfig.auth_token) {
            if (!account||!account.accessToken) {
                this.login();
                return;
            }
            this.peer.render.setAccount(account);
            this.refreshToken();
        } else {
            this.peer.render.setAccount({
                token: this.mConfig.auth_token,
                expire: this.mConfig.token_expire,
                fingerprint: this.mConfig.token_fingerprint,
                refreshToken: account ? account.refreshToken : "",
                id: this.mConfig.user_id ? this.mConfig.user_id : account ? account.id : "",
            });
            this.loginEnterWorld();
        }
    }

    public login() {
        this.renderPeer.showLogin();
        // this.mUIManager.showMed(ModuleName.LOGIN_NAME);
    }

    public async refreshToken() {
        const account = await this.peer.render.getAccount();
        const accountData = account.accountData;
        // this.peer.render[ModuleName.].then((account) => {
        this.httpService.refreshToekn(accountData.refreshToken, accountData.accessToken)
            .then((response: any) => {
                if (response.code === 200) {
                    this.peer.render.refreshAccount(response);
                    // this.mAccount.refreshToken(response);
                    this.loginEnterWorld();
                } else {
                    this.login();
                }
            });
        // });
    }

    public async loginEnterWorld() {
        Logger.getInstance().log("loginEnterWorld");
        this.mLoadingManager.start(LoadingTips.enterGame());
        this.renderPeer.hideLogin();
        const pkt: PBpacket = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT);
        const content: IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = pkt.content;
        Logger.getInstance().log(`VW_id: ${this.mConfig.virtual_world_id}`);
        let game_id = this.mConfig.game_id;
        let virtualWorldUuid = this.mConfig.virtual_world_id;
        let sceneId = null;
        let loc = null;
        const account = await this.peer.render.getAccount();
        const accountData = account.accountData;
        if (account && account.gameId) {
            game_id = account.gameId;
            virtualWorldUuid = account.virtualWorldId;
            sceneId = account.sceneId;
            loc = account.loc;
        }
        content.virtualWorldUuid = virtualWorldUuid;
        content.gameId = game_id;
        content.userToken = this.mConfig.auth_token = accountData.accessToken;
        content.expire = this.mConfig.token_expire = accountData.expire + "";
        content.fingerprint = this.mConfig.token_fingerprint = accountData.fingerprint;
        content.sceneId = sceneId;
        content.loc = loc;
        this.connect.send(pkt);
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

    protected initWorld() {
        this.mUser = new User(this);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT, this.onInitVirtualWorldPlayerInit);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_ERROR, this.onClientErrorHandler);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SELECT_CHARACTER, this.onSelectCharacter);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_GOTO_ANOTHER_GAME, this.onGotoAnotherGame);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_PONG, this.heartBeatCallBack);
        this.createManager();
        const gameID = this.mConfig.game_id;
        const worldId = this.mConfig.virtual_world_id;
        if (typeof gameID !== "string") {
            Logger.getInstance().error("gameID is not string");
        }
        if (typeof worldId !== "string") {
            Logger.getInstance().error("worldId is not string");
        }
        this.peer.render.createAccount(this.mConfig.game_id, this.mConfig.virtual_world_id);
    }

    protected createManager() {
        if (!this.mRoomManager) this.mRoomManager = new RoomManager(this);
        // this.mUiManager = new UiManager(this);
        if (!this.mElementStorage) this.mElementStorage = new ElementStorage();
        if (!this.mUIManager) this.mUIManager = new UIManager(this);
        if (!this.mHttpService) this.mHttpService = new HttpService(this);
        // this.mSoundManager = new SoundManager(this);
        if (!this.mLoadingManager) this.mLoadingManager = new LoadingManager(this);
        if (!this.mDataManager) this.mDataManager = new DataManager(this);
        // this.mPlayerDataManager = new PlayerDataManager(this);

        this.mUIManager.addPackListener();
        this.mRoomManager.addPackListener();
        this.user.addPackListener();
        // this.mSoundManager.addPackListener();
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
        this._onGotoAnotherGame(content.gameId, content.virtualWorldId, content.sceneId, content.loc);
    }

    private _onGotoAnotherGame(gameId, worldId, sceneId, loc) {
        this.clearGame(true).then(() => {
            this.isPause = false;
            if (this.connect) {
                this.connect.closeConnect();
            }
            if (this.mClock) {
                this.mClock.destroy();
                this.mClock = null;
            }
            this.mainPeer.render.createAccount(gameId, worldId, sceneId, loc);
            this.createManager();
            this.connect.addPacketListener(this);
            const gateway: ServerAddress = this.mConfig.server_addr;
            if (gateway) {
                this.connect.startConnect(gateway);
            }
            this.mClock = new Clock(this.connect, this.peer);
            // 告知render进入其他game
            this.mainPeer.render.createAnotherGame(gameId, worldId, sceneId, loc ? loc.x : 0, loc ? loc.y : 0, loc ? loc.z : 0);
        });
    }

    private clearGame(bool: boolean = false): Promise<void> {
        return new Promise((resolve, reject) => {
            this.renderPeer.clearGame(bool).then(() => {
                if (this.mClock) {
                    this.mClock.destroy();
                    this.mClock = null;
                }
                if (this.mRoomManager) {
                    this.mRoomManager.destroy();
                    this.mRoomManager = null;
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
                if (this.mDataManager) {
                    this.mDataManager.clear();
                    this.mDataManager = null;
                }
                resolve();
            });
        });
    }

    private async onInitVirtualWorldPlayerInit(packet: PBpacket) {
        Logger.getInstance().log("onInitVirtualWorldPlayerInit");
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
            this.gameCreated();
            return;
        }
        Logger.getInstance().log(`mMoveStyle:${content.moveStyle}`);
        let game_id = account.gameId;
        if (game_id === undefined) {
            Logger.getInstance().log("!game_ID");
            this.mainPeer.render.createGameCallBack(content.keyEvents);
            this.gameCreated();
            return;
        }
        Logger.getInstance().log("WorldPlayerInit");
        if (game_id.indexOf(".") > -1) {
            game_id = game_id.split(".")[1];
        }
        const mainGameConfigUrl = this.gameConfigUrl;
        this.mLoadingManager.start(LoadingTips.downloadGameConfig());
        // this.connect.loadRes([mainGameConfigUrl]);
        Logger.getInstance().log("onInitVirtualWorldPlayerInit====loadGameConfig");
        this.loadGameConfig(mainGameConfigUrl)
            .then((gameConfig: Lite) => {
                this.mElementStorage.setGameConfig(gameConfig);
                this.mainPeer.render.createGameCallBack(content.keyEvents);
                this.gameCreated();
                Logger.getInstance().debug("created game suc");
            })
            .catch((err: any) => {
                Logger.getInstance().log(err);
            });
    }

    private loadGameConfig(remotePath): Promise<Lite> {
        const configPath = ResUtils.getGameConfig(remotePath);
        return load(configPath, "arraybuffer").then((req: any) => {
            this.mLoadingManager.start(LoadingTips.parseConfig());
            Logger.getInstance().log("start decodeConfig");
            return this.decodeConfigs(req);
        });
    }

    private gameCreated() {
        if (this.connection) {
            Logger.getInstance().log("connection gameCreat");
            this.mLoadingManager.start(LoadingTips.waitEnterRoom());
            const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_GAME_CREATED);
            this.connection.send(pkt);
        } else {
            // Log
            Logger.getInstance().log("no connection gameCreat");
        }
    }

    private onSelectCharacter() {
        const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_CHARACTER_CREATED);
        this.mainPeer.send(pkt.Serialization());
        const i18Packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SET_LOCALE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_SET_LOCALE = i18Packet.content;
        // content.localeCode = i18n.language;
        content.localeCode = "zh-CN";
        this.mainPeer.send(i18Packet.Serialization());
        // this.mPlayerDataManager.querySYNC_ALL_PACKAGE();
    }

    private decodeConfigs(req): Promise<Lite> {
        return new Promise((resolve, reject) => {
            const arraybuffer = req.response;
            if (arraybuffer) {
                try {
                    const gameConfig = new Lite();
                    gameConfig.deserialize(new Uint8Array(arraybuffer));
                    Logger.getInstance().log("TCL: World -> gameConfig", gameConfig);
                    resolve(gameConfig);
                } catch (error) {
                    Logger.getInstance().log("catch error", error);
                    reject(error);
                }
            } else {
                Logger.getInstance().log("reject error");
                reject("error");
            }
        });
    }
    private heartBeatCallBack() {
        this.mainPeer.clearBeat();
    }
}
