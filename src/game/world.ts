import "phaser";
import "dragonBones";
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
import {KeyBoardManager} from "./keyboard.manager";
import {MouseManager} from "./mouse.manager";
import {SelectManager} from "../rooms/player/select.manager";
import {Size} from "../utils/size";
import {IRoomService} from "../rooms/room";
import {MainUIScene} from "../scenes/main.ui";
import {Logger} from "../utils/log";
import {JoyStickManager} from "./joystick.manager";
import {ILauncherConfig} from "../../launcher";
import {ElementStorage, IElementStorage} from "./element.storage";
import {load} from "../utils/http";
import {ResUtils} from "../utils/resUtil";
import {Lite} from "game-capsule";
import IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = op_gateway.IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT;

export interface IGameConfig extends Phaser.Types.Core.GameConfig {
    auth_token: string;
    token_expire: string | null;
    token_fingerprint: string;
    server_addr: ServerAddress | undefined;
    game_id: string;
    virtual_world_id: string;
}
// TODO 这里有个问题，需要先连socket获取游戏初始化的数据，所以World并不是Phaser.Game 而是驱动 Phaser.Game的驱动器
// TODO 让World成为一个以socket连接为基础的类，因为没有连接就不运行游戏
// The World act as the global Phaser.World instance;
export class World extends PacketHandler implements IConnectListener, WorldService {
    private mConnection: ConnectionService | undefined;
    private mGame: Phaser.Game | undefined;
    private mRoomMamager: RoomManager;
    private mKeyBoardManager: KeyBoardManager;
    private mMouseManager: MouseManager;
    private mElementStorage: IElementStorage;
    private mJoyStickManager: JoyStickManager;
    private mGameConfig: IGameConfig;

    constructor(config: ILauncherConfig) {
        super();
        Logger.log(`World constructor......`);
        // Log.dir(config);
        // TODO 检测config内的必要参数如确实抛异常.
        if (!config.game_id) {
            throw new Error(`Config.game_id is required.`);
        }

        this.mGameConfig = {
            auth_token: config.auth_token,
            token_expire: config.token_expire,
            token_fingerprint: config.token_fingerprint,
            server_addr: config.server_addr,
            game_id: config.game_id,
            virtual_world_id: config.virtual_world_id
        };
        this.mConnection = new Connection(this);
        this.mConnection.addPacketListener(this);
        // add Packet listener.
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT, this.onInitVirtualWorldPlayerInit);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_ERROR, this.onClientErrorHandler);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SELECT_CHARACTER, this.onSelectCharacter);

        // this.mSize = new Size(config.width, config.height);

        this.mRoomMamager = new RoomManager(this);
        // this.mSelectCharacterManager = new SelectManager(this);
        this.mKeyBoardManager = new KeyBoardManager(this);
        this.mMouseManager = new MouseManager(this);
        this.mJoyStickManager = new JoyStickManager(this);
        this.mElementStorage = new ElementStorage();

        const gateway: ServerAddress = this.mGameConfig.server_addr || CONFIG.gateway;
        if (gateway) { // connect to game server.
            this.mConnection.startConnect(gateway);
        }
    }

    onConnected(connection?: SocketConnection): void {
        Logger.info(`enterVirtualWorld`);
        this.enterVirtualWorld();
    }

    onDisConnected(connection?: SocketConnection): void {

    }

    onError(reason: SocketConnectionError | undefined): void {

    }

    onClientErrorHandler(packet: PBpacket): void {
        const content: op_client.OP_GATEWAY_RES_CLIENT_ERROR = packet.content;
        Logger.error(`Remote Error[${content.responseStatus}]: ${content.msg}`);
    }

    /**
     * 当scene发生改变时，调用该方法并传入各个需要调整监听的manager中去
     */
    public changeRoom(room: IRoomService) {
        this.mKeyBoardManager.setRoom(room);
        this.mMouseManager.setRoom(room);
    }

    public getSize(): Size | undefined {
        if (!this.mGame) return;
        return this.mGame.scale.gameSize;
    }

    public resize(width: number, height: number) {
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

    get elementStorage(): IElementStorage | undefined {
        return this.mElementStorage;
    }

    get selectCharacterManager(): SelectManager | undefined {
        return this.selectCharacterManager;
    }

    get joyStickManager(): JoyStickManager | undefined {
        return this.mJoyStickManager;
    }

    get connection(): ConnectionService {
        return this.mConnection;
    }

    private onSelectCharacter() {
        const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_CHARACTER_CREATED);
        this.connection.send(pkt);
    }

    private enterVirtualWorld() {
        if (this.mGameConfig && this.mConnection) {
            const pkt: PBpacket = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT);
            const content: IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = pkt.content;
            Logger.log(`VW_id: ${this.mGameConfig.virtual_world_id}`);
            content.virtualWorldUuid = `${this.mGameConfig.virtual_world_id}`;
            content.gameId = this.mGameConfig.game_id;
            content.userToken = this.mGameConfig.auth_token;
            content.expire = this.mGameConfig.token_expire;
            content.fingerprint = this.mGameConfig.token_fingerprint;
            this.mConnection.send(pkt);
        }
    }

    private onInitVirtualWorldPlayerInit(packet: PBpacket) {
        // if (this.mClock) this.mClock.sync(); // Manual sync remote time.
        // TODO 进游戏前预加载资源
        const content: op_client.IOP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT = packet.content;
        const configUrls = content.configUrls;
        if (!configUrls || configUrls.length <= 0) {
            Logger.error(`configUrls error: , ${configUrls}, gameId: ${this.mGameConfig.game_id}`);
        }
        this.loadGameConfig(content.configUrls)
            .then((gameConfig: Lite) => {
                this.mElementStorage.setGameConfig(gameConfig);
                this.createGame();
            })
            .catch((err) => {
                Logger.log(err);
            });
        // console.dir(content);
    }

    private createGame() {
        // start the game. TODO 此方法会多次调用，所以先要卸载已经实例化的游戏再new！
        if (this.mGame) {
            this.mGame.destroy(true);
        }
        this.mGameConfig.type = Phaser.AUTO;
        this.mGameConfig.zoom = 1;
        this.mGameConfig.width = window.innerWidth; // document.documentElement.clientWidth;
        this.mGameConfig.height = window.innerHeight; // document.documentElement.clientHeight;
        this.mGameConfig.parent = "game";
        this.mGameConfig.scene = [];
        this.mGameConfig.url = "";
        this.mGameConfig.disableContextMenu = true;
        this.mGameConfig.transparent = false;
        this.mGameConfig.backgroundColor = 0x0;
        this.mGameConfig.resolution = 1;
        this.mGameConfig.version = "";
        this.mGameConfig.seed = [];
        this.mGameConfig.plugins = {
            scene: [
                {
                    key: "DragonBones",
                    plugin: dragonBones.phaser.plugin.DragonBonesScenePlugin,
                    mapping: "dragonbone",
                }
            ]
        };
        this.mGameConfig.render = {
            pixelArt: true,
            roundPixels: true
        };
        this.mGame = new Game(this.mGameConfig);
        this.mGame.scene.add(LoadingScene.name, LoadingScene);
        // this.mGame.scene.add(SelectCharacter.name, SelectCharacter);
        this.mGame.scene.add(PlayScene.name, PlayScene);
        this.mGame.scene.add(MainUIScene.name, MainUIScene);
        this.mGame.events.on(Phaser.Core.Events.FOCUS, this.onFocus, this);
        this.mGame.events.on(Phaser.Core.Events.BLUR, this.onBlur, this);
        this.gameCreated();
    }

    private gameCreated() {
        if (this.connection) {
            const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_GAME_CREATED);
            this.connection.send(pkt);
        } else {
            Logger.error("connection is undefined");
        }
    }

    private loadGameConfig(paths: string[]): Promise<Lite> {
        const promises = [];
        for (const path of paths) {
            promises.push(load(ResUtils.getGameConfig(path), "arraybuffer"));
        }
        // TODO Promise.all如果其中有一个下载失败，会返回error
        return Promise.all(promises)
        .then((reqs: any[]) => {
            return this.decodeConfigs(reqs);
        });
    }

    private decodeConfigs(reqs: any[]): Promise<Lite> {
        return new Promise((resolve, reject) => {
            for (const req of reqs) {
                const arraybuffer = req.response;
                if (arraybuffer) {
                    try {
                        const gameConfig = new Lite();
                        gameConfig.deserialize(new Uint8Array(arraybuffer));
                        resolve(gameConfig);
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    reject("error");
                }
            }
        });
    }

    private onFocus() {
        if (this.connection) {
            const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS);
            const context: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS = pkt.content;
            context.gameStatus = op_def.GameStatus.Focus;
            this.connection.send(pkt);
        } else {
            Logger.error("connection is undefined");
        }
    }

    private onBlur() {
        if (this.connection) {
            const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS);
            const context: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS = pkt.content;
            context.gameStatus = op_def.GameStatus.Blur;
            this.connection.send(pkt);
        } else {
            Logger.error("connection is undefined");
        }
    }
}
