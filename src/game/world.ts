import "tooqinggamephaser";
import "dragonBones";
import { WorldService, GameState } from "./world.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { Game } from "tooqinggamephaser";
import { IConnectListener } from "../../lib/net/socket";
import { op_client, op_def, op_gateway, op_virtual_world } from "pixelpai_proto";
import { LoadingScene } from "../scenes/loading";
import { Logger } from "../utils/log";
import { RoomManager } from "../rooms/room.manager";
import { ServerAddress } from "../../lib/net/address";
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
import { HttpService } from "../../lib/net/http.service";
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
import { Render } from "../render/render";
// The World act as the global Phaser.World instance;
export class World extends PacketHandler implements WorldService, GameMain, ClockReadyListener {
    public static SCALE_CHANGE: string = "scale_change";
    public isPause: boolean = false;
    private readonly DEFAULT_WIDTH = 360;
    private readonly DEFAULT_HEIGHT = 640;
    private mGame: Phaser.Game | undefined;
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
    private reconnectIng: boolean = false;
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
    private _peer: Render;
    constructor(config: ILauncherConfig, callBack?: Function) {
        super();
        // 建立render peer
        this._peer = new Render(this);
        // 与worker双向连接成功
        this._peer.linkTo("mainWorker", "");
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
        this.mUIScale = scaleW;
        Url.OSD_PATH = this.mConfig.osd || CONFIG.osd;
        Url.RES_PATH = "./resources/";
        Url.RESUI_PATH = "./resources/ui/";
        this._peer.initGameConfig(
            {
            api_root: this.mConfig.api_root,
            auth_token: this.mConfig.auth_token,
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
            readonly screenWidth: number;
            readonly screenHeight: number;
            readonly baseWidth: number;
            readonly baseHeight: number;
            readonly game_created?: boolean;
            readonly isEditor?: boolean;
            readonly osd?: string;
            readonly closeGame: boolean;
            readonly connectFail?: boolean;
            readonly parent?: string;});
        this._newGame();
        const gateway: ServerAddress = this.mConfig.server_addr || CONFIG.gateway;
        if (gateway) {
            // connect to game server.
            this._peer.startConnect(gateway);
        }
        this._peer.initWorld();
        this.mGameEmitter = new Phaser.Events.EventEmitter();
        initLocales(path.relative(__dirname, "../resources/locales/{{lng}}.json"));
        document.body.addEventListener("focusout", this.focusoutFunc); // 软键盘收起的事件处理
    }
    public render(): Render {
        return this._peer;
    }
    // 软键盘弹出的事件处理
    public focusoutFunc = () => {
        // isIOS函数在前面
        if (this.game && this.game.device.os.iOS) {
            window.scrollTo(0, 0);
        }
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
            this._peer.closeConnect();
            document.body.removeEventListener("focusout", this.focusoutFunc); // 软键盘收起的事件处理
            this.clearGame(() => {
                reslove();
            });
        });
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

    public restart(config?: ILauncherConfig, callBack?: Function) {
        Logger.getInstance().log("restart game");
        if (config) this.mConfig = config;
        if (callBack) this.mCallBack = callBack;
        let gameID: string = this.mConfig.game_id;
        let worldID: string = this.mConfig.virtual_world_id;
        if (this.mAccount.gameID && this.mAccount.virtualWorldId) {
            gameID = this.mAccount.gameID;
            worldID = this.mAccount.virtualWorldId;
        }
        this._createAnotherGame(gameID, worldID, null, null);
    }

    public resize(width: number, height: number) {
        if (this.mConfig) {
            this.mConfig.width = width;
            this.mConfig.height = height;
        }
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

    public onGotoAnotherGame(gameId, worldId, sceneId, loc) {
        this._createAnotherGame(gameId, worldId, sceneId, loc);
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
        if (this.mConfig.connectFail) return this.mConfig.connectFail();
        if (!this.game || this.isPause || this.reconnectIng) return;
        this.reconnectIng = true;
        let gameID: string = this.mConfig.game_id;
        let worldID: string = this.mConfig.virtual_world_id;
        if (this.mAccount.gameID && this.mAccount.virtualWorldId) {
            gameID = this.mAccount.gameID;
            worldID = this.mAccount.virtualWorldId;
        }
        this._createAnotherGame(gameID, worldID, null, null);
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
        if (this._peer) {
            const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS);
            const context: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS = pkt.content;
            context.gameStatus = op_def.GameStatus.Focus;
            this._peer.send(pkt);
            // 同步心跳
            this._peer.syncClock(-1);
        } else {
            Logger.getInstance().error("render is undefined");
        }
        this.resumeScene();
    }

    public onBlur() {
        Logger.getInstance().log("#BlackSceneFromBackground; world.onBlur()");
        if (this._peer) {
            const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS);
            const context: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS = pkt.content;
            context.gameStatus = op_def.GameStatus.Blur;
            this._peer.send(pkt);
        } else {
            Logger.getInstance().error("render is undefined");
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

    public createGame(buffer?: Buffer) {
        // start the game. TODO 此方法会多次调用，所以先要卸载已经实例化的游戏再new！
        this._newGame();
        this.mGame.events.on(Phaser.Core.Events.BLUR, this.onBlur, this);
        if (this._peer.moveStyle === op_def.MoveStyle.DIRECTION_MOVE_STYLE || this._peer.moveStyle === 1) {
            if (this.mGame.device.os.desktop) {
                this.mInputManager = new KeyBoardManager(this, buffer.buffer);
            } else {
                this.mInputManager = new JoyStickManager(this, buffer.buffer);
            }
        } else {
            if (this.mGame.device.os.desktop) {
                this.mInputManager = new KeyBoardManager(this, buffer.buffer);
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

    public enterVirtualWorld() {
        if (!this.mGame) {
            this.reconnect();
            return;
        }
        if (this.mConfig && this._peer) {
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
                this.httpService.refreshToekn(account.refreshToken, account.accessToken)
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

    private _createAnotherGame(gameId, worldId, sceneId, loc) {
        this.clearGame().then(() => {
            this.isPause = false;
            if (this._peer) {
                this._peer.closeConnect();
            }
            this._peer.clearClock();
            if (this.mAccount) {
                this.mAccount.enterGame(gameId, worldId, sceneId, loc);
            }
            // this.mConfig.game_id = gameId;
            // this.mConfig.virtual_world_id = worldId;
            const gateway: ServerAddress = this.mConfig.server_addr || CONFIG.gateway;
            if (gateway) {
                // connect to game server.
                this._peer.startConnect(gateway);
            }
            // setTimeout(() => {
            this._newGame();
            // }, 1000);
            const loginScene: LoginScene = this.mGame.scene.getScene(LoginScene.name) as LoginScene;
            if (loginScene) this.mGame.scene.remove(LoginScene.name);
            this.mLoadingManager.start().then(() => {
                this.reconnectIng = false;
            });
            // this.mGame.scene.start(LoadingScene.name, { world: this }););
        });
    }

    private onFullScreenChange() {
        this.resize(this.mGame.scale.gameSize.width, this.mGame.scale.gameSize.height);
    }

    private clearGame(callBack?: Function): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.mClock) {
                this.mClock.destroy();
                this.mClock = null;
            }
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
            connect: this._peer,
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
        if (this.mUiManager) {
            this.mUiManager.resize(width, height);
        }
        if (this.mInputManager) {
            this.mInputManager.resize(width, height);
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
            !this.mAccount.accountData.accessToken ||
            !this.mAccount.accountData.expire ||
            !this.mAccount.accountData.fingerprint
        ) {
            // Logger.getInstance().debug("缺少必要参数，无法登录游戏");
            if (this.mGame) this.mGame.destroy(true);
            return;
        }
        content.gameId = game_id;
        // const accountObj = JSON.parse();
        content.userToken = this.mConfig.auth_token = this.mAccount.accountData.accessToken; // auth_token;
        content.expire = this.mConfig.token_expire = this.mAccount.accountData.expire + "";
        content.fingerprint = this.mConfig.token_fingerprint = this.mAccount.accountData.fingerprint;
        content.sceneId = sceneId;
        content.loc = loc;
        this._peer.send(pkt);
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
        this._peer.initWorld();
        // if (this.mCharacterManager) this.mCharacterManager.register();
        return this.mGame;
    }

    private gameCreated() {
        if (this._peer) {
            this.mLoadingManager.start(LoadingTips.waitEnterRoom());
            const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_GAME_CREATED);
            this._peer.send(pkt);
            if (this.mCallBack) {
                this.mCallBack();
            }
            if (this.mConfig.game_created) {
                this.mConfig.game_created();
            }
        } else {
            // Logger.getInstance().error("_peer is undefined");
        }
        this.mGame.scale.on("enterfullscreen", this.onFullScreenChange, this);
        this.mGame.scale.on("leavefullscreen", this.onFullScreenChange, this);
        // this.mGame.scale.on("orientationchange", this.onOrientationChange, this);
    }

    private resumeScene() {
        Logger.getInstance().log(`#BlackSceneFromBackground; world.resumeScene(); isEditor:${this.mConfig.isEditor}; isPause:${this.isPause}; mGame:${this.mGame}`);
        if (this.mConfig.isEditor || !this.isPause) {
            return;
        }
        this.isPause = false;
        if (this.mGame) {
            if (!this._peer.isConnect) {
                if (this.mConfig.connectFail) {
                    return this.mConfig.connectFail();
                } else {
                    return this._peer.onDisConnected();
                }
            }
            this._peer.onFocus();
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
            this._peer.onBlur();
            if (!this.mGame.scene.getScene(GamePauseScene.name)) {
                this.mGame.scene.add(GamePauseScene.name, GamePauseScene);
            }
            this.mGame.scene.start(GamePauseScene.name, { world: this });
        }
    }
}
