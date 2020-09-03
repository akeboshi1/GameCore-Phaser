import "tooqinggamephaser";
import "dragonBones";
import { WorldService } from "./world.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { Game } from "tooqinggamephaser";
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
import { JoyStickManager } from "./joystick.manager";
import { GameMain, ILauncherConfig } from "../../launcher";
import { ElementStorage, IElementStorage } from "./element.storage";
import { load } from "../utils/http";
import { Url, ResUtils } from "../utils/resUtil";
import { Lite, Capsule, PaletteNode, MossNode } from "game-capsule";
import { UiManager } from "../ui/ui.manager";
import NinePatchPlugin from "../../lib/rexui/lib/plugins/ninepatch-plugin.js";
import InputTextPlugin from "../../lib/rexui/lib/plugins/inputtext-plugin.js";
import BBCodeTextPlugin from "../../lib/rexui/lib/plugins/bbcodetext-plugin.js";
import ButtonPlugin from "../../lib/rexui/lib/plugins/button-plugin.js";
import UIPlugin from "../../lib/rexui/lib/ui/ui-plugin.js";
import { InputManager } from "./input.service";
import { LoginScene } from "../scenes/login";
import { Account } from "./account";
import IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = op_gateway.IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT;
import { HttpService } from "../net/http.service";
import { GamePauseScene } from "../scenes/gamepause";
import { Clock, ClockReadyListener } from "../rooms/clock";
import { RoleManager } from "../role/role.manager";
import { initLocales, i18n } from "../i18n";
import * as path from "path";
import { Tool } from "../utils/tool";
import { SoundManager, ISoundConfig } from "./sound.manager";
import { ILoadingManager, LoadingManager } from "../loading/loading.manager";
import { HttpClock } from "../rooms/http.clock";
import { LoadingTips } from "../loading/loading.tips";
import { PlayerDataManager } from "../rooms/data/PlayerDataManager";
// The World act as the global Phaser.World instance;
export class World extends PacketHandler implements IConnectListener, WorldService, GameMain, ClockReadyListener {
    public static SCALE_CHANGE: string = "scale_change";
    public isPause: boolean = false;
    private readonly DEFAULT_WIDTH = 360;
    private readonly DEFAULT_HEIGHT = 640;
    private mClock: Clock;
    private mHttpClock: HttpClock;
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
    private mSoundManager: SoundManager;
    private isFullStart: boolean = false;
    private mOrientation: number = 0;
    private gameConfigUrls: Map<string, string> = new Map();
    private gameConfigUrl: string = "";
    private mLoadingManager: ILoadingManager;
    private mPlayerDataManager: PlayerDataManager;

    /**
     * 场景缩放系数（layermanager，缩放场景中容器大小）
     */
    private mScaleRatio: number;
    /**
     * 判断加载几x资源
     */
    private mUIRatio: number;
    /**
     * 面板缩放系数
     */
    private mUIScale: number;
    private _isIOS = -1;
    private _errorCount: number = 0;
    constructor(config: ILauncherConfig, callBack?: Function) {
        super();
        this.initWorld(config, callBack);
    }
    public initWorld(config: ILauncherConfig, callBack?: Function) {
        this.mCallBack = callBack;
        this.mConfig = config;
        // TODO 检测config内的必要参数如确实抛异常.
        if (!config.game_id) {
            throw new Error(`Config.game_id is required.`);
        }
        if (!config.devicePixelRatio) {
            config.devicePixelRatio = window.devicePixelRatio || 1;
        }
        if (config.width === undefined) {
            config.width = window.innerWidth;
        }
        if (config.height === undefined) {
            config.height = window.innerHeight;
        }
        this.mScaleRatio = Math.ceil(config.devicePixelRatio || 1);
        this.mUIRatio = Math.round(config.devicePixelRatio || 1);
        const scaleW = (config.width / this.DEFAULT_WIDTH) * (config.devicePixelRatio / this.mUIRatio);
        // const scaleH = config.height / this.DEFAULT_HEIGHT;
        this.mUIScale = scaleW;
        // if (!config.scale_ratio) {
        // config.scale_ratio = Math.round(window.innerWidth / this.DEFAULT_WIDTH * window.devicePixelRatio);
        // }

        // this.mScaleRatio = config.scale_ratio ? config.scale_ratio : window.innerWidth / this.DEFAULT_WIDTH * window.devicePixelRatio;
        Url.OSD_PATH = this.mConfig.osd || CONFIG.osd;
        Url.RES_PATH = "./resources/";
        Url.RESUI_PATH = "./resources/ui/";

        this._newGame();
        this.mConnection = config.connection || new Connection(this);
        this.mConnection.addPacketListener(this);

        this.mClock = new Clock(this.mConnection, this);
        this.mHttpClock = new HttpClock(this);

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
        this.mSoundManager = new SoundManager(this);
        this.mLoadingManager = new LoadingManager(this);
        this.mPlayerDataManager = new PlayerDataManager(this);
        this.mAccount = new Account();
        this.mAccount.enterGame(this.mConfig.game_id, this.mConfig.virtual_world_id, null, null);

        initLocales(path.relative(__dirname, "../resources/locales/{{lng}}.json"));

        this.mRoleManager.register();
        // this.mCharacterManager = new CharacterManager(this);
        // this.mCharacterManager.register();

        this.mRoomMamager.addPackListener();
        this.mUiManager.addPackListener();
        this.mSoundManager.addPackListener();
        this.mPlayerDataManager.addPackListener();
        const gateway: ServerAddress = this.mConfig.server_addr || CONFIG.gateway;
        if (gateway) {
            // connect to game server.
            this.mConnection.startConnect(gateway);
        }

        document.body.addEventListener("focusout", this.focusoutFunc); // 软键盘收起的事件处理
    }

    // 软键盘弹出的事件处理
    public focusoutFunc = () => {
        // isIOS函数在前面
        if (this.game && this.game.device.os.iOS) {
            window.scrollTo(0, 0);
        }
    }

    get moveStyle(): number {
        return this.mMoveStyle;
    }

    getConfig(): ILauncherConfig {
        return this.mConfig;
    }

    setKeyBoardHeight(height) {
        this.mConfig.keyboardHeight = height;
    }

    setGameConfig(config: Capsule) {
        this.elementStorage.setGameConfig(config);
    }

    updatePalette(palette: PaletteNode) {
        this.elementStorage.updatePalette(palette);
    }

    updateMoss(moss: MossNode) {
        this.elementStorage.updateMoss(moss);
    }

    public destroy(): Promise<void> {
        return new Promise((reslove, reject) => {
            this.mConnection.closeConnect();
            document.body.removeEventListener("focusout", this.focusoutFunc); // 软键盘收起的事件处理
            this.clearGame(() => {
                reslove();
            });
        });
    }

    onConnected(connection?: SocketConnection): void {
        // Logger.getInstance().info(`enterVirtualWorld`);
        this.enterVirtualWorld();
        // this.login();
    }

    onDisConnected(connection?: SocketConnection): void {
        if (!this.game || this.isPause) return;
        this.clearGame().then(() => {
            this.initWorld(this.mConfig, this.mCallBack);
        });
    }

    onError(reason?: SocketConnectionError): void {
        this._errorCount++;
        if (this._errorCount > 3) {
            if (!this.mConnection.isConnect) {
                if (this.mConfig.connectFail) {
                    return this.mConfig.connectFail();
                } else {
                    return this.onDisConnected();
                }
            }
        }
    }

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
        this.mSoundManager.changeRoom(room);
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

    public restart() {
        this.clearGame().then(() => {
            this.initWorld(this.mConfig, this.mCallBack);
        });
    }

    public resize(width: number, height: number) {
        const w = width * window.devicePixelRatio;
        const h = height * window.devicePixelRatio;
        if (this.mGame) {
            this.mScaleRatio = Math.ceil(window.devicePixelRatio || 1);
            this.mUIRatio = Math.round(window.devicePixelRatio || 1);
            const scaleW = (width / this.DEFAULT_WIDTH) * (window.devicePixelRatio / this.mUIRatio);
            // const scaleH = config.height / this.DEFAULT_HEIGHT;
            this.mUIScale = scaleW;
            this.mGame.scale.zoom = 1 / window.devicePixelRatio;
            this.mGame.scale.resize(w, h);
            const scenes = this.mGame.scene.scenes;
            for (const scene of scenes) {
                const camera = scene.cameras.main;
                if (camera.setPixelRatio) camera.setPixelRatio(this.mScaleRatio);
                // scene.setViewPort(camera.x, camera.y, w, h);
                // scene.cameras.main.setViewport(0, 0, w, h);
            }
        }
        if (this.mRoomMamager) {
            this.mRoomMamager.resize(w, h);
        }
        if (this.mUiManager) {
            this.mUiManager.resize(w, h);
        }
        if (this.mInputManager) {
            this.mInputManager.resize(w, h);
        }
        Logger.getInstance().log(`resize${w}|${h}`);
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
        this._createAnotherGame(content.gameId, content.virtualWorldId, content.sceneId, content.loc);
    }

    public async changeScene() {
        const gameID: string = this.mConfig.game_id;
        const worldID: string = this.mConfig.virtual_world_id;
        await this.clearGame();
        this.mConfig.game_id = gameID;
        this.mConfig.virtual_world_id = worldID;
        this._newGame();
        this.loginEnterWorld();
    }

    public reconnect() {
        if (!this.game || this.isPause) return;
        let gameID: string = this.mConfig.game_id;
        let worldID: string = this.mConfig.virtual_world_id;
        if (this.mAccount.gameID && this.mAccount.virtualWorldId) {
            gameID = this.mAccount.gameID;
            worldID = this.mAccount.virtualWorldId;
        }
        this._createAnotherGame(gameID, worldID, null, null);
    }

    public startHeartBeat() {
        const pkt: PBpacket = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_GATEWAY_PING);
        this.mConnection.send(pkt);
        this.mClock.sync(-1);
    }

    public playSound(config: ISoundConfig) {
        this.mSoundManager.play(config);
    }

    get uiScale(): number {
        return this.mUIScale;
    }

    get uiRatio(): number {
        return this.mUIRatio;
    }

    get scaleRatio(): number {
        return this.mScaleRatio;
    }

    get game(): Phaser.Game | undefined {
        return this.mGame;
    }

    get roomManager(): RoomManager | undefined {
        return this.mRoomMamager;
    }
    get playerDataManager(): PlayerDataManager {
        return this.mPlayerDataManager;
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

    get httpClock(): HttpClock {
        return this.mHttpClock;
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

    public exitUser() {
        this.mConfig.token_expire = this.mConfig.token_fingerprint = this.mConfig.user_id = this.mConfig.auth_token = null;
        if (this.mAccount) {
            this.mAccount.destroy();
        }
        this._createAnotherGame(this.mConfig.game_id, this.mConfig.virtual_world_id, null, null);
    }

    public showLoading() {
        return this.mLoadingManager.start();
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
        Logger.getInstance().log("#BlackSceneFromBackground; world.onFocus()");
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
        Logger.getInstance().log("#BlackSceneFromBackground; world.onBlur()");
        if (this.connection) {
            const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS);
            const context: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS = pkt.content;
            context.gameStatus = op_def.GameStatus.Blur;
            this.connection.send(pkt);
        } else {
            Logger.getInstance().error("connection is undefined");
        }
        this.pauseScene();
        // if (this.game.device.os.desktop) {
        //     this.pauseScene();
        // }
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

    public loadSceneConfig(sceneId: string) {
        const url = this.getConfigUrl(sceneId);
        this.mLoadingManager.start(LoadingTips.downloadSceneConfig());
        return this.loadGameConfig(url);
    }

    public async createGame(keyEvents?: op_def.IKeyCodeEvent[]) {
        // start the game. TODO 此方法会多次调用，所以先要卸载已经实例化的游戏再new！
        this._newGame();
        // if (!this.mGame.scene.getScene(MainUIScene.name)) {
        //     this.mGame.scene.add(MainUIScene.name, MainUIScene);
        // }
        // if (!this.mGame.scene.getScene(EditScene.name)) {
        //     this.mGame.scene.add(EditScene.name, EditScene);
        // }
        // this.mGame.scene.add(PlayScene.name, PlayScene);
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

        await this.mLoadingManager.addAssets(this.mElementStorage.getAssets());
        this.gameCreated();
    }

    public enterGame() {
        this.loginEnterWorld();
        // const loginScene: LoginScene = this.mGame.scene.getScene(LoginScene.name) as LoginScene;
        this.mGame.scene.remove(LoginScene.name);
        this.uiManager.destroy();
        this.uiManager.addPackListener();
        // loginScene.remove();
        this.mLoadingManager.start(LoadingTips.enterGame());
        // this.mGame.scene.start(LoadingScene.name, { world: this });
    }

    private async _createAnotherGame(gameId, worldId, sceneId, loc) {
        await this.clearGame();
        this.isPause = false;
        if (this.mConnection) {
            this.mConnection.closeConnect();
        }
        if (this.mClock) {
            this.mClock.destroy();
            this.mClock = null;
        }
        if (this.mAccount) {
            this.mAccount.enterGame(gameId, worldId, sceneId, loc);
        }
        // this.mConfig.game_id = gameId;
        // this.mConfig.virtual_world_id = worldId;
        this.mConnection.addPacketListener(this);
        const gateway: ServerAddress = this.mConfig.server_addr || CONFIG.gateway;
        if (gateway) {
            // connect to game server.
            this.mConnection.startConnect(gateway);
        }
        this.mClock = new Clock(this.mConnection, this);
        // setTimeout(() => {
        this._newGame();
        // }, 1000);
        const loginScene: LoginScene = this.mGame.scene.getScene(LoginScene.name) as LoginScene;
        if (loginScene) this.mGame.scene.remove(LoginScene.name);
        this.mLoadingManager.start();
        // this.mGame.scene.start(LoadingScene.name, { world: this });
    }

    private onFullScreenChange() {
        this.resize(this.mGame.scale.gameSize.width, this.mGame.scale.gameSize.height);
    }

    private onSelectCharacter() {
        const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_CHARACTER_CREATED);
        this.connection.send(pkt);

        const i18Packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SET_LOCALE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_SET_LOCALE = i18Packet.content;
        content.localeCode = i18n.language;
        this.connection.send(i18Packet);
        this.mPlayerDataManager.querySYNC_ALL_PACKAGE();
    }

    private clearGame(callBack?: Function): Promise<void> {
        this._errorCount = 0;
        return new Promise((resolve, reject) => {
            if (this.mGame) {
                this.mGame.events.off(Phaser.Core.Events.BLUR, this.onBlur, this);
                this.mGame.scale.off("enterfullscreen", this.onFullScreenChange, this);
                this.mGame.scale.off("leavefullscreen", this.onFullScreenChange, this);
                this.mGame.scale.off("orientationchange", this.onOrientationChange, this);
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
                this.mElementStorage.destroy();
                this.mLoadingManager.destroy();
                this.game.scene.destroy();
                this.mPlayerDataManager.clear();
                this.mGame.events.once(Phaser.Core.Events.DESTROY, () => {
                    this.mGame = undefined;
                    if (callBack) callBack();
                    resolve();
                });
                this.mGame.destroy(true);
            } else {
                resolve();
            }
        });
    }

    private heartBeatCallBack() {
        this.mConnection.clearHeartBeat();
    }

    // private initUiScale() {
    //     const width: number = this.mConfig.width;
    //     const height: number = this.mConfig.height;
    //     const baseWidth: number = this.mConfig.baseWidth;
    //     const baseHeight: number = this.mConfig.baseHeight;
    //     if (!this.mGame.device.os.desktop) {
    //         if (width < height) {
    //             this.mConfig.ui_scale = (width / baseHeight) * 2;
    //             this.mGame.scale.orientation = Phaser.Scale.Orientation.PORTRAIT;
    //         } else if (width > height) {
    //             this.mConfig.ui_scale = (width / baseWidth) * 2;
    //             this.mGame.scale.orientation = Phaser.Scale.Orientation.LANDSCAPE;
    //         }
    //     }
    // }

    private login() {
        if (!this.mGame.scene.getScene(LoginScene.name)) {
            this.mGame.scene.add(LoginScene.name, LoginScene);
        }
        this.mGame.scene.start(LoginScene.name, {
            connect: this.mConnection,
            world: this,
            callBack: () => {
                this.enterGame();
            },
        });
    }

    private orientationResize(screenWidth, screenHeight, width, height) {
        if (this.mGame) {
            if (width < height) {
                // 基础竖版
                // this.mConfig.ui_scale = width / this.mConfig.baseHeight;
                this.mGame.scale.orientation = Phaser.Scale.Orientation.PORTRAIT;
                if (!this.isFullStart) {
                    Logger.getInstance().log("竖版" + this.mGame.scale.orientation);
                }
            } else {
                // 基础横版
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
            // this.mLoadingManager.start();
            // test login and verified
            if (!this.mConfig.auth_token) {
                const token = localStorage.getItem("token");
                if (!token) {
                    this.login();
                    return;
                }
                const account = JSON.parse(token);
                this.mAccount.setAccount(account);
                this.httpService.refreshToekn(account.refreshToken, account.token)
                    .then((response: any) => {
                        if (response.code === 200) {
                            this.mAccount.refreshToken(response);
                            this.loginEnterWorld();
                        } else {
                            this.login();
                            return;
                        }
                    });
            } else {
                // this.mGame.scene.start(LoadingScene.name, { world: this });
                // this.mLoadingManager.start();
                this.mAccount.setAccount({
                    token: this.mConfig.auth_token,
                    expire: this.mConfig.token_expire,
                    fingerprint: this.mConfig.token_fingerprint,
                    refreshToken: this.mAccount.accountData ? this.mAccount.accountData.refreshToken : "",
                    id: this.mConfig.user_id,
                });
                this.loginEnterWorld();
            }
        }
    }

    private async loginEnterWorld() {
        this.mLoadingManager.start(LoadingTips.enterGame());
        const pkt: PBpacket = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT);
        const content: IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = pkt.content;
        // Logger.getInstance().log(`VW_id: ${this.mConfig.virtual_world_id}`);
        let game_id = this.mConfig.game_id;
        let virtualWorldUuid = this.mConfig.virtual_world_id;
        let sceneId = null;
        let loc = null;
        if (this.mAccount) {
            if (this.mAccount.gameID && this.mAccount !== undefined) {
                game_id = this.mAccount.gameID;
                virtualWorldUuid = this.mAccount.virtualWorldId;
                sceneId = this.mAccount.sceneId;
                loc = this.mAccount.loc;
            }
        }
        content.virtualWorldUuid = virtualWorldUuid;
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
        content.gameId = game_id;
        // const accountObj = JSON.parse();
        content.userToken = this.mConfig.auth_token = this.mAccount.accountData.token; // auth_token;
        content.expire = this.mConfig.token_expire = this.mAccount.accountData.expire + "";
        content.fingerprint = this.mConfig.token_fingerprint = this.mAccount.accountData.fingerprint;
        content.sceneId = sceneId;
        content.loc = loc;
        this.mConnection.send(pkt);
    }

    private onInitVirtualWorldPlayerInit(packet: PBpacket) {
        // if (this.mClock) this.mClock.sync(); // Manual sync remote time.
        // TODO 进游戏前预加载资源
        const content: op_client.IOP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT = packet.content;
        const configUrls = content.configUrls;
        this.mMoveStyle = content.moveStyle;

        this.clock.sync(-1);

        this.initgameConfigUrls(configUrls);

        if (!configUrls || configUrls.length <= 0) {
            Logger.getInstance().error(`configUrls error: , ${configUrls}, gameId: ${this.mAccount.gameID}`);
            this.createGame(content.keyEvents);
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
                this.createGame(content.keyEvents);
                Logger.getInstance().debug("created game suc");
            })
            .catch((err: any) => {
                Logger.getInstance().log(err);
            });
    }

    private _newGame(): Phaser.Game {
        if (this.mGame) {
            return this.mGame;
        }
        Logger.getInstance().log("dragonbones: ", dragonBones);
        this.gameConfig = {
            type: Phaser.AUTO,
            parent: this.mConfig.parent || "game",
            scene: null,
            disableContextMenu: true,
            transparent: false,
            backgroundColor: 0x0,
            resolution: 1,
            fps: {
                target: 60,
                forceSetTimeOut: true
            },
            dom: {
                createContainer: true,
            },
            plugins: {
                global: [
                    {
                        key: "rexButton",
                        plugin: ButtonPlugin,
                        start: true,
                    },
                    {
                        key: "rexNinePatchPlugin",
                        plugin: NinePatchPlugin,
                        start: true,
                    },
                    {
                        key: "rexInputText",
                        plugin: InputTextPlugin,
                        start: true,
                    },
                    {
                        key: "rexBBCodeTextPlugin",
                        plugin: BBCodeTextPlugin,
                        start: true,
                    },
                ],
                scene: [
                    {
                        key: "DragonBones",
                        plugin: dragonBones.phaser.plugin.DragonBonesScenePlugin,
                        mapping: "dragonbone",
                    },
                    { key: "rexUI", plugin: UIPlugin, mapping: "rexUI" },
                ],
            },
            render: {
                pixelArt: true,
                roundPixels: true,
            },
            scale: {
                mode: Phaser.Scale.NONE,
                width: this.mConfig.width * window.devicePixelRatio,
                height: this.mConfig.height * window.devicePixelRatio,
                zoom: 1 / window.devicePixelRatio,
            },
        };
        Object.assign(this.gameConfig, this.mConfig);
        this.mGame = new Game(this.gameConfig);
        this.mGame.input.mouse.capture = true;
        if (this.mGame.device.os.desktop) {
            this.mUIScale = 1;
        }
        if (this.mRoomMamager) this.mRoomMamager.addPackListener();
        if (this.mUiManager) this.mUiManager.addPackListener();
        if (this.mRoleManager) this.mRoleManager.register();
        if (this.mSoundManager) this.mSoundManager.addPackListener();
        if (this.mPlayerDataManager) this.mPlayerDataManager.addPackListener();
        if (this.mElementStorage) {
            this.mElementStorage.on("SCENE_PI_LOAD_COMPELETE", this.loadSceneConfig);
        }
        // if (this.mCharacterManager) this.mCharacterManager.register();
        return this.mGame;
    }

    private gameCreated() {
        if (this.connection) {
            this.mLoadingManager.start(LoadingTips.waitEnterRoom());
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

    private resumeScene() {
        Logger.getInstance().log(`#BlackSceneFromBackground; world.resumeScene(); isEditor:${this.mConfig.isEditor}; isPause:${this.isPause}; mGame:${this.mGame}`);
        if (this.mConfig.isEditor || !this.isPause) {
            return;
        }
        this.isPause = false;
        if (this.mGame) {
            if (!this.mConnection.isConnect) {
                if (this.mConfig.connectFail) {
                    return this.mConfig.connectFail();
                } else {
                    return this.onDisConnected();
                }
            }
            this.mConnection.onFocus();
            this.mRoomMamager.onFocus();
            const pauseScene: Phaser.Scene = this.mGame.scene.getScene(GamePauseScene.name);
            if (pauseScene) {
                (pauseScene as GamePauseScene).sleep();
                this.mGame.scene.stop(GamePauseScene.name);
            }
        }
    }

    private pauseScene() {
        Logger.getInstance().log(`#BlackSceneFromBackground; world.pauseScene(); isEditor:${this.mConfig.isEditor}; isPause:${this.isPause}; mGame:${this.mGame}`);
        if (this.mConfig.isEditor || this.isPause) {
            return;
        }
        this.isPause = true;
        if (this.mGame) {
            this.mConnection.onBlur();
            this.mRoomMamager.onBlur();
            if (!this.mGame.scene.getScene(GamePauseScene.name)) {
                this.mGame.scene.add(GamePauseScene.name, GamePauseScene);
            }
            this.mGame.scene.start(GamePauseScene.name, { world: this });
        }
    }
}
