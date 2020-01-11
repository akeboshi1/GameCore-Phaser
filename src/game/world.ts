import "phaser";
import "dragonBones";
import { WorldService } from "./world.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { Game } from "phaser";
import { IConnectListener, SocketConnection, SocketConnectionError } from "../net/socket";
import { ConnectionService } from "../net/connection.service";
import { op_client, op_def, op_gateway, op_virtual_world } from "pixelpai_proto";
import Connection from "../net/connection";
import { LoadingScene } from "../scenes/loading";
import { PlayScene } from "../scenes/play";
import { RoomManager } from "../rooms/room.manager";
import { ServerAddress } from "../net/address";
import { KeyBoardManager } from "./keyboard.manager";
import { MouseManager } from "./mouse.manager";
import { Size } from "../utils/size";
import { IRoomService } from "../rooms/room";
import { MainUIScene } from "../scenes/main.ui";
import { Logger } from "../utils/log";
import { JoyStickManager } from "./joystick.manager";
import { GameMain, ILauncherConfig } from "../../launcher";
import { ElementStorage, IElementStorage } from "./element.storage";
import { load } from "../utils/http";
import { ResUtils, Url } from "../utils/resUtil";
import { Lite } from "game-capsule";
import { UiManager } from "../ui/ui.manager";
import NinePatchPlugin from "../../lib/rexui/plugins/ninepatch-plugin.js";
import InputTextPlugin from "../../lib/rexui/plugins/inputtext-plugin.js";
import BBCodeTextPlugin from "../../lib/rexui/plugins/bbcodetext-plugin.js";
import MoveToPlugin from "../../lib/rexui/plugins/moveto-plugin.js";
import ButtonPlugin from "../../lib/rexui/plugins/button-plugin.js";
import UIPlugin from "../../lib/rexui/templates/ui/ui-plugin.js";
import { InputManager } from "./input.service";
import { PI_EXTENSION_REGEX } from "../const/constants";
import { LoginScene } from "../scenes/login";
import { Account } from "./account";
import IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = op_gateway.IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT;
import { HttpService } from "../net/http.service";
import { GamePauseScene } from "../scenes/gamepause";
import { EditScene } from "../scenes/edit";
import { Clock, ClockReadyListener } from "../rooms/clock";
// The World act as the global Phaser.World instance;
export class World extends PacketHandler implements IConnectListener, WorldService, GameMain, ClockReadyListener {
    public static SCALE_CHANGE: string = "scale_change";
    private mClock: Clock;
    private mConnection: ConnectionService | undefined;
    private mGame: Phaser.Game | undefined;
    private mRoomMamager: RoomManager;
    private mMouseManager: MouseManager;
    private mElementStorage: IElementStorage;
    private mUiManager: UiManager;
    private mConfig: ILauncherConfig;
    private mCallBack: Function;
    private mInputManager: InputManager;
    private mGameEmitter: Phaser.Events.EventEmitter;
    private mHttpService: HttpService;
    private mAccount: Account;
    private gameConfig: Phaser.Types.Core.GameConfig;
    constructor(config: ILauncherConfig, callBack?: Function) {
        super();
        this.mCallBack = callBack;
        this.mConfig = config;
        // TODO 检测config内的必要参数如确实抛异常.
        if (!config.game_id) {
            throw new Error(`Config.game_id is required.`);
        }
        Url.OSD_PATH = this.mConfig.osd || CONFIG.osd;
        this._newGame();
        this.mConnection = config.connection || new Connection(this);
        this.mConnection.addPacketListener(this);

        this.mClock = new Clock(this.mConnection, this);

        // add Packet listener.
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT, this.onInitVirtualWorldPlayerInit);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_ERROR, this.onClientErrorHandler);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SELECT_CHARACTER, this.onSelectCharacter);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_GOTO_ANOTHER_GAME, this.onGotoAnotherGame);
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_PONG, this.heartBeatCallBack);

        this.mGameEmitter = new Phaser.Events.EventEmitter();
        this.mRoomMamager = new RoomManager(this);
        this.mUiManager = new UiManager(this);
        this.mMouseManager = new MouseManager(this);
        this.mElementStorage = new ElementStorage();
        this.mHttpService = new HttpService(this);

        this.mRoomMamager.addPackListener();
        this.mUiManager.addPackListener();

        const gateway: ServerAddress = this.mConfig.server_addr || CONFIG.gateway;
        if (gateway) { // connect to game server.
            this.mConnection.startConnect(gateway);
        }

        if (config.isEditor) {
            this.createGame();
        }
    }

    getConfig(): ILauncherConfig {
        return this.mConfig;
    }

    destroy(): void {
        this.mConnection.closeConnect();
        this.mClock.destroy();
        this.clearGame();
    }

    onConnected(connection?: SocketConnection): void {
        Logger.getInstance().info(`enterVirtualWorld`);
        this.enterVirtualWorld();
        // this.login();
    }

    onDisConnected(connection?: SocketConnection): void {

    }

    onError(reason: SocketConnectionError | undefined): void {

    }

    onClientErrorHandler(packet: PBpacket): void {
        const content: op_client.OP_GATEWAY_RES_CLIENT_ERROR = packet.content;
        Logger.getInstance().error(`Remote Error[${content.responseStatus}]: ${content.msg}`);
    }

    /**
     * 当scene发生改变时，调用该方法并传入各个需要调整监听的manager中去
     */
    public changeRoom(room: IRoomService) {
        if (this.mGame.device.os.desktop) {
            this.mInputManager.onRoomChanged(room);
        }
        this.mMouseManager.changeRoom(room);
    }

    public getSize(): Size | undefined {
        if (!this.mGame) return;
        return this.mGame.scale.gameSize;
    }

    public scaleChange(scale: number) {
        this.emitter.emit(World.SCALE_CHANGE);
    }

    public closeGame() {
        if (this.mConfig.closeGame) {
            this.destroy();
            this.mConfig.closeGame();
        }
    }

    public resize(width: number, height: number) {
        if (this.mGame) {
            if (!this.mGame.device.os.desktop) {
                if (width < height) {
                    this.mConfig.ui_scale = width / this.mConfig.baseHeight * 2;
                    this.mGame.scale.orientation = Phaser.Scale.Orientation.PORTRAIT;
                    Logger.getInstance().debug("portrait:", width, height);
                } else if (width > height) {
                    this.mConfig.ui_scale = width / this.mConfig.baseWidth * 2;
                    this.mGame.scale.orientation = Phaser.Scale.Orientation.LANDSCAPE;
                    Logger.getInstance().debug("landscape:", width, height);
                }
            }
            this.mGame.scale.resize(width, height);
        }

        if (this.mRoomMamager) {
            this.mRoomMamager.resize(width, height);
        }
        if (this.mUiManager) {
            this.mUiManager.resize(width, height);
        }
        if (this.mInputManager) {
            this.mInputManager.resize(width, height);
        }
    }

    public startFullscreen() {
        if (!this.mGame) {
            Logger.getInstance().warn("game does not exist!");
            return;
        }
        this.mGame.scale.startFullscreen();
    }

    public stopFullscreen() {
        if (!this.mGame) {
            Logger.getInstance().warn("game does not exist!");
            return;
        }
        this.mGame.scale.stopFullscreen();
    }

    public onGotoAnotherGame(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_GOTO_ANOTHER_GAME = packet.content;
        this.clearGame();
        this.mConfig.game_id = content.gameId;
        this.mConfig.virtual_world_id = content.virtualWorldId;
        this._newGame();
        this.loginEnterWorld();
    }

    public changeScene() {
        const gameID: string = this.mConfig.game_id;
        const worldID: string = this.mConfig.virtual_world_id;
        this.clearGame();
        this.mConfig.game_id = gameID;
        this.mConfig.virtual_world_id = worldID;
        this._newGame();
        this.loginEnterWorld();
    }

    public reconnect() {
        const gameID: string = this.mConfig.game_id;
        const worldID: string = this.mConfig.virtual_world_id;
        this.clearGame();
        this.mConfig.game_id = gameID;
        this.mConfig.virtual_world_id = worldID;
        // this._newGame();
        // this.mRoomMamager.addPackListener();
        // this.mUiManager.addPackListener();
        this.loginEnterWorld();
    }

    public startHeartBeat() {
        const pkt: PBpacket = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_GATEWAY_PING);
        this.mConnection.send(pkt);
        this.mClock.sync(-1);
    }

    get uiScale(): number {
        if (this.mConfig)
            return this.mConfig.ui_scale;
        return 1;
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

    get uiManager(): UiManager | undefined {
        return this.mUiManager;
    }

    get mouseManager(): MouseManager {
        return this.mMouseManager;
    }

    get inputManager(): InputManager | undefined {
        return this.mInputManager;
    }

    get connection(): ConnectionService {
        return this.mConnection;
    }

    get clock(): Clock {
        return this.mClock;
    }

    get emitter(): Phaser.Events.EventEmitter {
        return this.mGameEmitter;
    }

    get httpService(): HttpService {
        return this.mHttpService;
    }

    get account(): Account {
        return this.mAccount;
    }

    public enableClick() {
        this.pauseScene();
    }

    public disableClick() {
        this.resumeScene();
    }

    public getGameConfig(): Phaser.Types.Core.GameConfig {
        return this.gameConfig;
    }

    public onClockReady(): void {
        if (this.mInputManager) this.mInputManager.enable = true;
    }
    private onSelectCharacter() {
        const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_CHARACTER_CREATED);
        this.connection.send(pkt);
    }

    private clearGame() {
        if (this.mGame) {
            this.mGame.plugins.removeGlobalPlugin("rexButton");
            this.mGame.plugins.removeGlobalPlugin("rexNinePatchPlugin");
            this.mGame.plugins.removeGlobalPlugin("rexInputText");
            this.mGame.plugins.removeGlobalPlugin("rexBBCodeTextPlugin");
            this.mGame.plugins.removeScenePlugin("DragonBones");
            this.mGame.plugins.removeScenePlugin("rexUI");
            this.mGameEmitter.destroy();
            this.roomManager.destroy();
            this.uiManager.destroy();
            this.mGame.destroy(true);
            this.mGame = null;
        }
    }

    private heartBeatCallBack() {
        this.mConnection.clearHeartBeat();
    }

    private initUiScale() {
        const width: number = this.mConfig.width;
        const height: number = this.mConfig.height;
        const baseWidth: number = this.mConfig.baseWidth;
        const baseHeight: number = this.mConfig.baseHeight;
        if (!this.mGame.device.os.desktop) {
            if (width < height) {
                this.mConfig.ui_scale = width / baseHeight * 2;
                this.mGame.scale.orientation = Phaser.Scale.Orientation.PORTRAIT;
            } else if (width > height) {
                this.mConfig.ui_scale = width / baseWidth * 2;
                this.mGame.scale.orientation = Phaser.Scale.Orientation.LANDSCAPE;
            }
        }
    }

    private login() {
        if (!this.mGame.scene.getScene(LoginScene.name)) {
            this.mGame.scene.add(LoginScene.name, LoginScene);
        }
        this.mGame.scene.start(LoginScene.name, {
            connect: this.mConnection,
            world: this,
            callBack: () => {
                this.loginEnterWorld();
                const loginScene: LoginScene = this.mGame.scene.getScene(LoginScene.name) as LoginScene;
                loginScene.remove();
                this.mGame.scene.start(LoadingScene.name, { world: this });
            },
        });
    }

    private enterVirtualWorld() {
        if (this.mConfig && this.mConnection) {
            this.mAccount = new Account();
            const loadingScene: LoadingScene = this.mGame.scene.getScene(LoadingScene.name) as LoadingScene;
            if (!loadingScene) {
                this.mGame.scene.add(LoadingScene.name, LoadingScene);
            }
            if (!this.mConfig.auth_token) {
                this.login();
                return;
            } else {
                this.mGame.scene.start(LoadingScene.name, { world: this });
                this.mAccount.setAccount({
                    token: this.mConfig.auth_token,
                    expire: this.mConfig.token_expire,
                    fingerprint: this.mConfig.token_fingerprint
                });
            }
            this.loginEnterWorld();
        }
    }

    private loginEnterWorld() {
        const pkt: PBpacket = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT);
        const content: IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = pkt.content;
        Logger.getInstance().log(`VW_id: ${this.mConfig.virtual_world_id}`);
        content.virtualWorldUuid = `${this.mConfig.virtual_world_id}`;
        if (!this.mConfig.game_id || !this.mAccount || !this.mAccount.accountData || !this.mAccount.accountData.token || !this.mAccount.accountData.expire || !this.mAccount.accountData.fingerprint) {
            Logger.getInstance().debug("缺少必要参数，无法登录游戏");
            if (this.mGame) this.mGame.destroy(true);
            return;
        }
        content.gameId = this.mConfig.game_id;
        // const accountObj = JSON.parse();
        content.userToken = this.mAccount.accountData.token; // auth_token;
        content.expire = this.mAccount.accountData.expire + "";
        content.fingerprint = this.mAccount.accountData.fingerprint;
        this.mConnection.send(pkt);
    }

    private onInitVirtualWorldPlayerInit(packet: PBpacket) {
        // if (this.mClock) this.mClock.sync(); // Manual sync remote time.
        // TODO 进游戏前预加载资源
        const content: op_client.IOP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT = packet.content;
        const configUrls = content.configUrls;
        if (!configUrls || configUrls.length <= 0) {
            Logger.getInstance().error(`configUrls error: , ${configUrls}, gameId: ${this.mConfig.game_id}`);
            this.createGame(content.keyEvents);
            return;
        }
        // Logger.log("start download gameConfig");
        this.loadGameConfig(content.configUrls)
            .then((gameConfig: Lite) => {
                this.mElementStorage.setGameConfig(gameConfig);
                this.createGame(content.keyEvents);
                Logger.getInstance().debug("created game suc");
            })
            .catch((err) => {
                Logger.getInstance().log(err);
            });
    }

    private _newGame(): Phaser.Game {
        if (this.mGame) {
            return this.mGame;
        }
        this.gameConfig = {
            type: Phaser.AUTO,
            zoom: 1,
            parent: this.mConfig.parent || "game",
            scene: null,
            disableContextMenu: true,
            transparent: false,
            backgroundColor: 0x0,
            resolution: 1,
            fps: {
                target: 30
            },
            dom: {
                createContainer: true
            },
            plugins: {
                global: [{
                    key: "rexButton",
                    plugin: ButtonPlugin,
                    start: true
                },
                {
                    key: "rexNinePatchPlugin",
                    plugin: NinePatchPlugin,
                    start: true
                },
                {
                    key: "rexInputText",
                    plugin: InputTextPlugin,
                    start: true
                },
                {
                    key: "rexBBCodeTextPlugin",
                    plugin: BBCodeTextPlugin,
                    start: true
                },
                {
                    key: "rexMoveTo",
                    plugin: MoveToPlugin,
                    start: true
                }],
                scene: [
                    {
                        key: "DragonBones",
                        plugin: dragonBones.phaser.plugin.DragonBonesScenePlugin,
                        mapping: "dragonbone",
                    },
                    { key: "rexUI", plugin: UIPlugin, mapping: "rexUI" }
                ]
            },
            render: {
                pixelArt: true,
                roundPixels: true
            }
        };
        Object.assign(this.gameConfig, this.mConfig);
        this.mGame = new Game(this.gameConfig);
        this.initUiScale();
        if (this.mRoomMamager) this.mRoomMamager.addPackListener();
        if (this.mUiManager) this.mUiManager.addPackListener();
        return this.mGame;
    }

    private createGame(keyEvents?: op_def.IKeyCodeEvent[]) {
        // start the game. TODO 此方法会多次调用，所以先要卸载已经实例化的游戏再new！
        this._newGame();
        // this.mGame.scene.add(PlayScene.name, PlayScene);
        this.mGame.scene.add(MainUIScene.name, MainUIScene);
        this.mGame.scene.add(EditScene.name, EditScene);
        this.mGame.events.on(Phaser.Core.Events.FOCUS, this.onFocus, this);
        this.mGame.events.on(Phaser.Core.Events.BLUR, this.onBlur, this);
        if (this.mGame.device.os.desktop) {
            this.mInputManager = new KeyBoardManager(this, keyEvents);
        } else {
            this.mInputManager = new JoyStickManager(this, keyEvents);
        }
        this.mInputManager.enable = false;
        this.resize(this.mConfig.width, this.mConfig.height);
        this.gameCreated();
    }

    private gameCreated() {
        if (this.connection) {
            const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_GAME_CREATED);
            this.connection.send(pkt);
            if (this.mCallBack) {
                this.mCallBack();
            }
            if (this.mConfig.game_created) {
                this.mConfig.game_created();
            }
        } else {
            Logger.getInstance().error("connection is undefined");
        }
    }

    private loadGameConfig(paths: string[]): Promise<Lite> {
        const promises = [];
        let configPath = "";
        for (const path of paths) {
            if (PI_EXTENSION_REGEX.test(path)) {
                configPath = ResUtils.getGameConfig(path);
                Logger.getInstance().log(`start download config: ${configPath}`);
                promises.push(load(configPath, "arraybuffer"));
            }
        }
        // TODO Promise.all如果其中有一个下载失败，会返回error
        return Promise.all(promises)
            .then((reqs: any[]) => {
                Logger.getInstance().log("start decodeConfig");
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
            // 同步心跳
            this.mClock.sync(-1);
            this.resumeScene();
        } else {
            Logger.getInstance().error("connection is undefined");
        }
    }

    private onBlur() {
        if (this.connection) {
            const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS);
            const context: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS = pkt.content;
            context.gameStatus = op_def.GameStatus.Blur;
            this.connection.send(pkt);
            this.pauseScene();
        } else {
            Logger.getInstance().error("connection is undefined");
        }
    }

    private resumeScene() {
        if (this.mConfig.isEditor) {
            return;
        }
        this.mRoomMamager.onFocus();
        const pauseScene: Phaser.Scene = this.mGame.scene.getScene(GamePauseScene.name);
        if (pauseScene) {
            this.mGame.scene.stop(GamePauseScene.name);
        }
    }

    private pauseScene() {
        if (this.mConfig.isEditor) {
            return;
        }
        this.mRoomMamager.onBlur();
        if (!this.mGame.scene.getScene(GamePauseScene.name)) {
            this.mGame.scene.add(GamePauseScene.name, GamePauseScene);
        }
        this.mGame.scene.start(GamePauseScene.name, { world: this });
    }
}
