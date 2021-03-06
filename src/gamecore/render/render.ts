import { Game } from "phaser3";
import { Export, RPCPeer, webworker_rpc } from "webworker-rpc";
import { UiUtils } from "utils";
import { PBpacket } from "net-socket-packet";
import { op_client, op_def } from "pixelpai_proto";
import { Account, IAccountData } from "./account";
import { SceneManager } from "./scenes/scene.manager";
import { LocalStorageManager } from "./managers/local.storage.manager";
import { PlayScene } from "./scenes/play.scene";
import { CamerasRenderManager } from "./cameras/cameras.render.manager";

import {
    ElementStateType,
    GameMain,
    IDragonbonesModel,
    IFramesModel,
    ILauncherConfig,
    IScenery,
    MessageType,
    SceneName,
    PlatFormType, IPos, IPosition45Obj, Logger, LogicPos, Pos, Size, ValueResolver, IWorkerParam, IGround, ITilesetProperty
} from "structure";
import { DisplayManager } from "./managers/display.manager";
import { InputManager } from "./input/input.manager";
import { AvatarHelper } from "./managers/avatar.helper";
import { BaseSceneManager, BasicScene, IRender, PlayCamera, Url } from "baseRender";
import { EditorModeDebugger } from "./display/debugs/editor.mode.debugger";
import { UiManager } from "./ui";
import { GuideManager } from "./guide";
import { MouseManager } from "./input/mouse.manager";
import { SoundManager } from "./managers";
import { i18n, initLocales, translateProto } from "./utils";
import { RenderFactor } from "./factor";
import { RenderHttpService } from "./http/render.http.service";

enum MoveStyle {
    DIRECTION_MOVE_STYLE = 1,
    FOLLOW_MOUSE_MOVE_STYLE = 2,
    PATH_MOVE_STYLE = 3
}
export interface GlobalGameConfig {
    Orientation: number;
    PlatForm: number;
}
export class Render extends RPCPeer implements GameMain, IRender {
    public static SCENE_CREATED: string = "SCENE_CREATED";
    public static SCENE_DESTROY: string = "SCENE_DESTROY";
    public isConnect: boolean = false;
    public sceneCreated: boolean = false;
    public emitter: Phaser.Events.EventEmitter;

    @Export()
    public editorModeDebugger: EditorModeDebugger;

    // protected mainPeer: any;
    // protected mPhysicalPeer: any;

    protected readonly DEFAULT_WIDTH = 360;
    protected readonly DEFAULT_HEIGHT = 640;
    protected resUrl: Url;
    protected mGuideManager: GuideManager;
    protected mSceneManager: BaseSceneManager;
    protected mCameraManager: CamerasRenderManager;
    protected mInputManager: InputManager;
    protected mSoundManager: SoundManager;
    // protected mInputManager: InputManager;
    protected mConfig: ILauncherConfig;
    protected mUiManager: UiManager;
    protected mDisplayManager: DisplayManager;
    protected mLocalStorageManager: LocalStorageManager;
    protected mAvatarHelper: AvatarHelper;
    protected mHttpService: RenderHttpService;
    protected mRenderParam: IWorkerParam;
    protected mMainPeerParam: IWorkerParam;
    protected mAccount: Account;
    protected mGame: Phaser.Game;
    /**
     * ?????????????????????layermanager?????????????????????????????????
     */
    protected mScaleRatio: number;
    protected mAdd: RenderFactor;
    protected mCallBack: Function;
    protected _moveStyle: number = 0;
    protected _curTime: number;
    protected gameConfig: Phaser.Types.Core.GameConfig;
    /**
     * ???????????????x??????
     */
    protected mUIRatio: number;
    /**
     * ??????????????????
     */
    protected mUIScale: number;
    /**
     * ????????????
     */
    protected mRoomSize: IPosition45Obj;
    protected mRoomMiniSize: IPosition45Obj;

    private isPause: boolean = false;
    private mConnectFailFunc: Function;
    private mGameCreatedFunc: Function;
    private mGameLoadedFunc: Function;
    private mWorkerDestroyMap: Map<string, ValueResolver<null>> = new Map();
    private mCacheTarget: any;
    private readonly hiddenDelay = 60000;
    private mHiddenTime: any;
    constructor(config: ILauncherConfig, callBack?: Function) {
        super(config.renderPeerKey);
        this.emitter = new Phaser.Events.EventEmitter();
        this.mConfig = config;
        this.mCallBack = callBack;
        this.editorModeDebugger = new EditorModeDebugger(this);
        this.mConnectFailFunc = this.mConfig.connectFail;
        this.mGameCreatedFunc = this.mConfig.game_created;
        this.mGameLoadedFunc = this.mConfig.gameLoaded;
        this.mConfig.hasConnectFail = this.mConnectFailFunc ? true : false;
        this.mConfig.hasCloseGame = this.mConfig.closeGame ? true : false;
        this.mConfig.hasGameCreated = this.mConfig.game_created ? true : false;
        this.mConfig.hasReload = this.mConfig.reload ? true : false;
        this.mConfig.hasGameLoaded = this.mConfig.gameLoaded ? true : false;
        Logger.getInstance().isDebug = this.mConfig.debugLog || false;

        if (this.mConfig.devicePixelRatio) this.mConfig.devicePixelRatio = Math.floor(this.mConfig.devicePixelRatio);
        if (this.mConfig.width) this.mConfig.width = Math.floor(this.mConfig.width);
        if (this.mConfig.height) this.mConfig.height = Math.floor(this.mConfig.height);
        // rpc???????????????
        delete this.mConfig.connectFail;
        delete this.mConfig.game_created;
        delete this.mConfig.closeGame;
        delete this.mConfig.gameLoaded;
        Logger.getInstance().log("config ====>", config);
        // Logger.getInstance().debug("connectfail===>", this.mConnectFailFunc, this.mConfig);
        this.initConfig();
        Logger.getInstance().log("Render version ====>:", `v${this.mConfig.version}`);
        this.createAccount(config.game_id, config.virtual_world_id);
        // const len = 3;
        // const statList = [];
        // for (let i = 0; i < len; i++) {
        //     const stats = new Stats();
        //     // stats.dom.style.position = 'relative';
        //     stats.dom.style.left = 80 * i + "px";
        //     stats.showPanel(i); // 0: fps, 1: ms, 2: mb, 3+: custom
        //     document.body.appendChild(stats.dom);
        //     statList.push(stats);
        // }

        // function animate() {
        //     for (let i = 0, tmpLen = statList.length; i < tmpLen; i++) {
        //         const stats = statList[i];
        //         stats.begin();
        //         stats.end();
        //     }
        //     requestAnimationFrame(animate);
        // }

        // requestAnimationFrame(animate);
    }

    get renderParam() {
        return this.mRenderParam;
    }

    get mainPeerParam() {
        return this.mMainPeerParam;
    }

    setKeyBoardHeight(height: number) {
        throw new Error("Method not implemented.");
    }

    get config(): ILauncherConfig {
        return this.mConfig;
    }

    get uiRatio(): number {
        return this.mUIRatio;
    }

    get devicePixelRatio(): number {
        return this.mConfig.devicePixelRatio;
    }

    get uiScale(): number {
        return this.mUIScale;
    }

    get scaleRatio(): number {
        return this.mScaleRatio;
    }

    get roomSize(): IPosition45Obj {
        return this.mRoomSize;
    }

    get roomMiniSize(): IPosition45Obj {
        return this.mRoomMiniSize;
    }

    get account(): Account {
        return this.mAccount;
    }

    get uiManager(): UiManager {
        return this.mUiManager;
    }

    get sceneManager(): BaseSceneManager {
        return this.mSceneManager;
    }

    get guideManager(): GuideManager {
        return this.mGuideManager;
    }

    get camerasManager(): CamerasRenderManager {
        return this.mCameraManager;
    }

    get displayManager(): DisplayManager {
        return this.mDisplayManager;
    }

    get soundManager(): SoundManager {
        return this.mSoundManager;
    }

    get localStorageManager(): LocalStorageManager {
        return this.mLocalStorageManager;
    }

    get editorCanvasManager(): AvatarHelper {
        return this.mAvatarHelper;
    }

    get httpService(): RenderHttpService {
        return this.mHttpService;
    }

    get game(): Phaser.Game {
        return this.mGame;
    }

    get url(): Url {
        return this.resUrl;
    }

    get add() {
        return this.mAdd;
    }

    getSize(): Size | undefined {
        if (!this.mGame) return;
        return this.mGame.scale.gameSize;
    }

    createGame() {
        this.newGame().then(() => {
            this.createManager();
            this.mainPeer.createGame(this.mConfig);
        });
    }

    createManager() {
        if (!this.mUiManager) this.mUiManager = new UiManager(this);
        if (!this.mCameraManager) this.mCameraManager = new CamerasRenderManager(this);
        if (!this.mLocalStorageManager) this.mLocalStorageManager = new LocalStorageManager();
        if (!this.mSceneManager) this.mSceneManager = new SceneManager(this);
        if (!this.mGuideManager) this.mGuideManager = new GuideManager(this);
        if (!this.mInputManager) this.mInputManager = new InputManager(this);
        if (!this.mSoundManager) this.mSoundManager = new SoundManager(this);
        if (!this.mDisplayManager) this.mDisplayManager = new DisplayManager(this);
        if (!this.mAvatarHelper) this.mAvatarHelper = new AvatarHelper(this);
        if (!this.mAdd) this.mAdd = new RenderFactor(this);
        if (!this.mHttpService) this.mHttpService = new RenderHttpService(this);
    }

    // ??????????????????????????????manmager
    destroyManager() {
        if (this.mUiManager) {
            this.mUiManager.destroy();
            this.mUiManager = undefined;
        }
        if (this.mCameraManager) {
            this.mCameraManager.destroy();
            this.mCameraManager = undefined;
        }
        // if (this.mLocalStorageManager) {
        //     this.mLocalStorageManager.destroy();
        //     this.mLocalStorageManager = undefined;
        // }
        if (this.mSoundManager) {
            this.mSoundManager.destroy();
            this.mSoundManager = undefined;
        }
        if (this.mGuideManager) {
            this.mGuideManager.destroy();
            this.mGuideManager = undefined;
        }
        if (this.mInputManager) {
            this.mInputManager.destroy();
            this.mInputManager = undefined;
        }
        if (this.mDisplayManager) {
            this.mDisplayManager.destroy();
            this.mDisplayManager = undefined;
        }
        if (this.mAvatarHelper) {
            this.mAvatarHelper.destroy();
            this.mAvatarHelper = undefined;
        }
        if (this.mSceneManager) {
            this.mSceneManager.destroy();
            this.mSceneManager = undefined;
        }
        if (this.emitter) {
            this.emitter.removeAllListeners();
        }
    }

    // ??????scene??????????????????manager??????
    clearManager() {
        this.sceneCreated = false;
        this.emitter.emit(Render.SCENE_DESTROY);
        if (this.mUiManager)
            this.mUiManager.clear();

        if (this.mCameraManager)
            this.mCameraManager.clear();

        // if (this.mLocalStorageManager)
        //     this.mLocalStorageManager.destroy();

        if (this.mSoundManager)
            this.mSoundManager.clear();

        if (this.mInputManager)
            this.mInputManager.clear();

        if (this.mDisplayManager)
            this.mDisplayManager.destroy();
        if (this.mSceneManager)
            this.mSceneManager.destroy();
    
        if (this.mAvatarHelper) {
            this.mAvatarHelper.destroy();
        }
        // if (this.mEditorCanvasManager)
        //     this.mEditorCanvasManager.destroy();
    }

    enterGame() {
        this.mainPeer.loginEnterWorld();
        this.mGame.scene.remove(SceneName.LOGIN_SCENE);
    }

    resize(width: number, height: number) {
        if (width * .65 > height) {
            this.dealTipsScene(SceneName.BLACK_SCENE, true);
        } else {
            const blackScene = this.mGame.scene.getScene(SceneName.BLACK_SCENE);
            if (blackScene && blackScene.scene.isActive()) {
                this.dealTipsScene(SceneName.BLACK_SCENE, false);
            }
        }
        // Logger.getInstance().debug("input: ", input);
        if (this.mConfig) {
            this.mConfig.width = width;
            this.mConfig.height = height;
        }
        const w = width * this.mConfig.devicePixelRatio;
        const h = height * this.mConfig.devicePixelRatio;
        this.initRatio();
        if (this.mGame) {
            this.mGame.scale.zoom = 1 / this.mConfig.devicePixelRatio;
            this.mGame.scale.resize(w, h);
            const scenes = this.mGame.scene.scenes;
            for (const scene of scenes) {
                // ???????????????
                const camera: PlayCamera = scene.cameras.main as PlayCamera;
                if (camera && camera.setPixelRatio) camera.setPixelRatio(this.mScaleRatio);
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
        if (this.mDisplayManager) {
            this.mDisplayManager.resize(w, h);
        }
        if (this.mCameraManager) {
            this.mCameraManager.resize(width, height);
        }
    }

    onOrientationChange(oriation: number, newWidth: number, newHeight: number) {

    }

    scaleChange(scale: number) {

    }

    enableClick() {
        const playScene: Phaser.Scene = this.sceneManager.getMainScene();
        if (playScene) playScene.input.enabled = true;
        const uiScene = this.game.scene.getScene("MainUIScene") as BasicScene;
        if (uiScene) uiScene.input.enabled = true;
    }

    disableClick() {
        if (!this.sceneManager) return;
        const playScene: Phaser.Scene = this.sceneManager.getMainScene();
        if (playScene) playScene.input.enabled = false;
        const uiScene = this.game.scene.getScene("MainUIScene") as BasicScene;
        if (uiScene) uiScene.input.enabled = false;
    }

    keyboardDidShow(keyboardHeight: number) {
    }

    keyboardDidHide() {
    }

    visibilitychange(state: string) {
        if (state === "hidden") {
            this.mHiddenTime = setTimeout(() => {
                clearTimeout(this.mHiddenTime);
                this.hidden();
            }, this.hiddenDelay);
        } else {
            clearTimeout(this.mHiddenTime);
        }
    }

    @Export([webworker_rpc.ParamType.str])
    public showErrorMsg(msg: string) {
        this.uiManager.showErrorMsg(msg);
    }

    @Export()
    hidden() {
        const loginScene = this.sceneManager.getSceneByName(SceneName.LOGIN_SCENE);
        if (loginScene && loginScene.scene.isActive()) {
            return;
        }
        this.destroy(false).then(() => {
            this.initWorker();
        });
    }

    @Export([webworker_rpc.ParamType.str])
    public getSound(key: string) {
        return new Promise((resolve, reject) => {
            resolve(this.resUrl.getSound(key));
        });
    }

    @Export([webworker_rpc.ParamType.str])
    public setResourecRoot(root: string) {
        this.resUrl.RESOURCE_ROOT = root;
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.str])
    public getUIPath(dpr: number, res: string) {
        return new Promise((resolve, reject) => {
            resolve(this.resUrl.getUIRes(dpr, res));
        });
    }

    @Export()
    public getResPath() {
        return new Promise((resolve, reject) => {
            resolve(this.resUrl.RES_PATH);
        });
    }

    @Export()
    public getOsdPath() {
        return new Promise((resolve, reject) => {
            resolve(this.resUrl.OSD_PATH);
        });
    }

    @Export([webworker_rpc.ParamType.str])
    public getResourceRoot(url: string) {
        return new Promise((resolve, reject) => {
            resolve(this.resUrl.getResRoot(url));
        });
    }

    @Export()
    public getResUIPath() {
        return new Promise((resolve, reject) => {
            resolve(this.resUrl.RESUI_PATH);
        });
    }

    @Export([webworker_rpc.ParamType.str])
    public getNormalUIPath(res: string) {
        return new Promise((resolve, reject) => {
            resolve(this.resUrl.getNormalUIRes(res));
        });
    }

    @Export()
    public getUsrAvatarTextureUrls(value: string): { img: string, json: string } {
        return this.resUrl.getUsrAvatarTextureUrls(value);
    }

    startFullscreen(): void {

    }

    stopFullscreen(): void {

    }

    setGameConfig(config): void {

    }

    updatePalette(palette): void {
        this.mainPeer.updatePalette(palette);
    }

    updateMoss(moss): void {
        this.mainPeer.updateMoss(moss);
    }

    restart(config?: ILauncherConfig, callBack?: Function) {

    }

    initUI() {
        this.mainPeer.initUI();
    }

    startRoomPlay() {
        this.sceneCreated = true;
        this.emitter.emit(Render.SCENE_CREATED);
        this.mainPeer.startRoomPlay();
    }

    updateRoom(time: number, delta: number) {
        // this.mainPeer.updateRoom(time, delta);
        if (this.mInputManager) this.mInputManager.update(time, delta);
        if (this.mDisplayManager) this.mDisplayManager.update(time, delta);
    }

    destroyWorker(workers: string[]): Promise<any> {
        const arr = [];
        for (const w of workers) {
            const valuePromse = new ValueResolver<null>();
            const p = valuePromse.promise(() => {
                // if (this.remote[w]) this.remote[w].destroy();
                const worker = this.remote[w];
                for (const key in worker) {
                    if (Object.prototype.hasOwnProperty.call(worker, key)) {
                        const element = worker[key];
                        element.destroy();
                    }
                }
            });
            arr.push(p);
            this.mWorkerDestroyMap.set(w, valuePromse);
        }
        return Promise.all(arr);
    }

    destroy(destroyPeer: boolean = true): Promise<void> {
        return new Promise((resolve, reject) => {
            this.destroyWorker([this.mMainPeerParam.key]).then(() => {
                if (this.mGame) {
                    this.destroyManager();
                    this.mRoomSize = null;
                    this.mRoomMiniSize = null;
                    this.mGame.events.removeAllListeners();
                    this.mGame.scale.removeAllListeners();
                    this.mGame.plugins.removeScenePlugin("DragonBones");
                    this.mGame.events.once(Phaser.Core.Events.DESTROY, () => {   
                        this.mGame.textures.destroy();
                        this.mGame.cache.destroy();
                        this.mGame.anims.destroy();
                        this.mGame.input.destroy();
                        this.mGame.sound.destroy();
                        this.mGame.scale.destroy();
                        this.mGame = undefined;
                        if (destroyPeer) super.destroy();
                        resolve();
                    });
                    this.mGame.destroy(true);
                } else {
                    if (destroyPeer) super.destroy();
                    resolve();
                }
            });
        });
    }

    get curTime(): number {
        return this._curTime;
    }

    get moveStyle(): number {
        return this._moveStyle;
    }

    public initGameConfig(config: any) {
        this.mainPeer.initGameConfig(JSON.stringify(config));
    }

    // public startConnect(gateway: ServerAddress) {
    //     this.mainPeer.startConnect(gateway.host, gateway.port, gateway.secure);
    // }

    public newGame(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (this.mGame) {
                resolve(true);
            }
            // Logger.getInstance().debug("dragonbones: ", dragonBones);
            this.gameConfig = {
                type: Phaser.AUTO,
                parent: this.mConfig.parent,
                loader: {
                    timeout: 10000,
                },
                disableContextMenu: true,
                transparent: false,
                backgroundColor: 0x0,
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
                    width: this.mConfig.baseWidth * this.devicePixelRatio,
                    height: this.mConfig.baseHeight * this.devicePixelRatio,
                    zoom: 1 / this.devicePixelRatio,
                },
            };
            Object.assign(this.gameConfig, this.mConfig);
            this.mGame = new Game(this.gameConfig);
            if (this.mGame.device.os.desktop) {
                this.mUIScale = 1;
                this.mConfig.platform = PlatFormType.PC;
            }
            resolve(true);
        });
    }

    public closeConnect(boo: boolean) {
        this.mainPeer.closeConnect(boo);
    }

    public send(packet: PBpacket) {
        this.mainPeer.send(packet.Serialization);
    }

    public terminate() {
        this.mainPeer.terminate();
    }

    public changeScene(scene: Phaser.Scene) {
        if (this.mInputManager) this.mInputManager.setScene(scene);
        if (this.mSoundManager) this.mSoundManager.setScene(scene);
    }

    public onFocus() {
        // this.resumeScene();
    }

    public onBlur() {
        // this.pauseScene();
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

    public exitUser() {
        this.mainPeer.exitUser();
    }

    public requestCurTime() {
        this.mainPeer.requestCurTime();
    }

    public setDirection(id: number, direction: number) {
        this.mainPeer.setDirection(id, direction);
    }

    public onLoginErrorHanlerCallBack(name: string, idcard: string) {

    }

    public onShowErrorHandlerCallBack(error, okText) {

    }

    public getCurrentRoomSize(): any {
        return this.mainPeer.getCurrentRoomSize();
    }

    public getCurrentRoomMiniSize(): any {
        return this.mainPeer.getCurrentRoomMiniSize();
    }

    public syncCameraScroll() {
        if (this.mainPeer) this.mainPeer.syncCameraScroll();
    }

    public renderEmitter(eventType: string, data?: any) {
        if (this.mainPeer) this.mainPeer.renderEmitter(eventType, data);
    }

    public showMediator(name: string, isShow: boolean) {
        if (this.mainPeer) this.mainPeer.showMediator(name, isShow);
    }

    public getMainScene() {
        return this.mSceneManager.getMainScene();
    }

    public updateGateway() {
        const accountData = this.account.accountData;
        if (accountData && accountData.gateway) {
            if (!this.mConfig.server_addr) {
                this.mConfig.server_addr = accountData.gateway;
            } else {
                const server_addr = this.mConfig.server_addr;
                if (!server_addr.host) {
                    server_addr.host = accountData.gateway.host;
                }
                if (!server_addr.port) {
                    server_addr.port = accountData.gateway.port;
                }
            }
            if (this.mConfig.server_addr.secure === undefined) this.mConfig.server_addr.secure = true;
            const mainPeer = this.mainPeer;
            if (mainPeer) mainPeer.setConfig(this.mConfig);
        }
    }

    @Export()
    public async destroyAccount(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.mAccount) {
                this.mAccount.destroy();
            }
            resolve();
        });
    }

    @Export()
    public reconnect() {
        this.createGame();
    }

    @Export()
    public showLogin() {
        const data = { dpr: this.uiRatio, render: this };
        if (this.sceneManager) this.mSceneManager.startScene(SceneName.LOGIN_SCENE, data);
    }

    @Export()
    public hideLogin() {
        if (this.sceneManager) this.sceneManager.stopScene(SceneName.LOGIN_SCENE);
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public checkContains(id: number, x: number, y: number): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const boo = this.mCameraManager.checkContains(new Pos(x, y));
            resolve(boo);
        });
    }

    @Export()
    public showCreateRolePanel(data?: any): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            // const createPanel = () => {
            //     this.mUiManager.showPanel(ModuleName.PICACREATEROLE_NAME, data).then((panel) => {
            //         if (!panel) {
            //             reject(false);
            //             return;
            //         }
            //         panel.addExportListener(() => {
            //             resolve(true);
            //         });
            //     });
            // };
            if (this.mUiManager.scene && this.mUiManager.scene.scene.key === SceneName.CREATE_ROLE_SCENE) {
                // createPanel();
                resolve(true);
            } else {
                this.mSceneManager.startScene(SceneName.CREATE_ROLE_SCENE, {
                    callBack: () => {
                        resolve(true);
                        // createPanel();
                    }
                });
            }
        });
    }

    @Export([webworker_rpc.ParamType.str])
    showTipsAlert(str) {
        this.mUiManager.showTipsAlert({ text: [{ text: str, node: undefined }] });
    }

    @Export([webworker_rpc.ParamType.num])
    public updateModel(id: number, displayInfo: any) {
        if (this.displayManager) this.displayManager.updateModel(id, displayInfo);
    }

    @Export()
    public getIndexInLayer(id: number) {
        if (!this.displayManager) return -1;
        const display = this.displayManager.getDisplay(id);
        if (!display) return -1;
        return display.parentContainer.getIndex(display);
    }

    @Export()
    public changeLayer(id: number, layerName: string) {
        if (!this.displayManager) return;
        const display = this.displayManager.getDisplay(id);
        if (!display) return;
        display.parentContainer.remove(display);
        this.displayManager.addToLayer(layerName, display);
    }

    @Export()
    public showCreateRole(params?: any) {
        if (this.mSceneManager) this.mSceneManager.startScene(SceneName.CREATE_ROLE_SCENE, { render: this, params });
    }

    @Export()
    public hideCreateRole() {
        if (this.mSceneManager) this.mSceneManager.stopScene(SceneName.CREATE_ROLE_SCENE);
    }

    @Export()
    public showPlay(params?: any) {
        return new Promise<void>((resolve, reject) => {
            if (!this.mSceneManager) {
                reject();
                return;
            }
            this.mSceneManager.startScene(SceneName.PLAY_SCENE, { render: this, params }).then(() => {
                resolve();
            }).catch(() => {
                reject();
            });
        });
    }

    @Export()
    public hidePlay() {
        if (this.mSceneManager) this.mSceneManager.stopScene(SceneName.PLAY_SCENE);
    }

    @Export([webworker_rpc.ParamType.str])
    public showPanel(panelName: string, params?: any): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            if (!this.mUiManager) {
                reject(false);
                return;
            }
            this.mUiManager.showPanel(panelName, params).then((panel) => {
                if (!panel) {
                    reject(false);
                    return;
                }
                panel.addExportListener(() => {
                    resolve(true);
                });
            });
        });
    }

    @Export([webworker_rpc.ParamType.str])
    public hidePanel(type: string) {
        if (this.mUiManager) this.mUiManager.hidePanel(type);
    }

    @Export([webworker_rpc.ParamType.str])
    public showBatchPanel(type: string, data?: any) {
        if (this.mUiManager) this.mUiManager.showBatchPanel(type, data);
    }

    @Export([webworker_rpc.ParamType.str])
    public hideBatchPanel(type) {
        if (this.mUiManager) this.mUiManager.hideBatchPanel(type);
    }

    @Export()
    public reload() {
        Logger.getInstance().log("game relaod");
        const reload = this.mConfig.reload;
        if (reload) {
            reload();
        } else {
            if (window) window.location.reload();
        }
    }

    @Export()
    public showJoystick() {
        if (this.mInputManager) this.mInputManager.showJoystick();
    }

    @Export([webworker_rpc.ParamType.boolean])
    public setInputVisible(allow: boolean) {

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
        if (this.emitter) this.emitter.emit(MessageType.UPDATED_CHARACTER_PACKAGE);
    }

    @Export([webworker_rpc.ParamType.num])
    public displayReady(id: number, animation: any) {
        const display = this.mDisplayManager.getDisplay(id);
        if (!display || !animation) return;
        display.play(animation);
        display.showNickname();
    }

    @Export([webworker_rpc.ParamType.num])
    public soundChangeRoom(roomID: number) {

    }

    @Export([webworker_rpc.ParamType.str])
    public playSoundByKey(key: string) {
        if (this.mSoundManager) this.mSoundManager.playSound({ soundKey: key });
    }

    @Export()
    public playOsdSound(content: any) {
        if (this.mSoundManager) this.mSoundManager.playOsdSound(content);
    }

    @Export()
    public playSound(content: any) {
        if (this.mSoundManager) this.mSoundManager.playSound(content);
    }

    @Export()
    public stopAllSound() {
        if (this.mSoundManager) this.mSoundManager.stopAll();
    }

    @Export()
    public pauseAll() {
        if (this.mSoundManager) this.mSoundManager.pauseAll();
    }

    @Export([webworker_rpc.ParamType.num])
    public startFireMove(id: number, pos: any) {
        if (this.mDisplayManager) this.mDisplayManager.startFireMove(id, pos);
    }

    @Export()
    public resume() {
        if (this.mSoundManager) this.mSoundManager.resume();
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
        this.isConnect = false;
        if (this.mConnectFailFunc) this.mConnectFailFunc();
        // this.mWorld.connectFail();
    }

    @Export([webworker_rpc.ParamType.str])
    public updateUIState(panelName: string, ui: any) {
        if (this.uiManager) this.uiManager.updateUIState(panelName, ui);
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
    public createAccount(gameID: string, worldID: string, sceneID?: number, loc?: IPos, spawnPointId?: number): Account {
        if (!this.mAccount) {
            const { game_id, virtual_world_id, world_id } = this.config;
            this.mAccount = new Account({ gameId: game_id, virtualWorldId: virtual_world_id, worldId: world_id});
            this.mAccount.enterGame(gameID, worldID, sceneID, loc, spawnPointId);
        }
        return this.mAccount;
    }

    @Export()
    public refreshAccount(account: any) {
        this.account.refreshToken(account);
        this.updateGateway();
    }

    @Export()
    public getAccount(): any {
        return this.mAccount;
    }

    @Export()
    public setAccount(val: IAccountData): void {
        this.mAccount.setAccount(val);
        this.updateGateway();
    }

    @Export()
    public clearAccount() {
        this.mAccount.clear();
    }

    @Export()
    public getWorldView(): Promise<any> {
        if (!this.sceneManager) return;
        return new Promise<any>((resolve, reject) => {
            const playScene: Phaser.Scene = this.sceneManager.getMainScene();
            if (playScene) {
                const camera = playScene.cameras.main;
                const rect = camera.worldView;
                const blockWidth = 300;
                const blockHeight = 150;
                const { x, y } = rect;
                const obj = {
                    x: x - blockWidth * 2,
                    y: y - blockHeight * 2,
                    width: camera.width + blockWidth * 4,
                    height: camera.height + blockHeight * 4,
                    zoom: camera.zoom,
                    scrollX: camera.scrollX,
                    scrollY: camera.scrollY
                };
                resolve(obj);
            }
        });
    }

    @Export()
    public onClockReady() {
        // this.mWorld.onClockReady();
    }

    @Export([webworker_rpc.ParamType.str])
    public i18nString(val: string): string {
        return i18n.t(val);
    }

    @Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.boolean, webworker_rpc.ParamType.boolean])
    public showAlert(text: string, ok?: boolean, needI18n?: boolean, i18nData?: any) {
        // ??????render???????????????
        if (ok === undefined) ok = true;
        if (needI18n === undefined) needI18n = true;
        return new Promise((resolve, reject) => {
            if (this.uiManager) {
                if (needI18n) text = i18n.t(text, i18nData);
                this.uiManager.showAlertView(text, ok, undefined, () => {
                    resolve(null);
                });
            }
        });
    }

    @Export([webworker_rpc.ParamType.str])
    public showAlertReconnect(text: string) {
        // ??????render???????????????
        if (this.uiManager) this.uiManager.showAlertView(text, true, false, () => {
            this.mainPeer.reconnect();
        });
    }

    @Export()
    public showLoading(data?: any): Promise<any> {
        if (!this.mSceneManager) {
            return;
        }
        if (data === undefined) {
            data = {};
        }
        data.callBack = () => {
            if (data.sceneName) {
                this.mSceneManager.startScene(data.sceneName).then(() => {
                    return new Promise<any>((resolve, reject) => {
                        resolve(null);
                    });
                });
            }
        };
        data.dpr = this.uiRatio;
        data.version = this.mConfig.version;
        this.mSceneManager.startScene(SceneName.LOADING_SCENE, data);
    }

    @Export([webworker_rpc.ParamType.num])
    public updateProgress(progress: number) {
        if (progress > 1) progress = 1;
        progress.toFixed(2);
        if (this.mSceneManager) this.mSceneManager.showProgress(progress);
    }

    @Export()
    public hideLoading() {
        if (!this.mSceneManager) {
            return Logger.getInstance().error(`HideLoading failed. SceneManager does not exist.`);
        }
        this.mSceneManager.sleepScene(SceneName.LOADING_SCENE);
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
        if (this.sceneManager) this.sceneManager.remove(sceneName);
    }

    @Export()
    public showCreatePanelError(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_CREATE_ROLE_ERROR_MESSAGE) {

    }

    @Export([webworker_rpc.ParamType.str])
    public createSetNickName(name: string) {

    }

    @Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str])
    public createAnotherGame(gameId: string, virtualWorldId: string, sceneId?: number, px?: number, py?: number, pz?: number, spawnPointId?, worldId?: string) {
        this.account.enterGame(gameId, virtualWorldId, sceneId, { x: px, y: py, z: pz }, spawnPointId, worldId);
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public setCamerasBounds(x: number, y: number, width: number, height: number) {
        if (this.mCameraManager) this.mCameraManager.setBounds(x, y, width, height);
    }

    // ?????????????????????????????????????????????(????????????)
    @Export()
    public getCameraMidPos() {
        if (!this.mCameraManager) return new LogicPos(0, 0);
        const rect = this.mCameraManager.camera.worldView;
        return new LogicPos((rect.x + rect.width / 2) / this.scaleRatio, (rect.y + rect.height / 2) / this.scaleRatio);
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public setCamerasScroll(x: number, y: number, effect?: string) {
        if (!this.mCameraManager) {
            return;
        }
        this.mCameraManager.scrollTargetPoint(x, y, effect);
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public setInteractive(id: number, type: number) {
        if (!this.mDisplayManager) return;
        const display = this.mDisplayManager.getDisplay(id);
        if (display) display.setInteractive();
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public disableInteractive(id: number, type: number) {
        if (!this.mDisplayManager) return;
        const display = this.mDisplayManager.getDisplay(id);
        if (display) display.disableInteractive();
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
        return this._curTime = curTime;
    }

    @Export()
    public gameLoadedCallBack() {
        if (this.mGameLoadedFunc){
            this.mGameLoadedFunc.call(this);
            this.mGameLoadedFunc = null;
        }
    }

    @Export()
    public createGameCallBack(keyEvents: any) {
        if (!this.mGame) {
            return;
        }
        this.mGame.events.on(Phaser.Core.Events.FOCUS, this.onFocus, this);
        this.mGame.events.on(Phaser.Core.Events.BLUR, this.onBlur, this);
        this.resize(this.mConfig.width, this.mConfig.height);
        if (this.mGameCreatedFunc) {
            Logger.getInstance().log("render game_created");
            this.mGameCreatedFunc.call(this);
        }
        this.gameCreated(keyEvents);
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public addFillEffect(posX: number, posY: number, status: any) {
        if (this.displayManager) this.displayManager.addFillEffect(posX, posY, status);
    }

    @Export()
    public clearRoom() {
        this.clearManager();
    }

    @Export([webworker_rpc.ParamType.boolean])
    public clearGame(boo: boolean): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.mGame) {
                Logger.getInstance().log("====================>>>>>>>> clear game");
                this.destroyManager();
                this.mGame.events.removeAllListeners();
                this.mGame.scale.removeAllListeners();
                this.mGame.plugins.removeScenePlugin("DragonBones");
                this.mGame.events.once(Phaser.Core.Events.DESTROY, () => {
                    this.mGame.textures.destroy();
                    this.mGame.cache.destroy();
                    this.mGame.anims.destroy();
                    this.mGame.input.destroy();
                    this.mGame.sound.destroy();
                    this.mGame.scale.destroy();
                    this.mGame = undefined;
                    if (boo) {
                        this.newGame().then(() => {
                            this.createManager();
                            resolve();
                        });
                        return;
                    } else {
                        resolve();
                    }
                });
                this.mGame.destroy(true);
            } else {
                resolve();
            }
        });
    }

    @Export([webworker_rpc.ParamType.str])
    public getMessage(val: string) {
        return i18n.t(val);
    }

    @Export()
    public setLocalStorage(key: string, value: string) {
        if (this.localStorageManager) this.localStorageManager.setItem(key, value);
    }

    @Export()
    public getLocalStorage(key: string) {
        return this.localStorageManager ? this.localStorageManager.getItem(key) : "";
    }

    @Export()
    public removeLocalStorage(key: string) {
        if (this.localStorageManager) this.localStorageManager.removeItem(key);
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
                resolve(true);
            });
        });
    }

    @Export()
    public roomstartPlay() {
        if (!this.mSceneManager || !this.mCameraManager) return;
        const scene = this.mSceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal(`scene does not exist`);
            return;
        }
        this.mCameraManager.camera = scene.cameras.main;
    }

    @Export()
    public roomReady() {
        if (!this.mSceneManager || !this.mCameraManager) return;
        const scene = this.mSceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal(`scene does not exist`);
            return;
        }
        if (scene instanceof PlayScene)
            scene.onRoomCreated();
    }

    @Export([webworker_rpc.ParamType.num])
    public playAnimation(id: number, animation: any, field?: any, times?: number) {
        if (!this.mDisplayManager) return;
        const display = this.mDisplayManager.getDisplay(id);
        if (display) display.play(animation);
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.boolean])
    public setHasInteractive(id: number, hasInteractive: boolean) {
        if (!this.mDisplayManager) return;
        this.mDisplayManager.setHasInteractive(this.mDisplayManager.getDisplay(id), hasInteractive);
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public setCameraScroller(actorX: number, actorY: number) {
        // Logger.getInstance().debug("syncCameraScroll");
        if (!this.mSceneManager || !this.mCameraManager) return;
        const scene = this.mSceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal(`scene does not exist`);
            return;
        }
        const sceneScrale = scene.scale;
        this.mCameraManager.setScroll(actorX * this.scaleRatio - sceneScrale.width / 2, actorY * this.scaleRatio - sceneScrale.height / 2);
        this.syncCameraScroll();
    }

    @Export([webworker_rpc.ParamType.num])
    public createDragonBones(id: number, displayInfo: IFramesModel | IDragonbonesModel, layer: number, nodeType: op_def.NodeType) {
        if (this.mDisplayManager) this.mDisplayManager.addDragonbonesDisplay(id, displayInfo, layer, nodeType);
    }

    @Export()
    public createUserDragonBones(id: number, displayInfo: IFramesModel | IDragonbonesModel, layer: number, nodeType: op_def.NodeType) {
        if (this.mDisplayManager) this.mDisplayManager.addUserDragonbonesDisplay(id, displayInfo, true, layer);
    }

    @Export([webworker_rpc.ParamType.num])
    public createFramesDisplay(id: number, displayInfo: IFramesModel, layer: number, nodeType: op_def.NodeType) {
        if (this.mDisplayManager) this.mDisplayManager.addFramesDisplay(id, displayInfo, layer, nodeType);
        else Logger.getInstance().debug("no displayManager ====>");
    }

    @Export([webworker_rpc.ParamType.num])
    public createTerrainDisplay(id: number, displayInfo: IFramesModel, layer: number, nodeType: op_def.NodeType) {
        if (this.mDisplayManager) this.mDisplayManager.addTerrainDisplay(id, displayInfo, layer, nodeType);
    }

    @Export()
    public setModel(sprite: any) {
        if (this.mDisplayManager) this.mDisplayManager.setModel(sprite);
    }

    @Export()
    public setPlayerModel(sprite: any) {
        if (this.mDisplayManager) this.mDisplayManager.setModel(sprite);
    }

    @Export()
    public addSkybox(scenery: IScenery) {
        if (this.mDisplayManager) this.mDisplayManager.addSkybox(scenery);
    }

    @Export([webworker_rpc.ParamType.num])
    public removeSkybox(id: number) {
        if (this.mDisplayManager) this.mDisplayManager.removeSkybox(id);
    }

    @Export()
    public addGround(ground: IGround): Promise<ITilesetProperty[]> {
        if (this.mDisplayManager) return this.mDisplayManager.addGround(ground);
        return Promise.reject("no display manager");
    }

    @Export()
    public changeGround(pos45: IPos, key: number): ITilesetProperty {
        if (this.mDisplayManager) return this.mDisplayManager.changeGround(pos45, key);
        return null;
    }

    @Export()
    public removeGround() {
        if (this.mDisplayManager) this.mDisplayManager.removeGround();
    }

    @Export()
    public showMatterDebug(vertices) {
        if (this.mDisplayManager) this.mDisplayManager.showMatterDebug(vertices);
    }

    @Export()
    public hideMatterDebug() {
        if (this.mDisplayManager) this.mDisplayManager.hideMatterDebug();
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public drawServerPosition(x: number, y: number) {
        if (this.mDisplayManager) this.mDisplayManager.drawServerPosition(x, y);
    }

    @Export()
    public hideServerPosition() {
        if (this.mDisplayManager) this.mDisplayManager.hideServerPosition();
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public changeAlpha(id: number, alpha: number) {
        if (this.mDisplayManager) this.mDisplayManager.changeAlpha(id, alpha);
    }

    @Export([webworker_rpc.ParamType.num])
    public removeBlockObject(id: number) {
        if (this.mDisplayManager) this.mDisplayManager.removeDisplay(id);
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public setPosition(id: number, x: number, y: number, z?: number) {
        if (!this.mDisplayManager) return;
        const display = this.mDisplayManager.getDisplay(id);
        if (display) display.setPosition(x, y, z);
    }

    @Export()
    public showBubble(id: number, text: op_def.StrMsg, setting: op_client.IChat_Setting) {
        if (!this.mDisplayManager) return;
        const display = this.mDisplayManager.getDisplay(id);
        const label = translateProto(text);
        if (display) display.showBubble(label, setting);
    }

    @Export([webworker_rpc.ParamType.num])
    public clearBubble(id: number) {
        if (!this.mDisplayManager) return;
        const display = this.mDisplayManager.getDisplay(id);
        if (display) display.clearBubble();
    }

    @Export([webworker_rpc.ParamType.num])
    public startFollow(id: number) {
        if (!this.mDisplayManager) return;
        const display = this.mDisplayManager.getDisplay(id);
        if (display) this.mCameraManager.startFollow(display);
    }

    @Export()
    public stopFollow() {
        if (this.mCameraManager) this.mCameraManager.stopFollow();
    }

    @Export([webworker_rpc.ParamType.num])
    public async cameraFollow(id: number, effect: string) {
        if (!this.mDisplayManager || !this.mCameraManager) return;
        const target = this.mDisplayManager.getDisplay(id);
        if (target) {
            this.mCameraManager.startFollow(target, effect);
        } else {
            this.mCameraManager.stopFollow();
        }
    }

    @Export([webworker_rpc.ParamType.num])
    public cameraPan(id: number) {
        if (!this.mDisplayManager) return;
        const display = this.mDisplayManager.getDisplay(id);
        if (display) {
            this.mCameraManager.pan(display.x, display.y, 300);
        }
    }

    @Export()
    public updateSkyboxState(state) {
        if (this.mDisplayManager) this.mDisplayManager.updateSkyboxState(state);
    }

    @Export([webworker_rpc.ParamType.boolean])
    public setLayerDepth(val: boolean) {
        if (!this.mSceneManager) return;
        const scene: BasicScene = this.mSceneManager.getMainScene() as BasicScene;
        if (!scene) {
            Logger.getInstance().fatal(`scene does not exist`);
            return;
        }
        scene.layerManager.depthSurfaceDirty = val;
    }

    @Export([webworker_rpc.ParamType.num])
    public doMove(id: number, moveData: any) {
        if (this.mDisplayManager) this.mDisplayManager.displayDoMove(id, moveData);
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.str])
    public showNickname(id: number, name: string) {
        if (this.mDisplayManager) this.mDisplayManager.showNickname(id, name);
    }

    @Export([webworker_rpc.ParamType.num])
    public showTopDisplay(id: number, state?: ElementStateType) {
        if (this.mDisplayManager) this.mDisplayManager.showTopDisplay(id, state);
    }

    @Export([webworker_rpc.ParamType.num])
    public removeTopDisplay(id: number) {
        if (this.mDisplayManager) this.mDisplayManager.removeTopDisplay(id);
    }

    @Export()
    public SetDisplayVisible(id: number, visible: boolean) {
        if (!this.mDisplayManager) return;
        const display = this.displayManager.getDisplay(id);
        if (!display) return;
        display.setVisible(visible);
    }
    @Export()
    public setTopDisplayVisible(id: number, visible: boolean) {
        if (!this.mDisplayManager) return;
        const display = this.displayManager.getDisplay(id);
        if (!display) return;
        display.setTopDisplayVisible(visible);
    }

    @Export()
    public showRefernceArea(id: number, area: number[][], origin: IPos, conflictMap?: number[][], freeColor?: number, conflictColor?: number) {
        if (!this.mDisplayManager) return;
        const ele = this.mDisplayManager.getDisplay(id);
        if (!ele) return;
        ele.showRefernceArea(area, origin, conflictMap, freeColor, conflictColor);
    }

    @Export()
    public hideRefernceArea(id: number) {
        if (!this.mDisplayManager) return;
        const ele = this.mDisplayManager.getDisplay(id);
        if (!ele) return;
        ele.hideRefernceArea();
    }

    @Export()
    public displayAnimationChange(data: any) {
        if (!this.mDisplayManager) return;
        const id = data.id;
        const direction = data.direction;
        const display = this.mDisplayManager.getDisplay(id);
        if (display) {
            display.direction = direction;
            display.play(data.animation);
        }
    }

    @Export([webworker_rpc.ParamType.str])
    public workerEmitter(eventType: string, data?: any) {
        if (!this.emitter) return;
        this.emitter.emit(eventType, data);
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public mount(id: number, targetID: number, targetIndex: number) {
        if (this.mDisplayManager) this.mDisplayManager.mount(id, targetID, targetIndex);
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public unmount(id: number, targetID: number, pos: IPos) {
        if (this.mDisplayManager) this.mDisplayManager.unmount(id, targetID, pos);
    }

    @Export([webworker_rpc.ParamType.num])
    public updateInput(val: number) {
        if (this.sceneManager) this.sceneManager.updateInput(val);
    }

    @Export()
    public addEffect(target: number, effectID: number, display: IFramesModel) {
        if (this.mDisplayManager) this.mDisplayManager.addEffect(target, effectID, display);
    }

    @Export()
    public removeEffect(target: number, effectID: number) {
        if (this.mDisplayManager) this.mDisplayManager.removeEffect(target, effectID);
    }

    @Export()
    public switchBaseMouseManager() {
        if (!this.mInputManager) return;
        this.mInputManager.changeMouseManager(new MouseManager(this));

        const playScene = this.mGame.scene.getScene(SceneName.PLAY_SCENE) as PlayScene;
        if (playScene) {
            playScene.resumeMotion();
            playScene.enableCameraMove();
        }
    }

    @Export()
    public liftItem(id: number, display, animation) {
        if (!this.mDisplayManager) return;
        this.mDisplayManager.liftItem(id, display, animation);
    }

    @Export()
    public clearMount(id: number) {
        if (!this.mDisplayManager) return;
        this.mDisplayManager.clearMount(id);
    }

    @Export()
    public throwElement(userid: number, target: number, display, animation) {
        if (!this.mDisplayManager) return;
        this.mDisplayManager.throwElement(userid, target, display, animation);
    }

    @Export()
    public switchDecorateMouseManager() {
    }

    @Export()
    public setRoomSize(size: IPosition45Obj, miniSize: IPosition45Obj) {
        this.mRoomSize = size;
        this.mRoomMiniSize = miniSize;
    }

    @Export()
    public isCordove() {
        const pktGlobal = window["pktGlobal"];
        return (pktGlobal && pktGlobal.envPlatform === "Cordova");
    }

    @Export()
    public getI18nLanguages() {
        return i18n.languages;
    }

    protected onWorkerUnlinked(worker: string) {
        if (!this.mWorkerDestroyMap.has(worker)) return;

        this.mWorkerDestroyMap.get(worker).resolve(null);
        this.mWorkerDestroyMap.delete(worker);
    }

    protected initConfig() {
        if (!this.mConfig.devicePixelRatio) {
            this.mConfig.devicePixelRatio = window.devicePixelRatio || 2;
        }
        if (this.mConfig.width === undefined) {
            this.mConfig.width = window.innerWidth;
        }
        if (this.mConfig.height === undefined) {
            this.mConfig.height = window.innerHeight;
        }
        this.resUrl = new Url();
        this.resUrl.init({ osd: this.mConfig.osd, res: `resources/`, resUI: `resources/ui/` });
        this.initRatio();
        this.initLocales();
    }

    protected initRatio() {
        this.mScaleRatio = Math.ceil(this.mConfig.devicePixelRatio || UiUtils.baseDpr);
        this.mConfig.scale_ratio = this.mScaleRatio;
        this.mUIRatio = Math.round(this.mConfig.devicePixelRatio || UiUtils.baseDpr);
        if (this.mUIRatio > UiUtils.MaxDpr) {
            this.mUIRatio = UiUtils.MaxDpr;
        }
        const scaleW = (this.mConfig.width / this.DEFAULT_WIDTH) * (this.mConfig.devicePixelRatio / this.mUIRatio);
        let desktop = false;
        if (this.game) desktop = this.game.device.os.desktop;
        this.mUIScale = desktop ? UiUtils.baseScale : scaleW;
    }

    protected initWorker() {
        Logger.getInstance().log("startLink mainpeer", this.mMainPeerParam.key, this.mMainPeerParam.url);
        const key = this.mMainPeerParam.key;
        const peerName = this.mMainPeerParam.name;
        this.attach(this.mMainPeerParam.key, this.mMainPeerParam.url, true).onceReady(() => {
            // this.mainPeer = this.remote[key][peerName];
            if (!this.mainPeer) {
                Logger.getInstance().error("no mainpeer", key, peerName);
                return;
            }
            this.createGame();
            Logger.getInstance().debug("worker onReady");
        });
    }

    protected dealTipsScene(sceneName: string, show: boolean) {
        if (!this.mGame.scene.getScene(sceneName)) {
            const sceneClass = this.sceneManager.getSceneClass(sceneName);
            this.mGame.scene.add(sceneName, sceneClass);
        }
        const pauseScene = this.mGame.scene.getScene(SceneName.GAMEPAUSE_SCENE);
        const playScene = this.mGame.scene.getScene(SceneName.PLAY_SCENE);
        const uiScene = this.mGame.scene.getScene(SceneName.MAINUI_SCENE);
        const loginScene = this.mGame.scene.getScene(SceneName.LOGIN_SCENE);
        if (show) {
            this.mGame.scene.start(sceneName, { render: this });
            if (sceneName !== SceneName.GAMEPAUSE_SCENE) {
                if (pauseScene) pauseScene.scene.pause();
            }
            if (playScene) playScene.scene.pause();
            if (uiScene) {
                uiScene.scene.pause();
                uiScene.scene.setVisible(false);
            }
            if (loginScene && loginScene.scene.isActive()) loginScene.scene.setVisible(false);
        } else {
            this.mGame.scene.stop(sceneName);
            if (sceneName !== SceneName.GAMEPAUSE_SCENE) {
                if (pauseScene) pauseScene.scene.resume();
            }
            if (playScene) playScene.scene.resume();
            if (uiScene) {
                uiScene.scene.resume();
                uiScene.scene.setVisible(true);
            }
            if (loginScene && loginScene.scene.isActive()) loginScene.scene.setVisible(true);
        }
    }

    protected initLocales() {
        initLocales(`${this.resUrl.RES_PATH}locales/{{lng}}.json`);
    }

    protected gameCreated(keyEvents: any) {
        if (this.mCallBack) {
            this.mCallBack();
        }
        if (this.mConfig.game_created) {
            this.mConfig.game_created();
        }
        this.mGame.scale.on("enterfullscreen", this.onFullScreenChange, this);
        this.mGame.scale.on("leavefullscreen", this.onFullScreenChange, this);
    }

    private onFullScreenChange() {
        this.resize(this.mGame.scale.gameSize.width, this.mGame.scale.gameSize.height);
    }

    private resumeScene() {
        const type = this.mConfig.platform;
        switch (type) {
            case PlatFormType.APP:
                this.mainPeer.reconnect();
                break;
            case PlatFormType.PC:
            case PlatFormType.NOPC:
                Logger.getInstance().debug(`#BlackSceneFromBackground; world.resumeScene(); isPause:${this.isPause}; mGame:${this.mGame}`);
                if (!this.isPause) {
                    return;
                }
                this.isPause = false;
                if (this.mGame) {
                    if (this.sceneManager.currentScene) this.sceneManager.currentScene.scene.resume();
                    this.mainPeer.onFocus();
                    // this.mConnection.onFocus();
                    // this.mRoomMamager.onFocus();
                    this.dealTipsScene(SceneName.GAMEPAUSE_SCENE, false);
                }
                break;
        }
    }

    private pauseScene() {
        Logger.getInstance().debug(`#BlackSceneFromBackground; world.pauseScene(); isPause:${this.isPause}; mGame:${this.mGame}`);
        if (this.isPause) {
            return;
        }
        this.isPause = true;
        if (this.mGame) {
            if (this.sceneManager.currentScene) this.sceneManager.currentScene.scene.pause();
            this.mainPeer.onBlur();
            // this.mConnection.onBlur();
            // this.mRoomMamager.onBlur();
            this.dealTipsScene(SceneName.GAMEPAUSE_SCENE, true);
        }
    }

    get mainPeer() {
        if (!this.remote[this.mMainPeerParam.key]) return null;
        const peer = this.remote[this.mMainPeerParam.key][this.mMainPeerParam.name];
        if (!peer) {
            // throw new Error("can't find main worker");
            return null;
        }
        return peer;
    }
}
