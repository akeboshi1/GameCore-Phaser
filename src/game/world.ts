import "phaser";
import {WorldService} from "./world.service";
import {PacketHandler, PBpacket} from "net-socket-packet";
import {Game} from "phaser";
import {IConnectListener, SocketConnection, SocketConnectionError} from "../net/socket";
import {ConnectionService} from "../net/connection.service";
import {op_client, op_def, op_gateway, op_virtual_world} from "pixelpai_proto";
import Connection from "../net/connection";
import {LoadingScene} from "../scenes/loading";
import {PlayScene} from "../scenes/play";
import {RoomManager} from "../rooms/room.manager";
import {ServerAddress} from "../net/address";
import {IGameConfigure} from "../../launcher";
import {KeyBoardManager} from "./keyboard.manager";
import {MouseManager} from "./mouse.manager";
import {SelectManager} from "../rooms/player/select.manager";
import {Size} from "../utils/size";
import {IRoomService} from "../rooms/room";
import {MainUIScene} from "../scenes/main.ui";
import {Clock} from "./clock";
import {Console} from "../utils/log";
import {GameConfigService} from "../config/gameconfig.service";
import {GameConfigManager} from "../config/gameconfig.manager";
import {Lite} from "game-capsule";
import {IConfigObject} from "game-capsule/lib/configobjects/config_object";
import IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = op_gateway.IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT;

// TODO 这里有个问题，需要先连socket获取游戏初始化的数据，所以World并不是Phaser.Game 而是驱动 Phaser.Game的驱动器
// TODO 让World成为一个以socket连接为基础的类，因为没有连接就不运行游戏
// The World act as the global Phaser.World instance;
export class World extends PacketHandler implements IConnectListener, WorldService {
    private mConnection: ConnectionService | undefined;
    private mGame: Phaser.Game | undefined;
    private mConfig: IGameConfigure | undefined;
    private mRoomMamager: RoomManager;
    private mKeyBoardManager: KeyBoardManager;
    private mMouseManager: MouseManager;
    private mGameConfigService: GameConfigService;
    private mSize: Size;
    private mGameConfig: Lite;

    private mClock: Clock;

    constructor(config: IGameConfigure) {
        super();
        Console.log(`World constructor......`);
        // Log.dir(config);
        // TODO 检测config内的必要参数如确实抛异常.
        if (!config.game_id) {
            throw new Error(`Config.game_id is required.`);
        }

        this.mConfig = config;
        this.mConnection = new Connection(this);
        this.mConnection.addPacketListener(this);
        // add Packet listener.
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT, this.onInitVirtualWorldPlayerInit);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_ERROR, this.onClientErrorHandler);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SELECT_CHARACTER, this.onSelectCharacter);

        // ================todo opcode
        // this.addHandlerFun(0, this.startSelectManager);
        // this.addHandlerFun(1, this.startRoomManager);
        // this.addHandlerFun(2, this.stopSelectManager);
        // this.addHandlerFun(3, this.stopRoomManager);

        this.mSize = new Size();
        this.mSize.setSize(window.innerWidth, window.innerHeight);

        const gateway: ServerAddress = this.mConfig.server_addr || CONFIG.gateway;

        this.mRoomMamager = new RoomManager(this);
        // this.mSelectCharacterManager = new SelectManager(this);
        this.mKeyBoardManager = new KeyBoardManager(this);
        this.mMouseManager = new MouseManager(this);
        this.mGameConfigService = new GameConfigManager(this);

        if (gateway) { // connect to game server.
            this.mConnection.startConnect(gateway);
        }
    }

    onConnected(connection?: SocketConnection): void {
        Console.info(`enterVirtualWorld`);
        this.enterVirtualWorld();

        // Start clock
        this.mClock = new Clock(this.mConnection);
    }

    onDisConnected(connection?: SocketConnection): void {

    }

    onError(reason: SocketConnectionError | undefined): void {

    }

    onClientErrorHandler(packet: PBpacket): void {
        const content: op_client.OP_GATEWAY_RES_CLIENT_ERROR = packet.content;
        Console.error(`Remote Error[${content.responseStatus}]: ${content.msg}`);
    }

    public getServerTime(): number {
        return this.mClock.unixTime;
    }

    /**
     * 当scene发生改变时，调用该方法并传入各个需要调整监听的manager中去
     */
    public changeRoom(room: IRoomService) {
        this.mKeyBoardManager.setRoom(room);
        this.mMouseManager.setRoom(room);
    }

    public getConfigObject(id: number): IConfigObject {
        if (!this.mGameConfig) {
            Console.error(`gameConfig does not exist`);
            return;
        }
        return this.mGameConfig.getObject(id);
    }

    public getSize(): Size {
        return this.mSize;
    }

    public resize(width: number, height: number) {
        this.mSize.setSize(width, height);
        if (this.mGame) {
            this.mGame.scale.resize(width, height);
        }
        if (this.mRoomMamager) {
            this.mRoomMamager.resize(width, height);
        }
        // TODO manager.resize
    }

    get game(): Phaser.Game | undefined {
        return this.mGame;
    }

    get roomManager(): RoomManager | undefined {
        return this.mRoomMamager;
    }

    get gameConfigService(): GameConfigService | undefined {
        return this.mGameConfigService;
    }

    get selectCharacterManager(): SelectManager | undefined {
        return this.selectCharacterManager;
    }

    get connection(): ConnectionService {
        return this.mConnection;
    }

    private onSelectCharacter() {
        const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_CHARACTER_CREATED);
        this.connection.send(pkt);
    }

    private enterVirtualWorld() {
        if (this.mConfig && this.mConnection) {
            const pkt: PBpacket = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT);
            const content: IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = pkt.content;
            Console.log(`VW_id: ${this.mConfig.virtual_world_id}`);
            content.virtualWorldUuid = `${this.mConfig.virtual_world_id}`;
            content.gameId = this.mConfig.game_id;
            content.userToken = this.mConfig.auth_token;
            content.expire = this.mConfig.token_expire;
            content.fingerprint = this.mConfig.token_fingerprint;
            this.mConnection.send(pkt);
        }
    }

    private onInitVirtualWorldPlayerInit(packet: PBpacket) {
        // TODO 进游戏前预加载资源
        const content: op_client.IOP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT = packet.content;
        const configUrls = content.configUrls;
        if (!configUrls || configUrls.length <= 0) {
            Console.error(`configUrls error: , ${configUrls}, gameId: ${this.mConfig.game_id}`);
        }
        this.mGameConfigService.load(content.configUrls)
            .then(() => {
                this.createGame();
            })
            .catch((err) => {
                Console.log(err);
            });
        // console.dir(content);
    }

    private createGame() {
        // start the game. TODO 此方法会多次调用，所以先要卸载已经实例化的游戏再new！
        if (this.mGame) {
            this.mGame.destroy(true);
        }
        this.mGame = new Game(this.mConfig);
        this.mGame.scene.add(LoadingScene.name, LoadingScene);
        // this.mGame.scene.add(SelectCharacter.name, SelectCharacter);
        this.mGame.scene.add(PlayScene.name, PlayScene);
        this.mGame.scene.add(MainUIScene.name, MainUIScene);
        this.mGame.events.on(Phaser.Core.Events.FOCUS, this.onFocus, this);
        this.mGame.events.on(Phaser.Core.Events.BLUR, this.onBlur, this);
        this.mSize.setSize(this.mGame.scale.width, this.mGame.scale.height);
        this.gameCreated();
    }

    private gameCreated() {
        if (this.connection) {
            const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_GAME_CREATED);
            this.connection.send(pkt);
        } else {
            Console.error("connection is undefined");
        }
    }

    private loadConfig(paths: string[]) {
    }

    private onFocus() {
        if (this.connection) {
            const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS);
            const context: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS = pkt.content;
            context.gameStatus = op_def.GameStatus.Focus;
            this.connection.send(pkt);
        } else {
            Console.error("connection is undefined");
        }
    }

    private onBlur() {
        if (this.connection) {
            const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS);
            const context: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS = pkt.content;
            context.gameStatus = op_def.GameStatus.Blur;
            this.connection.send(pkt);
        } else {
            Console.error("connection is undefined");
        }
    }
}
