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
import { Logger } from "../utils/log";
import { RoomManager } from "../rooms/room.manager";
import { ServerAddress } from "../net/address";
import { KeyBoardManager } from "./keyboard.manager";
import { MouseManager } from "./mouse.manager";
import { Size } from "../utils/size";
import { IRoomService } from "../rooms/room";
import { MainUIScene } from "../scenes/main.ui";
import { JoyStickManager } from "./joystick.manager";
import { GameMain, ILauncherConfig } from "../../launcher";
import { ElementStorage, IElementStorage } from "./element.storage";
import { load } from "../utils/http";
import { Url, ResUtils } from "../utils/resUtil";
import { Lite } from "game-capsule";
import { UiManager } from "../ui/ui.manager";
import NinePatchPlugin from "../../lib/rexui/plugins/ninepatch-plugin.js";
import InputTextPlugin from "../../lib/rexui/plugins/inputtext-plugin.js";
import BBCodeTextPlugin from "../../lib/rexui/plugins/bbcodetext-plugin.js";
import ButtonPlugin from "../../lib/rexui/plugins/button-plugin.js";
import UIPlugin from "../../lib/rexui/templates/ui/ui-plugin.js";
import { InputManager } from "./input.service";
import { LoginScene } from "../scenes/login";
import { Account } from "./account";
import IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = op_gateway.IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT;
import { HttpService } from "../net/http.service";
import { GamePauseScene } from "../scenes/gamepause";
import { EditScene } from "../scenes/edit";
import { Clock, ClockReadyListener } from "../rooms/clock";
import { RoleManager } from "../role/role.manager";
import { initLocales } from "../i18n";
import * as path from "path";
import { PI_EXTENSION_REGEX } from "../const/constants";
// The World act as the global Phaser.World instance;
export class World extends PacketHandler implements IConnectListener, WorldService, GameMain, ClockReadyListener {
    public static SCALE_CHANGE: string = "scale_change";
    private mClock: Clock;
    private mMoveStyle: number = 1;
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
    private mRoleManager: RoleManager;
    private isFullStart: boolean = false;
    private mOrientation: number = 0;
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
        this.addHandlerFun(
            op_client.OPCODE._OP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT,
            this.onInitVirtualWorldPlayerInit
        );
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
        this.mRoleManager = new RoleManager(this);
        this.mRoleManager.register();
        // this.mCharacterManager = new CharacterManager(this);
        // this.mCharacterManager.register();

        this.mRoomMamager.addPackListener();
        this.mUiManager.addPackListener();

        const gateway: ServerAddress = this.mConfig.server_addr || CONFIG.gateway;
        if (gateway) {
            // connect to game server.
            this.mConnection.startConnect(gateway);
        }

        if (config.isEditor) {
            this.createGame();
        }
    }

    get moveStyle(): number {
        return this.mMoveStyle;
    }

    getConfig(): ILauncherConfig {
        return this.mConfig;
    }

    destroy(): void {
        this.mConnection.closeConnect();
        this.clearGame();
    }

    onConnected(connection?: SocketConnection): void {
        // Logger.getInstance().info(`enterVirtualWorld`);
        this.enterVirtualWorld();
        // this.login();
    }

    onDisConnected(connection?: SocketConnection): void { }

    onError(reason: SocketConnectionError | undefined): void { }

    onClientErrorHandler(packet: PBpacket): void {
        const content: op_client.OP_GATEWAY_RES_CLIENT_ERROR = packet.content;
        Logger.getInstance().error(`Remote Error[${content.responseStatus}]: ${content.msg}`);
    }

    /**
     * 当scene发生改变时，调用该方法并传入各个需要调整监听的manager中去
     */
    public changeRoom(room: IRoomService) {
        if (this.mInputManager) this.mInputManager.onRoomChanged(room);
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
        Logger.getInstance().log(`resize${width}|${height}`);
    }

    public onOrientationChange(orientation: number, width: number, height: number) {
        if (this.mConfig.platform === "app") return;
        this.mOrientation = orientation;
        if (this.mConfig.screenWidth > this.mConfig.screenHeight) {
            // 基础是横屏
            if ((orientation <= 135 && orientation >= 45) || (orientation <= -45 && orientation >= -135)) {
                this.orientationResize(this.mConfig.screenWidth, this.mConfig.screenHeight, width, height);
            } else {
                this.orientationResize(this.mConfig.screenHeight, this.mConfig.screenWidth, width, height);
            }
        } else {
            // 基础是竖屏
            if ((orientation <= 135 && orientation >= 45) || (orientation <= -45 && orientation >= -135)) {
                this.orientationResize(this.mConfig.screenHeight, this.mConfig.screenWidth, width, height);
            } else {
                this.orientationResize(this.mConfig.screenWidth, this.mConfig.screenHeight, width, height);
            }
        }
    }

    public startFullscreen() {
        if (!this.mGame) {
            return;
        }
        this.isFullStart = true;
        this.mGame.scale.startFullscreen();
    }

    public stopFullscreen() {
        if (!this.mGame) {
            return;
        }
        this.isFullStart = false;
        this.mGame.scale.stopFullscreen();
    }

    public onGotoAnotherGame(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_GOTO_ANOTHER_GAME = packet.content;
        this._createAnotherGame(content.gameId, content.virtualWorldId);
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
        this._createAnotherGame(gameID, worldID);
    }

    public startHeartBeat() {
        const pkt: PBpacket = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_GATEWAY_PING);
        this.mConnection.send(pkt);
        this.mClock.sync(-1);
    }

    get uiScale(): number {
        if (this.mConfig) return this.mConfig.ui_scale;
        return 1;
    }

    get game(): Phaser.Game | undefined {
        return this.mGame;
    }

    get roomManager(): RoomManager | undefined {
        return this.mRoomMamager;
    }

    get orientation(): number {
        return this.mOrientation;
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
        if (
            this.game &&
            this.mRoomMamager &&
            this.mRoomMamager.currentRoom &&
            this.mRoomMamager.currentRoom.scene &&
            this.mRoomMamager.currentRoom.scene.input
        ) {
            this.mRoomMamager.currentRoom.scene.input.enabled = true;
        }
    }

    public disableClick() {
        if (
            this.game &&
            this.mRoomMamager &&
            this.mRoomMamager.currentRoom &&
            this.mRoomMamager.currentRoom.scene &&
            this.mRoomMamager.currentRoom.scene.input
        ) {
            this.mRoomMamager.currentRoom.scene.input.enabled = false;
        }
    }

    public getGameConfig(): Phaser.Types.Core.GameConfig {
        return this.gameConfig;
    }

    public onClockReady(): void {
        if (this.mInputManager) {
            this.mInputManager.enable = true;
        }
    }

    public onFocus() {
        if (this.connection) {
            const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS);
            const context: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS = pkt.content;
            context.gameStatus = op_def.GameStatus.Focus;
            this.connection.send(pkt);
            // 同步心跳
            this.mClock.sync(-1);
        } else {
            Logger.getInstance().error("connection is undefined");
        }
        this.resumeScene();
    }

    public onBlur() {
        if (this.connection) {
            const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS);
            const context: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS = pkt.content;
            context.gameStatus = op_def.GameStatus.Blur;
            this.connection.send(pkt);
        } else {
            Logger.getInstance().error("connection is undefined");
        }
        this.pauseScene();
    }

    private _createAnotherGame(gameId, worldId) {
        this.clearGame();
        if (this.mConnection) {
            this.mConnection.closeConnect();
        }
        if (this.mClock) {
            this.mClock.destroy();
            this.mClock = null;
        }
        this.mConfig.game_id = gameId;
        this.mConfig.virtual_world_id = worldId;
        this.mConnection.addPacketListener(this);
        const gateway: ServerAddress = this.mConfig.server_addr || CONFIG.gateway;
        if (gateway) {
            // connect to game server.
            this.mConnection.startConnect(gateway);
        }
        this.mClock = new Clock(this.mConnection, this);
        this._newGame();
        const loginScene: LoginScene = this.mGame.scene.getScene(LoginScene.name) as LoginScene;
        if (loginScene) loginScene.remove();
        this.mGame.scene.start(LoadingScene.name, { world: this });
    }

    private onFullScreenChange() {
        this.resize(this.mGame.scale.gameSize.width, this.mGame.scale.gameSize.height);
    }

    private onSelectCharacter() {
        const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_CHARACTER_CREATED);
        this.connection.send(pkt);
    }

    private clearGame() {
        if (this.mGame) {
            // this.mGame.events.off(Phaser.Core.Events.FOCUS, this.onFocus, this);
            this.mGame.events.off(Phaser.Core.Events.BLUR, this.onBlur, this);
            this.mGame.scale.off("enterfullscreen", this.onFullScreenChange, this);
            this.mGame.scale.off("leavefullscreen", this.onFullScreenChange, this);
            // this.mGame.scale.off("orientationchange", this.onOrientationChange, this);
            this.mGame.plugins.removeGlobalPlugin("rexButton");
            this.mGame.plugins.removeGlobalPlugin("rexNinePatchPlugin");
            this.mGame.plugins.removeGlobalPlugin("rexInputText");
            this.mGame.plugins.removeGlobalPlugin("rexBBCodeTextPlugin");
            this.mGame.plugins.removeGlobalPlugin("rexMoveTo");
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
            }
        });
    }

    private orientationResize(screenWidth, screenHeight, width, height) {
        if (this.mGame) {
            if (width < height) { // 基础竖版
                // this.mConfig.ui_scale = width / this.mConfig.baseHeight;
                this.mGame.scale.orientation = Phaser.Scale.Orientation.PORTRAIT;
                if (!this.isFullStart) {
                    Logger.getInstance().log("竖版" + this.mGame.scale.orientation);
                }
            } else { // 基础横版
                // this.mConfig.ui_scale = width / this.mConfig.baseWidth;
                this.mGame.scale.orientation = Phaser.Scale.Orientation.LANDSCAPE;
                if (!this.isFullStart) {
                    Logger.getInstance().log("横版" + this.mGame.scale.orientation);
                }
            }
            this.mGame.scale.resize(screenWidth, screenHeight);
            Logger.getInstance().log("orientation" + this.mGame.scale.orientation);
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

    private enterVirtualWorld() {
        if (!this.mGame) {
            this.reconnect();
            return;
        }
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

    private async loginEnterWorld() {
        await initLocales(path.relative(__dirname, "../resources/locales/{{lng}}.json"));
        const pkt: PBpacket = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT);
        const content: IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = pkt.content;
        // Logger.getInstance().log(`VW_id: ${this.mConfig.virtual_world_id}`);
        content.virtualWorldUuid = `${this.mConfig.virtual_world_id}`;
        if (
            !this.mConfig.game_id ||
            !this.mAccount ||
            !this.mAccount.accountData ||
            !this.mAccount.accountData.token ||
            !this.mAccount.accountData.expire ||
            !this.mAccount.accountData.fingerprint
        ) {
            // Logger.getInstance().debug("缺少必要参数，无法登录游戏");
            if (this.mGame) this.mGame.destroy(true);
            return;
        }
        content.gameId = this.mConfig.game_id;
        // const accountObj = JSON.parse();
        content.userToken = this.mConfig.auth_token = this.mAccount.accountData.token; // auth_token;
        content.expire = this.mConfig.token_expire = this.mAccount.accountData.expire + "";
        content.fingerprint = this.mConfig.token_fingerprint = this.mAccount.accountData.fingerprint;
        this.mConnection.send(pkt);
    }

    private onInitVirtualWorldPlayerInit(packet: PBpacket) {
        // if (this.mClock) this.mClock.sync(); // Manual sync remote time.
        // TODO 进游戏前预加载资源
        const content: op_client.IOP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT = packet.content;
        const configUrls = content.configUrls;
        this.mMoveStyle = content.moveStyle;
        if (!configUrls || configUrls.length <= 0) {
            Logger.getInstance().error(`configUrls error: , ${configUrls}, gameId: ${this.mConfig.game_id}`);
            this.createGame(content.keyEvents);
            return;
        }
        Logger.getInstance().log(`mMoveStyle:${content.moveStyle}`);
        this.loadGameConfig(content.configUrls)
            .then((gameConfig: Lite) => {
                this.mElementStorage.setGameConfig(gameConfig);
                this.createGame(content.keyEvents);
                // Logger.getInstance().debug("created game suc");
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
                global: [
                    {
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
                    }
                ],
                scene: [
                    {
                        key: "DragonBones",
                        plugin: dragonBones.phaser.plugin.DragonBonesScenePlugin,
                        mapping: "dragonbone"
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
        if (this.mRoleManager) this.mRoleManager.register();
        // if (this.mCharacterManager) this.mCharacterManager.register();
        return this.mGame;
    }

    private createGame(keyEvents?: op_def.IKeyCodeEvent[]) {
        // start the game. TODO 此方法会多次调用，所以先要卸载已经实例化的游戏再new！
        this._newGame();
        // this.mGame.scene.add(PlayScene.name, PlayScene);
        this.mGame.scene.add(MainUIScene.name, MainUIScene);
        this.mGame.scene.add(EditScene.name, EditScene);
        // this.mGame.events.on(Phaser.Core.Events.FOCUS, this.onFocus, this);
        this.mGame.events.on(Phaser.Core.Events.BLUR, this.onBlur, this);
        if (this.moveStyle === op_def.MoveStyle.DIRECTION_MOVE_STYLE || this.moveStyle === 1) {
            if (this.mGame.device.os.desktop) {
                this.mInputManager = new KeyBoardManager(this, keyEvents);
            } else {
                this.mInputManager = new JoyStickManager(this, keyEvents);
            }
        } else {
            if (this.mGame.device.os.desktop) {
                this.mInputManager = new KeyBoardManager(this, keyEvents);
            }
        }
        if (this.mInputManager) this.mInputManager.enable = false;
        if (window.screen.width > window.screen.height) {
            if (this.mConfig.width > this.mConfig.height) {
                this.resize(this.mConfig.width, this.mConfig.height);
            } else {
                this.resize(this.mConfig.height, this.mConfig.width);
            }
        } else {
            if (this.mConfig.width < this.mConfig.height) {
                this.resize(this.mConfig.width, this.mConfig.height);
            } else {
                this.resize(this.mConfig.height, this.mConfig.width);
            }
        }

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
            // Logger.getInstance().error("connection is undefined");
        }
        this.mGame.scale.on("enterfullscreen", this.onFullScreenChange, this);
        this.mGame.scale.on("leavefullscreen", this.onFullScreenChange, this);
        // this.mGame.scale.on("orientationchange", this.onOrientationChange, this);
    }

    private loadGameConfig(paths: string[]): Promise<Lite> {
        const promises = [];
        let configPath = "";
        for (const remotePath of paths) {
            if (PI_EXTENSION_REGEX.test(remotePath)) {
                configPath = ResUtils.getGameConfig(remotePath);
                // Logger.getInstance().log(`start download config: ${configPath}`);
                promises.push(load(configPath, "arraybuffer"));
            }
        }
        // promises.push(load("http://172.17.19.48:8080/5e1d81163bcc774a3c172e94.pi", "arraybuffer"));
        // TODO Promise.all如果其中有一个下载失败，会返回error
        return Promise.all(promises).then((reqs: any[]) => {
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
                        Logger.getInstance().log("TCL: World -> gameConfig", gameConfig);
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

    private resumeScene() {
        if (this.mConfig.isEditor) {
            return;
        }
        this.mRoomMamager.onFocus();
        if (this.mGame && this.mConfig.platform === "pc") {
            const pauseScene: Phaser.Scene = this.mGame.scene.getScene(GamePauseScene.name);
            if (pauseScene) {
                (pauseScene as GamePauseScene).sleep();
                this.mGame.scene.stop(GamePauseScene.name);
            }
        }
    }

    private pauseScene() {
        if (this.mConfig.isEditor) {
            return;
        }
        this.mRoomMamager.onBlur();
        if (this.mGame && this.mConfig.platform === "pc") {
            if (!this.mGame.scene.getScene(GamePauseScene.name)) {
                this.mGame.scene.add(GamePauseScene.name, GamePauseScene);
            }
            this.mGame.scene.start(GamePauseScene.name, { world: this });
        }
    }
}
