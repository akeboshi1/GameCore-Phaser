import { PBpacket, PacketHandler } from "net-socket-packet";
import { MainPeer } from "./main.peer";
import { op_def, op_client, op_virtual_world, op_gateway } from "pixelpai_proto";
import { IPoint, Lite } from "game-capsule";
import { ConnectionService } from "../../lib/net/connection.service";
import { IConnectListener } from "../../lib/net/socket";
import { Logger } from "../utils/log";
import { i18n } from "../utils/i18n";
import { ResUtils } from "../utils/resUtil";
import IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = op_gateway.IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT;
import { Connection, ConnListener, GameSocket } from "./net/connection";
import { Clock, ClockReadyListener } from "./loop/clock/clock";
import { HttpClock } from "./loop/httpClock/http.clock";
import { HttpService } from "./loop/httpClock/http.service";
import { Tool } from "../utils/tool";
import { LoadingManager } from "./loading/loading.manager";
import { LoadingTips } from "./loading/loading.tips";
import { load } from "../utils/http";
import { ILauncherConfig } from "../structureinterface/lanucher.config";
import { ServerAddress } from "../../lib/net/address";
import { UIManager } from "./ui/ui.manager";
import { CreateRoleManager } from "./ui/create.role/create.role.manager";
import { Account } from "../render/account/account";
import { Render } from "../render/render";
import { IRoomService } from "./room/room/room";
import { ElementStorage } from "./room/elementstorage/element.storage";
import { RoomManager } from "./room/room.manager";
interface ISize {
    width: number;
    height: number;
}
export class Game extends PacketHandler implements IConnectListener, ClockReadyListener {
    private connect: ConnectionService;
    private mSocket: GameSocket;
    // private mUiManager: UiManager;
    // private mMoveStyle: number = -1;
    private mSize: ISize;
    private mClock: Clock;
    private mHttpClock: HttpClock;
    private mHttpService: HttpService;
    private mConfig: ILauncherConfig;
    // private mAccount: Account;
    private mRoomManager: RoomManager;
    private mElementStorage: ElementStorage;
    // private mPlayerDataManager: PlayerDataManager;
    private mCreateRoleManager: CreateRoleManager;
    private mUIManager: UIManager;
    // private mSoundManager: SoundManager;
    private mLoadingManager: LoadingManager;
    private mainPeer: MainPeer;
    private gameConfigUrls: Map<string, string> = new Map();
    private gameConfigUrl: string;
    private isPause: boolean = false;
    constructor(peer: MainPeer) {
        super();
        this.mainPeer = peer;
        this.mSocket = new GameSocket(peer, new ConnListener(peer));
        this.connect = new Connection(this.mSocket);
        this.connect.addPacketListener(this);
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

    // public createAccount(gameID: string, worldID: string, sceneId?: number, loc?: any) {
    //     this.mAccount = new Account();
    //     this.mAccount.enterGame(gameID, worldID, sceneId, loc);
    // }

    public showLoading() {
        this.mainPeer.render.showLoading();
    }

    public onConnected() {
        if (!this.mClock) this.mClock = new Clock(this.connect, this.mainPeer, this);
        if (!this.mHttpClock) this.mHttpClock = new HttpClock(this);
        // Logger.getInstance().info(`enterVirtualWorld`);
        this.mainPeer.render.enterVirtualWorld();
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

    public loadSceneConfig(sceneID: number) {
        this.mainPeer.render.loadSceneConfig(sceneID);
    }

    public clearGameComplete() {
        this.initWorld();
    }

    public addFillEffect(pos: IPoint, status: op_def.PathReachableStatus) {
        this.mainPeer.render.addFillEffect(pos.x, pos.y, status);
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

    public setCameraBounds(x: number, y: number, width: number, height: number) {
        this.mainPeer.render.setCameraBounds(x, y, width, height);
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
        this.mainPeer.render.setMoveStyle(moveStyle);
    }

    // get moveStyle(): number {
    //     return this.mMoveStyle;
    // }

    get httpService(): HttpService {
        return this.mHttpService;
    }

    // get account(): Account {
    //     return this.mAccount;
    // }

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

    public async enterVirtualWorld() {
        if (this.mConfig && this.connect) {
            // this.mLoadingManager.start();
            // test login and verified
            const account = await this.peer.render.getAccount();
            if (!account) {
                return;
            }
            const accountData = account.accountData;
            if (!accountData) {
                return;
            }
            // this.peer.render.getAccount().then((account) => {
            if (!this.mConfig.auth_token) {
                if (!accountData) {
                    this.mUIManager.showMed("Login");
                    // LoginManager.show("Login");
                    // this.peer.render.login();
                    return;
                }
                this.httpService.refreshToekn(accountData.refreshToken, accountData.accessToken)
                    .then((response: any) => {
                        if (response.code === 200) {
                            this.peer.render.refreshAccount(response);
                            this.loginEnterWorld();
                        } else {
                            this.mUIManager.showMed("Login");
                            // this.peer.render.login();
                            return;
                        }
                    });
            } else {
                this.loginEnterWorld();
            }
            // });
        }
    }

    public async refreshToken() {
        const account = await this.peer.render.getAccount();
        const accountData = account.accountData;
        // this.peer.render.getAccount().then((account) => {
        this.httpService.refreshToekn(accountData.refreshToken, accountData.accessToken)
            .then((response: any) => {
                if (response.code === 200) {
                    this.peer.render.refreshAccount(response);
                    // this.mAccount.refreshToken(response);
                    this.loginEnterWorld();
                } else {
                    this.mUIManager.showMed("Login");
                    // this.peer.render.login();
                    return;
                }
            });
        // });
    }

    public async loginEnterWorld() {
        Logger.getInstance().log("loginEnterWorld");
        this.mLoadingManager.start(LoadingTips.enterGame());
        const pkt: PBpacket = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT);
        const content: IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = pkt.content;
        // Logger.getInstance().log(`VW_id: ${this.mConfig.virtual_world_id}`);
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

    public showMediator(name, param?: any) {
        this.mUIManager.showMed(name, param);
    }

    private initWorld() {
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT, this.onInitVirtualWorldPlayerInit);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_ERROR, this.onClientErrorHandler);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SELECT_CHARACTER, this.onSelectCharacter);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_GOTO_ANOTHER_GAME, this.onGotoAnotherGame);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_PONG, this.heartBeatCallBack);
        this.mRoomManager = new RoomManager(this);
        // this.mUiManager = new UiManager(this);
        // this.mElementStorage = new ElementStorage();
        this.mUIManager = new UIManager(this);
        this.mHttpService = new HttpService(this);
        this.mCreateRoleManager = new CreateRoleManager(this);
        // this.mSoundManager = new SoundManager(this);
        this.mLoadingManager = new LoadingManager(this);
        // this.mPlayerDataManager = new PlayerDataManager(this);

        this.mCreateRoleManager.register();
        this.mUIManager.addPackListener();
        this.mRoomManager.addPackListener();
        // this.mSoundManager.addPackListener();
        // this.mPlayerDataManager.addPackListener();
        this.peer.render.createAccount(this.mConfig.game_id, this.mConfig.virtual_world_id);
    }

    private initGame() {
        if (this.mRoomManager) this.mRoomManager.addPackListener();
        if (this.mUIManager) this.mUIManager.addPackListener();
        if (this.mCreateRoleManager) this.mCreateRoleManager.register();
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
        this.clearGame();
        this.isPause = false;
        if (this.connect) {
            this.connect.closeConnect();
        }
        if (this.mClock) {
            this.mClock.destroy();
            this.mClock = null;
        }
        this.mainPeer.render.createAccount(gameId, worldId, sceneId, loc);
        this.connect.addPacketListener(this);
        const gateway: ServerAddress = this.mConfig.server_addr;
        if (gateway) {
            this.connect.startConnect(gateway);
        }
        this.mClock = new Clock(this.connect, this.peer);
        // 告知render进入其他game
        this.mainPeer.render.createAnotherGame(gameId, worldId, sceneId, loc.x, loc.y, loc.z);
    }

    private clearGame(): void {
        if (this.mClock) {
            this.mClock.destroy();
            this.mClock = null;
        }
    }

    private async onInitVirtualWorldPlayerInit(packet: PBpacket) {
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
        let game_id = account.gameID;
        if (!game_id) {
            this.mainPeer.render.createGameCallBack(content.keyEvents);
            this.gameCreated();
            return;
        }
        if (game_id.indexOf(".") > -1) {
            game_id = game_id.split(".")[1];
        }
        const mainGameConfigUrl = this.gameConfigUrls;
        this.mLoadingManager.start(LoadingTips.downloadGameConfig());
        // this.connect.loadRes([mainGameConfigUrl]);
        this.loadGameConfig(mainGameConfigUrl)
            .then((gameConfig: Lite) => {
                // this.mElementStorage.setGameConfig(gameConfig);
                this.mainPeer.render.createGameCallBack(content.keyEvents);
                this.gameCreated();
                Logger.getInstance().debug("created game suc");
            })
            .catch((err: any) => {
                Logger.getInstance().log(err);
            });
    }

    private gameCreated() {
        if (this.connection) {
            this.mLoadingManager.start(LoadingTips.waitEnterRoom());
            const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_GAME_CREATED);
            this.connection.send(pkt);
        } else {
            // Logger.getInstance().error("connection is undefined");
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

    private loadGameConfig(remotePath): Promise<Lite> {
        const configPath = ResUtils.getGameConfig(remotePath);
        return load(configPath, "arraybuffer").then((req: any) => {
            Logger.getInstance().log("start decodeConfig");
            this.mLoadingManager.start(LoadingTips.parseConfig());
            return this.decodeConfigs(req);
        });
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
                    reject(error);
                }
            } else {
                reject("error");
            }
        });
    }
    private heartBeatCallBack() {
        this.mainPeer.clearBeat();
    }
}
