import "tooqinggamephaser";
import "dragonBones";
import { Game } from "tooqinggamephaser";
import { RPCPeer, Export, webworker_rpc } from "webworker-rpc";
import { Url, initLocales } from "utils";
import { ServerAddress } from "../../lib/net/address";
import { PBpacket } from "net-socket-packet";
import { MessageType, GameMain, ILauncherConfig, MAIN_WORKER, MAIN_WORKER_URL, RENDER_PEER } from "structureinterface";
import { op_client } from "pixelpai_proto";
import { Account } from "./account/account";
import { SceneManager } from "./scenes/scene.manager";
import { LoginScene } from "./scenes/login.scene";
import { UiManager } from "./ui/ui.manager";
import { LocalStorageManager } from "./managers/local.storage.manager";
import { BasicScene } from "./scenes/basic.scene";
import { CamerasManager } from "./cameras/cameras.manager";
import * as path from "path";
import { IFramesModel } from "../structureinterface/frame";
import { IDragonbonesModel } from "../structureinterface/dragonbones";
import { DisplayManager } from "./managers/display.manager";
import { IScenery } from "src/structureinterface/scenery";
import { InputManager } from "./input/input.manager";
// import MainWorker from "worker-loader?filename=js/[name].js!../game/game";
enum MoveStyle {
    DIRECTION_MOVE_STYLE = 1,
    FOLLOW_MOUSE_MOVE_STYLE = 2,
    PATH_MOVE_STYLE = 3
}
export class Render extends RPCPeer implements GameMain {
    public isConnect: boolean = false;
    public emitter: Phaser.Events.EventEmitter;

    private readonly DEFAULT_WIDTH = 360;
    private readonly DEFAULT_HEIGHT = 640;
    private mSceneManager: SceneManager;
    private mCameraManager: CamerasManager;
    private mInputManager: InputManager;
    // private mInputManager: InputManager;
    private mConfig: ILauncherConfig;
    private mCallBack: Function;
    private _moveStyle: number = 0;
    private _curTime: number;
    private mGame: Phaser.Game;
    private gameConfig: Phaser.Types.Core.GameConfig;
    private mAccount: Account;
    private mUiManager: UiManager;
    private mDisplayManager: DisplayManager;
    private mLocalStorageManager: LocalStorageManager;
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

    private mMainPeer: any;
    constructor(config: ILauncherConfig, callBack?: Function) {
        super(RENDER_PEER);
        this.emitter = new Phaser.Events.EventEmitter();
        this.mConfig = config;
        this.mCallBack = callBack;
        this.initConfig();
        this.createManager();
        this.linkTo(MAIN_WORKER, MAIN_WORKER_URL).onceReady(() => {
            this.mMainPeer = this.remote[MAIN_WORKER].MainPeer;
            this.createGame();
            // Logger.getInstance().log("worker onReady");
        });
    }

    get config(): ILauncherConfig {
        return this.mConfig;
    }

    get uiRatio(): number {
        return this.mUIRatio;
    }

    get uiScale(): number {
        return this.mUIScale;
    }

    get scaleRatio(): number {
        return this.mScaleRatio;
    }

    get account(): Account {
        return this.mAccount;
    }

    get uiManager(): UiManager {
        return this.mUiManager;
    }

    get sceneManager(): SceneManager {
        return this.mSceneManager;
    }

    get camerasManager(): CamerasManager {
        return this.mCameraManager;
    }

    get DisplayManager(): DisplayManager {
        return this.mDisplayManager;
    }

    get localStorageManager(): LocalStorageManager {
        return this.mLocalStorageManager;
    }

    get game(): Phaser.Game {
        return this.mGame;
    }

    createGame() {
        this.newGame();
        this.remote[MAIN_WORKER].MainPeer.createGame(this.mConfig);
    }

    enterGame() {
        this.remote[MAIN_WORKER].MainPeer.loginEnterWorld();
        // const loginScene: LoginScene = this.mGame.scene.getScene(LoginScene.name) as LoginScene;
        this.mGame.scene.remove(LoginScene.name);
        // this.uiManager.destroy();
        // this.uiManager.addPackListener();
        // loginScene.remove();
        // this.mLoadingManager.start(LoadingTips.enterGame());
    }

    createManager() {
        this.mUiManager = new UiManager(this);
        this.mCameraManager = new CamerasManager(this);
        this.mLocalStorageManager = new LocalStorageManager();
        this.mSceneManager = new SceneManager(this);
        this.mInputManager = new InputManager(this);
        this.mDisplayManager = new DisplayManager(this);
    }

    resize(width: number, height: number) {
        if (this.mCameraManager) this.mCameraManager.resize(width, height);
        if (this.mSceneManager) this.mSceneManager.resize(width, height);
        if (this.mInputManager) this.mInputManager.resize(width, height);
    }

    onOrientationChange(oriation: number, newWidth: number, newHeight: number) {

    }

    scaleChange(scale: number) {

    }

    enableClick() {

    }

    disableClick() {

    }

    setKeyBoardHeight(height: number) {

    }

    startFullscreen(): void {

    }

    stopFullscreen(): void {

    }

    setGameConfig(config): void {

    }
    updatePalette(palett): void {

    }

    updateMoss(moss): void {

    }
    restart(config?: ILauncherConfig, callBack?: Function) {

    }

    initUI() {
        this.remote[MAIN_WORKER].MainPeer.initUI();
    }

    startRoomPlay() {
        this.remote[MAIN_WORKER].MainPeer.startRoomPlay();
    }

    updateRoom(time: number, delta: number) {
        // this.remote[MAIN_WORKER].MainPeer.updateRoom(time, delta);
    }

    destroy(): Promise<void> {
        return new Promise((reslove, reject) => {
        });
    }

    get curTime(): number {
        return this._curTime;
    }

    get moveStyle(): number {
        return this._moveStyle;
    }

    public initGameConfig(config: any) {
        this.remote[MAIN_WORKER].MainPeer.initGameConfig(JSON.stringify(config));
    }

    public startConnect(gateway: ServerAddress) {
        this.remote[MAIN_WORKER].MainPeer.startConnect(gateway.host, gateway.port, gateway.secure);
    }

    public newGame(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (this.mGame) {
                resolve();
            }
            // Logger.getInstance().log("dragonbones: ", dragonBones);
            this.gameConfig = {
                type: Phaser.AUTO,
                parent: this.mConfig.parent,
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
                    scene: [
                        {
                            key: "DragonBones",
                            plugin: dragonBones.phaser.plugin.DragonBonesScenePlugin,
                            mapping: "dragonbone",
                        },
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
            this.exportProperty(this.mSceneManager, this)
                .onceReady(() => {
                    resolve();
                });
        });
    }

    public closeConnect() {
        this.mainPeer.closeConnect();
    }

    public send(packet: PBpacket) {
        this.mainPeer.send(packet.Serialization);
    }

    public terminate() {
        this.mainPeer.terminate();
    }

    public changeScene(scene: Phaser.Scene) {
        if (this.mInputManager) this.mInputManager.setScene(scene);
    }

    public onFocus() {
        this.mainPeer.focus();
    }

    public onBlur() {
        this.mainPeer.blur();
    }

    public syncClock(times: number) {
        this.mainPeer.syncClock(times);
    }

    public clearClock() {
        this.mainPeer.clearClock();
    }

    public destroyClock() {
        this.mainPeer.destroyClock();
    }

    public clearGameComplete() {
        this.mainPeer.clearGameComplete();
    }

    public requestCurTime() {
        this.mainPeer.requestCurTime();
    }

    public onLoginErrorHanlerCallBack(name: string, idcard: string) {

    }

    public onShowErrorHandlerCallBack(error, okText) {

    }

    public getCurrentRoomSize(): any {
        return this.mainPeer.getCurrentRoomSize();
    }

    public syncCameraScroll() {
        this.mainPeer.syncCameraScroll();
    }

    @Export()
    public showLogin() {
        this.mSceneManager.startScene("LoginScene", this);
    }

    @Export()
    public hideLogin() {
        this.sceneManager.stopScene("LoginScene");
    }

    @Export()
    public showCreateRole(params?: any) {
        this.mSceneManager.startScene("CreateRoleScene", { render: this, params });
    }

    @Export([webworker_rpc.ParamType.str])
    public showPanel(panelName: string, params?: any) {
        this.mUiManager.showPanel(panelName, params);
    }

    @Export([webworker_rpc.ParamType.str])
    public hidePanel(panelName: string) {
        this.mUiManager.hidePanel(panelName);
    }

    @Export()
    public showJoystick() {
        this.mInputManager.showJoystick();
    }

    @Export([webworker_rpc.ParamType.boolean])
    public setInputVisible(allow: boolean) {

    }

    @Export([webworker_rpc.ParamType.boolean])
    public setLoginEnable(allow: boolean) {

    }

    @Export()
    public onShowVerified() {

    }

    @Export([webworker_rpc.ParamType.boolean])
    public setVerifiedEnable(enable: boolean) {

    }

    @Export()
    public onShowErrorHandler(error, okText) {
        this.onShowErrorHandlerCallBack(error, okText);
    }

    @Export([webworker_rpc.ParamType.str])
    public onLoginErrorHanler(name: string, idcard: string) {
        this.onLoginErrorHanlerCallBack(name, idcard);
    }

    @Export()
    public updateCharacterPackage() {
        this.emitter.emit(MessageType.UPDATED_CHARACTER_PACKAGE);
    }

    @Export([webworker_rpc.ParamType.num])
    public soundChangeRoom(roomID: number) {

    }

    @Export()
    public playSound(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SOUND_CTL) {

    }

    @Export()
    public onConnected() {
        this.isConnect = true;
    }

    @Export()
    public onDisConnected() {
        this.isConnect = false;
    }

    @Export([webworker_rpc.ParamType.str])
    public onConnectError(error: string) {
        this.isConnect = false;
    }

    @Export()
    public connectFail() {
        // this.mWorld.connectFail();
    }

    @Export()
    public reconnect() {
        // this.mWorld.reconnect();
    }

    @Export([webworker_rpc.ParamType.num])
    public setMoveStyle(moveStyle: number) {
        this._moveStyle = moveStyle;
    }

    @Export([webworker_rpc.ParamType.unit8array])
    public onEnterRoom(scene) {

    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public scaleTween(id: number, type: number) {

    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public getRenderPosition(id: number, type: number): any {
        // todo
        return [];
    }

    @Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str])
    public createAccount(gameID: string, worldID: string, sceneID?: number, locX?: number, locY?: number, locZ?: number) {
        if (!this.mAccount) this.mAccount = new Account();
        this.mAccount.enterGame(gameID, worldID, sceneID, { locX, locY, locZ });
        // if (this.mainPeer) this.mainPeer.createAccount(gameID, worldID, sceneID, loc);
    }

    @Export()
    public refreshAccount(account: any) {
        this.account.refreshToken(account);
    }

    @Export()
    public getAccount(): any {
        return this.mAccount;
    }

    @Export()
    public setAccount(val: any): void {
        this.mAccount.setAccount(val);
    }

    @Export()
    public getWorldView(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const playScene: Phaser.Scene = this.sceneManager.getSceneByName("PlayScene");
            const camera = playScene.cameras.main;
            const rect = camera.worldView;
            const { x, y } = rect;
            const obj = { x, y, width: camera.width, height: camera.height, zoom: camera.zoom, scrollX: camera.scrollX, scrollY: camera.scrollY };
            resolve(obj);
        });
    }

    @Export()
    public onClockReady() {
        // this.mWorld.onClockReady();
    }

    @Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str])
    public showAlert(text: string, title: string) {
        // 告诉render显示警告框
    }

    @Export()
    public showLoading(data?: any) {
        if (!this.mSceneManager) {
            // Logger.getInstance().error("no game created");
            return;
        }
        this.mSceneManager.startScene("LoadingScene", data).then((scene: BasicScene) => {
            if (data.sceneName) this.mSceneManager.startScene(data.sceneName);
        });
    }

    @Export()
    public hideLoading() {
        if (!this.mSceneManager) {
            // Logger.getInstance().error("no game created");
            return;
        }
        this.mSceneManager.sleepScene("LoadingScene");
    }

    @Export()
    public showPlay(data?: any) {
        if (!this.mSceneManager) {
            // Logger.getInstance().error("no game created");
            return;
        }
        this.mSceneManager.startScene("PlayScene", data);
    }

    @Export()
    public hidePlay() {
        if (!this.mSceneManager) {
            // Logger.getInstance().error("no game created");
            return;
        }
        this.mSceneManager.sleepScene("PlayScene");
    }

    @Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str, webworker_rpc.ParamType.str, webworker_rpc.ParamType.str])
    public sceneAddLoadRes(sceneName: string, type: string, key: string, source: string) {

    }

    @Export([webworker_rpc.ParamType.str])
    public sceneStartLoad(secenName: string) {

    }

    @Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str])
    public loadStart(str: string, scene) {

    }

    @Export([webworker_rpc.ParamType.num])
    public roomPause(roomID: number) {

    }

    @Export([webworker_rpc.ParamType.num])
    public roomResume(roomID: number) {

    }
    @Export()
    public removeScene(sceneName: string) {

    }
    @Export()
    public showCreatePanelError(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_CREATE_ROLE_ERROR_MESSAGE) {

    }
    @Export([webworker_rpc.ParamType.str])
    public createSetNickName(name: string) {

    }
    @Export()
    public renderReconnect() {

    }

    @Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public createAnotherGame(gameId: string, worldId: string, sceneId?: number, px?: number, py?: number, pz?: number) {
        // this.newGame().then(() => {
        //     // todo sceneManager loginScene.name
        // });
        this.account.enterGame(gameId, worldId, sceneId, { x: px, y: py, z: pz });
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public setCamerasBounds(x: number, y: number, width: number, height: number) {
        this.mCameraManager.setBounds(x, y, width, height);
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public setInteractive(id: number, type: number) {

    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public disableInteractive(id: number, type: number) {

    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public removeDisplay(id: number, type: number) {

    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public fadeIn(id: number, type: number) {

    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public fadeOut(id: number, type: number) {

    }
    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public fadeAlpha(id: number, type: number, alpha: number) {

    }

    @Export([webworker_rpc.ParamType.num])
    public getCurTime(curTime: number) {
        this._curTime = curTime;
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public displayDestroy(id: number, type: number) {

    }

    @Export()
    public createGameCallBack(keyEvents: any) {
        this.mGame.events.on(Phaser.Core.Events.BLUR, this.onBlur, this);
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

        this.gameCreated(keyEvents);
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public addFillEffect(posX: number, posY: number, status: number) {

    }

    @Export()
    public clearGame(callBack?: Function): Promise<void> {
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

    @Export()
    public setLocalStorage(key: string, value: string) {
        this.localStorageManager.setItem(key, value);
    }

    @Export()
    public getLocalStorage(key: string) {
        return this.localStorageManager.getItem(key);
    }

    @Export()
    public createPanel(name: string, key: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (!this.uiManager) {
                reject("uiManager not found");
                return;
            }
            const panel = this.uiManager.showPanel(name);
            this.exportProperty(panel, this, key).onceReady(() => {
                resolve();
            });
        });
    }

    @Export()
    public roomstartPlay() {
        const scene = this.mSceneManager.getSceneByName("PlayScene");
        this.mCameraManager.camera = scene.cameras.main;
    }

    @Export([webworker_rpc.ParamType.num])
    public playDragonBonesAnimation(id: number, animation: any) {
        const display = this.mDisplayManager.getDisplay(id);
        if (display) display.play(animation);
    }

    @Export([webworker_rpc.ParamType.num])
    public playElementAnimation(id: number, animation: any, field?: any, times?: number) {
        const display = this.mDisplayManager.getDisplay(id);
        if (display) display.play(animation, field, times);
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public setCameraScroller(actorX: number, actorY: number) {
        // Logger.getInstance().log("syncCameraScroll");
        const sceneScrale = this.mSceneManager.getSceneByName("PlayScene").scale;
        this.mCameraManager.setScroll(actorX * this.scaleRatio - sceneScrale.width / 2, actorY * this.scaleRatio - sceneScrale.height / 2);
        this.syncCameraScroll();
    }

    @Export()
    public createDragonBones(displayInfo: IFramesModel | IDragonbonesModel) {
        this.mDisplayManager.addDragonbonesDisplay(displayInfo);
    }

    @Export()
    public createFramesDisplay(displayInfo: IFramesModel) {
        this.mDisplayManager.addFramesDisplay(displayInfo);
    }

    @Export()
    public createTerrainDisplay(displayInfo: IFramesModel) {
        this.mDisplayManager.addTerrainDisplay(displayInfo);
    }

    @Export()
    public setDisplayData(sprite: any) {
        this.mDisplayManager.setDisplayData(sprite);
    }

    @Export()
    public addSkybox(scenery: IScenery) {
        this.mDisplayManager.addSkybox(scenery);
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public changeAlpha(id: number, alpha: number) {
        this.mDisplayManager.changeAlpha(id, alpha);
    }

    @Export([webworker_rpc.ParamType.num])
    public removeBlockObject(id: number) {
        this.mDisplayManager.removeDisplay(id);
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public setPosition(id: number, x: number, y: number, z?: number) {
        const display = this.mDisplayManager.getDisplay(id);
        if (display) display.setPosition(x, y, z);
    }

    @Export([webworker_rpc.ParamType.num])
    public startFollow(id: number) {
        // Logger.getInstance().log("target ===== startFollow");
        const display = this.mDisplayManager.getDisplay(id);
        if (display) this.mCameraManager.startFollow(display);
    }

    @Export()
    public stopFollow() {
        this.mCameraManager.stopFollow();
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.str])
    public async cameraFollow(id: number, effect: string) {
        const target = this.mDisplayManager.getDisplay(id);
        if (target) {
            if (effect === "liner") {
                await this.mCameraManager.pan(target.x, target.y, target.y);
                this.mCameraManager.startFollow(target);
            } else {
                this.mCameraManager.startFollow(target);
            }
        } else {
            this.mCameraManager.stopFollow();
        }
    }

    @Export([webworker_rpc.ParamType.num])
    public cameraPan(id: number) {
        const display = this.mDisplayManager.getDisplay(id);
        if (display) this.mCameraManager.pan(display.x, display.y, 300);
    }

    @Export()
    public updateSkyboxState(state) {
        this.mDisplayManager.updateSkyboxState(state);
    }

    @Export([webworker_rpc.ParamType.boolean])
    public setLayerDepth(val: boolean) {
        const scene: BasicScene = this.mSceneManager.getSceneByName("PlayScene") as BasicScene;
        scene.layerManager.depthSurfaceDirty = val;
    }

    @Export([webworker_rpc.ParamType.num])
    public doMove(id: number, moveData: any) {
        this.mDisplayManager.displayDoMove(id, moveData);
    }

    private onFullScreenChange() {
        this.resize(this.mGame.scale.gameSize.width, this.mGame.scale.gameSize.height);
    }

    private gameCreated(keyEvents: any) {
        if (this.mCallBack) {
            this.mCallBack();
        }
        if (this.mConfig.game_created) {
            this.mConfig.game_created();
        }
        // if (this.moveStyle === MoveStyle.DIRECTION_MOVE_STYLE || this.moveStyle === 1) {
        //     if (this.mGame.device.os.desktop) {
        //         this.mInputManager = new KeyBoardManager(this, keyEvents);
        //     } else {
        //         this.mInputManager = new JoyStickManager(this, keyEvents);
        //     }
        // } else {
        //     if (this.mGame.device.os.desktop) {
        //         this.mInputManager = new KeyBoardManager(this, keyEvents);
        //     }
        // }
        // if (this.mInputManager) this.mInputManager.enable = false;
        this.mGame.scale.on("enterfullscreen", this.onFullScreenChange, this);
        this.mGame.scale.on("leavefullscreen", this.onFullScreenChange, this);
        // this.mGame.scale.on("orientationchange", this.onOrientationChange, this);
    }

    private initConfig() {
        if (!this.mConfig.devicePixelRatio) {
            this.mConfig.devicePixelRatio = window.devicePixelRatio || 1;
        }
        if (this.mConfig.width === undefined) {
            this.mConfig.width = window.innerWidth;
        }
        if (this.mConfig.height === undefined) {
            this.mConfig.height = window.innerHeight;
        }
        this.mScaleRatio = Math.ceil(this.mConfig.devicePixelRatio || 1);
        this.mUIRatio = Math.round(this.mConfig.devicePixelRatio || 1);
        this.mUIScale = (this.mConfig.width / this.DEFAULT_WIDTH) * (this.mConfig.devicePixelRatio / this.mUIRatio);
        Url.OSD_PATH = this.mConfig.osd;
        Url.RES_PATH = "./resources/";
        Url.RESUI_PATH = "./resources/ui/";
        initLocales(path.relative(__dirname, "../resources/locales/{{lng}}.json"));
    }

    get mainPeer() {
        if (!this.mMainPeer) {
            throw new Error("can't find main worker");
        }
        return this.mMainPeer;
    }
}
