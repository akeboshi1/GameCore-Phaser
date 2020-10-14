import { PBpacket, PacketHandler, Buffer } from "net-socket-packet";
import { MainPeer } from "./main.peer";
import { op_def, op_client, op_virtual_world } from "pixelpai_proto";
import { IPoint, Lite } from "game-capsule";
import { ConnectionService } from "../../lib/net/connection.service";
import { IConnectListener } from "../../lib/net/socket";
import { Logger } from "../utils/log";
import { i18n } from "../utils/i18n";
import { ResUtils } from "../utils/resUtil";
import { UiManager } from "./ui/ui.manager";
import { ElementStorage } from "./elementstorage/element.storage";
import { RoomManager } from "./room/roomManager/room.manager";
import { PlayerDataManager } from "./actor/data/player.dataManager";
import { IRoomService } from "./room/roomManager/room/room";
import { Connection, ConnListener, GameSocket } from "./net/connection";
import { CreateRoleManager } from "./uimanager/createrole/create.role.manager";
import { SoundManager } from "./soundmanager/sound.manager";
import { Clock, ClockReadyListener } from "./loop/clock/clock";
import { HttpClock } from "./loop/httpClock/http.clock";
import { HttpService } from "./loop/httpClock/http.service";
import { Tool } from "../utils/tool";
import { LoadingManager } from "./loading/loading.manager";
import { LoadingTips } from "../game/loading/loading.tips";
import { load } from "../utils/http";
import { ILauncherConfig } from "../structureinterface/lanucher.config";
import { ServerAddress } from "../../lib/net/address";
interface ISize {
    width: number;
    height: number;
}
export class Game extends PacketHandler implements IConnectListener, ClockReadyListener {
    private connect: ConnectionService;
    private mSocket: GameSocket;
    private mUiManager: UiManager;
    private mMoveStyle: number = -1;
    private mSize: ISize;
    private mClock: Clock;
    private mHttpClock: HttpClock;
    private mHttpService: HttpService;
    private mConfig: ILauncherConfig;
    private mAccount: Account;
    private mRoomManager: RoomManager;
    private mElementStorage: ElementStorage;
    private mPlayerDataManager: PlayerDataManager;
    private mCreateRoleManager: CreateRoleManager;
    private mSoundManager: SoundManager;
    private mLoadingManager: LoadingManager;
    private mainPeer: MainPeer;
    private gameConfigUrls: Map<string, string> = new Map();
    private gameConfigUrl: string;
    constructor() {
        super();
        this.mainPeer = new MainPeer(this);
        this.mSocket = new GameSocket(this.mainPeer, new ConnListener(this.mainPeer));
        this.connect = new Connection(this.mSocket);
    }
    get scaleRatio(): number {
        return this.mConfig.devicePixelRatio;
    }
    public createGame(config?: ILauncherConfig) {
        this.mConfig = config;
        const gateway: ServerAddress = this.mConfig.server_addr || CONFIG.gateway;
        if (gateway) {
            // connect to game server.
            this.mainPeer.startConnect(gateway.host, gateway.port, gateway.secure);
        }
    }
    public createAccount(gameID: string, worldID: string, sceneId?: number, loc?: any) {
        this.mAccount = new Account();
        this.mAccount.enterGame(gameID, worldID, sceneId, loc);
    }

    // public setConnect(connect: ConnectionService) {
    //     this.connect = connect;
    //     this.connect.addPacketListener(this);
    // }
    public initWorld(desk: boolean) {
        this.mConfig.desktop = desk;
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT, this.onInitVirtualWorldPlayerInit);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_ERROR, this.onClientErrorHandler);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SELECT_CHARACTER, this.onSelectCharacter);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_GOTO_ANOTHER_GAME, this.onGotoAnotherGame);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_PONG, this.heartBeatCallBack);
        this.mRoomManager = new RoomManager(this);
        this.mUiManager = new UiManager(this);
        this.mElementStorage = new ElementStorage();
        this.mHttpService = new HttpService(this);
        this.mCreateRoleManager = new CreateRoleManager(this);
        this.mSoundManager = new SoundManager(this);
        this.mLoadingManager = new LoadingManager(this);
        this.mPlayerDataManager = new PlayerDataManager(this);

        this.mCreateRoleManager.register();
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
        if (this.mCreateRoleManager) this.mCreateRoleManager.register();
        if (this.mSoundManager) this.mSoundManager.addPackListener();
        if (this.mPlayerDataManager) this.mPlayerDataManager.addPackListener();
        // if (this.mElementStorage) {
        //     this.mElementStorage.on("SCENE_PI_LOAD_COMPELETE", this.loadSceneConfig);
        // }
    }
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
        this.initWorld(this.mConfig.desktop || false);
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
    public leaveScene(room: IRoomService) {

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

    get socket(): GameSocket {
        return this.mSocket;
    }

    get uiManager(): UiManager {
        return this.mUiManager;
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

    private onGotoAnotherGame(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_GOTO_ANOTHER_GAME = packet.content;
        this.mainPeer.render.createAnotherGame(content.gameId, content.virtualWorldId, content.sceneId, content.loc.x, content.loc.y, content.loc.z);
    }

    private onInitVirtualWorldPlayerInit(packet: PBpacket) {
        // if (this.mClock) this.mClock.sync(); // Manual sync remote time.
        // TODO 进游戏前预加载资源
        const content: op_client.IOP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT = packet.content;
        const configUrls = content.configUrls;
        this.moveStyle = content.moveStyle;

        this.mClock.sync(-1);

        this.initgameConfigUrls(configUrls);
        // const keyBoardPacket: PBpacket = new PBpacket();
        // keyBoardPacket.Deserialization(new Buffer(content.keyEvents));
        if (!configUrls || configUrls.length <= 0) {
            Logger.getInstance().error(`configUrls error: , ${configUrls}, gameId: ${this.mAccount.gameID}`);
            this.mainPeer.render.createGameCallBack(content);
            return;
        }
        Logger.getInstance().log(`mMoveStyle:${content.moveStyle}`);
        let game_id = this.mAccount.gameID;
        if (game_id.indexOf(".") > -1) {
            game_id = game_id.split(".")[1];
        }

        const mainGameConfigUrl = this.gameConfigUrls;

        this.mLoadingManager.start(LoadingTips.downloadGameConfig());
        // this.mConnection.loadRes([mainGameConfigUrl]);
        this.loadGameConfig(mainGameConfigUrl)
            .then((gameConfig: Lite) => {
                this.mElementStorage.setGameConfig(gameConfig);
                this.mainPeer.render.createGameCallBack(content);
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
