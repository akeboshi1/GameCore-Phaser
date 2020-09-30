import { Clock, ClockReadyListener } from "./clock/clock";
import { PBpacket, PacketHandler, Buffer } from "net-socket-packet";
import { MainPeer } from "./game";
import { HttpService } from "./httpClock/http.service";
import { op_def, op_client, op_virtual_world } from "pixelpai_proto";
import { HttpClock } from "./http.clock";
import { RoomManager } from "./rooms/room.manager";
import { ILogicRoomService } from "./rooms/room";
import { IPoint, Lite } from "game-capsule";
import { ConnectionService } from "../../lib/net/connection.service";
import { IConnectListener } from "../../lib/net/socket";
import { Logger } from "../utils/log";
import { i18n } from "../utils/i18n";
import { ResUtils } from "../utils/resUtil";

interface ISize {
    width: number;
    height: number;
}
export interface ILogiclauncherConfig {
    api_root: string;
    auth_token: string;
    token_expire: string | null;
    token_fingerprint: string;
    user_id: string;
    game_id: string;
    virtual_world_id: string;
    ui_scale?: number;
    devicePixelRatio?: number;
    scale_ratio?: number;
    platform?: string;
    keyboardHeight: number;
    width: number;
    height: number;
    desktop: boolean;
    readonly screenWidth: number;
    readonly screenHeight: number;
    readonly baseWidth: number;
    readonly baseHeight: number;
    readonly game_created?: boolean;
    readonly isEditor?: boolean;
    readonly osd?: string;
    readonly closeGame: boolean;
    readonly connectFail?: boolean;
    readonly parent?: string;
}
export class World extends PacketHandler implements IConnectListener, ClockReadyListener {
    private connect: ConnectionService;
    private mMoveStyle: number = -1;
    private mSize: ISize;
    private mClock: Clock;
    private mHttpClock: HttpClock;
    private mHttpService: HttpService;
    private mConfig: ILogiclauncherConfig;
    private mAccount: Account;
    private mRoomManager: RoomManager;
    constructor(private mainPeer: MainPeer) {
        super();
    }
    public createAccount(gameID: string, worldID: string, sceneId?: number, loc?: any) {
        this.mAccount = new Account();
        this.mAccount.enterGame(gameID, worldID, sceneId, loc);
    }
    public initGameConfig(config: any) {
        this.mConfig = config;
    }
    public setConnect(connect: ConnectionService) {
        this.connect = connect;
        this.connect.addPacketListener(this);
    }
    public initWorld(desk: boolean) {
        this.mConfig.desktop = desk;
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT, this.onInitVirtualWorldPlayerInit);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_ERROR, this.onClientErrorHandler);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SELECT_CHARACTER, this.onSelectCharacter);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_GOTO_ANOTHER_GAME, this.onGotoAnotherGame);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_PONG, this.heartBeatCallBack);
        this.mRoomManager = new RoomManager(this);
        this.mUiManager = new UiManager(this);
        this.mMouseManager = new MouseManager(this);
        this.mElementStorage = new ElementStorage();
        this.mHttpService = new HttpService(this);
        this.mRoleManager = new RoleManager(this);
        this.mSoundManager = new SoundManager(this);
        this.mLoadingManager = new LoadingManager(this);
        this.mPlayerDataManager = new PlayerDataManager(this);

        this.mRoleManager.register();
        this.mRoomManager.addPackListener();
        this.mUiManager.addPackListener();
        this.mSoundManager.addPackListener();
        this.mPlayerDataManager.addPackListener();
        this.mAccount = new Account();
        this.mAccount.enterGame(this.mConfig.game_id, this.mConfig.virtual_world_id, null, null);
    }
    public initGame() {
        if (this.mRoomManager) this.mRoomManager.addPackListener();
        if (this.mUiManager) this.mUiManager.addPackListener();
        if (this.mRoleManager) this.mRoleManager.register();
        if (this.mSoundManager) this.mSoundManager.addPackListener();
        if (this.mPlayerDataManager) this.mPlayerDataManager.addPackListener();
        if (this.mElementStorage) {
            this.mElementStorage.on("SCENE_PI_LOAD_COMPELETE", this.loadSceneConfig);
        }
    }
    public showLoading() {
        this.mainPeer.showLoading();
    }
    public onConnected() {
        if (!this.mClock) this.mClock = new Clock(this.connect, this.mainPeer, this);
        if (!this.mHttpClock) this.mHttpClock = new HttpClock(this);
        // Logger.getInstance().info(`enterVirtualWorld`);
        this.mainPeer.enterVirtualWorld();
        // this.login();
    }
    public onDisConnected() {
        Logger.getInstance().log("app connectFail=====");
        if (this.isPause) return;
        if (this.mConfig.connectFail) {
            this.onError();
        } else {
            this.mainPeer.clearGame();
        }
    }
    public onError() {
        Logger.getInstance().log("socket error");
        if (!this.connect.connect) {
            if (this.mConfig.connectFail) {
                Logger.getInstance().log("app connectFail");
                if (this.mConfig.connectFail) return this.mainPeer.connectFail();
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
        this.mainPeer.loadSceneConfig(sceneID);
    }
    public clearGameComplete() {
        this.initWorld(this.mConfig.desktop || false);
    }
    public addFillEffect(pos: IPoint, status: op_def.PathReachableStatus) {
        this.mainPeer.addFillEffect(pos, status);
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
    public getGameConfig(): ILogiclauncherConfig {
        return this.mConfig;
    }
    public clearClock() {
        if (this.mClock) {
            this.mClock.destroy();
            this.mClock = null;
        }
        this.mClock = new Clock(this.connect, this.mainPeer, this);
    }
    public leaveScene(room: ILogicRoomService) {

    }

    public roomResume(roomID: number) {
        this.mainPeer.roomResume(roomID);
    }

    public roomPause(roomID: number) {
        this.mainPeer.roomPause(roomID);
    }

    onClockReady(): void {
        this.mainPeer.onClockReady();
    }

    syncClock(times: number = 1) {
        this.mClock.sync(times);
    }

    set moveStyle(moveStyle: number) {
        this.mainPeer.setMoveStyle(moveStyle);
    }

    get moveStyle(): number {
        return this.mMoveStyle;
    }

    get httpService(): HttpService {
        return this.mHttpService;
    }

    get account(): Account {
        return this.mAccount;
    }

    get peer(): MainPeer {
        return this.mainPeer;
    }

    get connection(): ConnectionService {
        return this.connect;
    }

    get clock(): Clock {
        return this.mClock;
    }

    private onGotoAnotherGame(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_GOTO_ANOTHER_GAME = packet.content;
        this.mainPeer.createAnotherGame(content.gameId, content.virtualWorldId, content.sceneId, content.loc.x, content.loc.y, content.loc.z);
    }

    private onInitVirtualWorldPlayerInit(packet: PBpacket) {
        // if (this.mClock) this.mClock.sync(); // Manual sync remote time.
        // TODO 进游戏前预加载资源
        const content: op_client.IOP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT = packet.content;
        const configUrls = content.configUrls;
        this.moveStyle = content.moveStyle;

        this.mClock.sync(-1);

        this.initgameConfigUrls(configUrls);
        const keyBoardPacket: PBpacket = new PBpacket();
        keyBoardPacket.Deserialization(new Buffer(content.keyEvents));
        if (!configUrls || configUrls.length <= 0) {
            Logger.getInstance().error(`configUrls error: , ${configUrls}, gameId: ${this.mAccount.gameID}`);
            this.mainPeer.createGame(keyBoardPacket);
            return;
        }
        Logger.getInstance().log(`mMoveStyle:${content.moveStyle}`);
        let game_id = this.mAccount.gameID;
        if (game_id.indexOf(".") > -1) {
            game_id = game_id.split(".")[1];
        }

        const mainGameConfigUrl = this.gameConfigUrl;

        this.mLoadingManager.start(LoadingTips.downloadGameConfig());
        // this.mConnection.loadRes([mainGameConfigUrl]);
        this.loadGameConfig(mainGameConfigUrl)
            .then((gameConfig: Lite) => {
                this.mElementStorage.setGameConfig(gameConfig);
                this.mainPeer.createGame(new Buffer(content.keyEvents));
                Logger.getInstance().debug("created game suc");
            })
            .catch((err: any) => {
                Logger.getInstance().log(err);
            });
    }

    private onSelectCharacter() {
        const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_CHARACTER_CREATED);
        this.mainPeer.send(pkt.Serialization());

        const i18Packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SET_LOCALE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_SET_LOCALE = i18Packet.content;
        content.localeCode = i18n.language;
        this.mainPeer.send(i18Packet.Serialization());
        this.mPlayerDataManager.querySYNC_ALL_PACKAGE();
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
