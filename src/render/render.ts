import "tooqinggamephaser";
import "dragonBones";
import { Game } from "tooqinggamephaser";
import { Export, RPCPeer, webworker_rpc } from "webworker-rpc";
import { i18n, initLocales, IPos, IPosition45Obj, Logger, Pos, Size, Url } from "utils";
import { PBpacket } from "net-socket-packet";
import * as protos from "pixelpai_proto";
import { op_client } from "pixelpai_proto";
import { Account } from "./account/account";
import { SceneManager } from "./scenes/scene.manager";
import { LoginScene } from "./scenes/login.scene";
import { LocalStorageManager } from "./managers/local.storage.manager";
import { PlayScene } from "./scenes/play.scene";
import { CamerasManager } from "./cameras/cameras.manager";
import * as path from "path";
import {
    ElementStateType,
    GameMain,
    IDragonbonesModel,
    IFramesModel,
    ILauncherConfig,
    IScenery,
    MAIN_WORKER,
    MAIN_WORKER_URL,
    MessageType,
    ModuleName,
    PHYSICAL_WORKER,
    PHYSICAL_WORKER_URL,
    RENDER_PEER,
    SceneName
} from "structure";
import { DisplayManager } from "./managers/display.manager";
import { InputManager } from "./input/input.manager";
import { PicaRenderUiManager } from "picaRender";// TODO: 分离pica模块时，删除该引用
import { GamePauseScene } from "./scenes/game.pause.scene";
import { MainUIScene } from "./scenes/main.ui.scene";
import { EditorCanvasManager } from "./managers/editor.canvas.manager";
import version from "../../version";
import { IRender, BasicScene } from "baseRender";
import { AstarDebugger } from "./display/debugs/astar";
import { EditorModeDebugger } from "./display/debugs/editor.mode.debugger";
import { GridsDebugger } from "./display/debugs/grids";
import { SortDebugger } from "./display/debugs/sort.debugger";
import { UiManager } from "./ui/ui.manager";
// import Stats from "../../Stat";

for (const key in protos) {
    PBpacket.addProtocol(protos[key]);
}

enum MoveStyle {
    DIRECTION_MOVE_STYLE = 1,
    FOLLOW_MOUSE_MOVE_STYLE = 2,
    PATH_MOVE_STYLE = 3
}

export class Render extends RPCPeer implements GameMain, IRender {
    public isConnect: boolean = false;
    public emitter: Phaser.Events.EventEmitter;
    @Export()
    public gridsDebugger: GridsDebugger;
    @Export()
    public astarDebugger: AstarDebugger;
    @Export()
    public sortDebugger: SortDebugger;
    @Export()
    public editorModeDebugger: EditorModeDebugger;

    protected readonly DEFAULT_WIDTH = 360;
    protected readonly DEFAULT_HEIGHT = 640;
    protected mSceneManager: SceneManager;
    protected mCameraManager: CamerasManager;
    protected mInputManager: InputManager;
    // protected mInputManager: InputManager;
    protected mConfig: ILauncherConfig;
    protected mUiManager: PicaRenderUiManager;
    protected mDisplayManager: DisplayManager;
    protected mLocalStorageManager: LocalStorageManager;
    protected mEditorCanvasManager: EditorCanvasManager;
    private mCallBack: Function;
    private _moveStyle: number = 0;
    private _curTime: number;
    private mGame: Phaser.Game;
    private gameConfig: Phaser.Types.Core.GameConfig;
    private mAccount: Account;
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
    private mPhysicalPeer: any;
    private isPause: boolean = false;
    private mConnectFailFunc: Function;
    private mGameCreatedFunc: Function;

    constructor(config: ILauncherConfig, callBack?: Function) {
        super(RENDER_PEER);
        this.emitter = new Phaser.Events.EventEmitter();
        this.mConfig = config;
        this.mCallBack = callBack;
        this.gridsDebugger = GridsDebugger.getInstance();
        this.astarDebugger = AstarDebugger.getInstance();
        this.sortDebugger = new SortDebugger(this);
        this.editorModeDebugger = new EditorModeDebugger(this);
        this.mConnectFailFunc = this.mConfig.connectFail;
        this.mGameCreatedFunc = this.mConfig.game_created;
        this.mConfig.hasConnectFail = this.mConnectFailFunc ? true : false;
        this.mConfig.hasCloseGame = this.mConfig.closeGame ? true : false;
        this.mConfig.hasGameCreated = this.mConfig.game_created ? true : false;
        this.mConfig.hasReload = this.mConfig.reload ? true : false;
        // rpc不传送方法
        delete this.mConfig.connectFail;
        delete this.mConfig.game_created;
        delete this.mConfig.closeGame;
        // Logger.getInstance().debug("connectfail===>", this.mConnectFailFunc, this.mConfig);
        this.initConfig();
        Logger.getInstance().log("Render version ====>:", `v${version}`);
        this.linkTo(MAIN_WORKER, MAIN_WORKER_URL).onceReady(() => {
            this.mMainPeer = this.remote[MAIN_WORKER].MainPeer;
            this.mMainPeer.updateFps();
            this.createGame();
            Logger.getInstance().debug("worker onReady");
        });
        this.linkTo(PHYSICAL_WORKER, PHYSICAL_WORKER_URL).onceReady(() => {
            this.mPhysicalPeer = this.remote[PHYSICAL_WORKER].PhysicalPeer;
            this.mPhysicalPeer.setScaleRatio(Math.ceil(this.mConfig.devicePixelRatio || 1));
            this.mPhysicalPeer.start();
            Logger.getInstance().debug("Physcialworker onReady");
        });
        // this.linkTo(HEARTBEAT_WORKER, HEARTBEAT_WORKER_URL).onceReady(() => {
        //     this.mHeartPeer = this.remote[HEARTBEAT_WORKER].HeartBeatPeer;
        //     this.mMainPeer.updateFps();
        //     Logger.getInstance().debug("heartBeatworker onReady in Render");
        // });
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

    get physicalPeer(): any {
        return this.mPhysicalPeer;
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

    get uiScale(): number {
        return this.mUIScale;
    }

    get scaleRatio(): number {
        return this.mScaleRatio;
    }

    get account(): Account {
        return this.mAccount;
    }

    get uiManager(): PicaRenderUiManager {
        return this.mUiManager;
    }

    get sceneManager(): SceneManager {
        return this.mSceneManager;
    }

    get camerasManager(): CamerasManager {
        return this.mCameraManager;
    }

    get displayManager(): DisplayManager {
        return this.mDisplayManager;
    }

    get localStorageManager(): LocalStorageManager {
        return this.mLocalStorageManager;
    }

    get editorCanvasManager(): EditorCanvasManager {
        return this.mEditorCanvasManager;
    }

    get game(): Phaser.Game {
        return this.mGame;
    }

    getSize(): Size | undefined {
        if (!this.mGame) return;
        return this.mGame.scale.gameSize;
    }

    createGame() {
        this.newGame().then(() => {
            this.createManager();
            this.remote[MAIN_WORKER].MainPeer.createGame(this.mConfig);
        });
    }

    createManager() {
        if (!this.mUiManager) this.mUiManager = new PicaRenderUiManager(this);
        if (!this.mCameraManager) this.mCameraManager = new CamerasManager(this);
        if (!this.mLocalStorageManager) this.mLocalStorageManager = new LocalStorageManager();
        if (!this.mSceneManager) this.mSceneManager = new SceneManager(this);
        if (!this.mInputManager) this.mInputManager = new InputManager(this);
        if (!this.mDisplayManager) this.mDisplayManager = new DisplayManager(this);
        if (!this.mEditorCanvasManager) this.mEditorCanvasManager = new EditorCanvasManager(this);
    }

    // 切游戏的时候销毁各个manmager
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
        if (this.mSceneManager) {
            this.mSceneManager.destroy();
            this.mSceneManager = undefined;
        }
        if (this.mInputManager) {
            this.mInputManager.destroy();
            this.mInputManager = undefined;
        }
        if (this.mDisplayManager) {
            this.mDisplayManager.destroy();
            this.mDisplayManager = undefined;
        }
        if (this.mEditorCanvasManager) {
            this.mEditorCanvasManager.destroy();
            this.mEditorCanvasManager = undefined;
        }
    }

    // 切换scene时，清除各个manager缓存
    clearManager() {
        if (this.mUiManager)
            this.mUiManager.destroy();

        if (this.mCameraManager)
            this.mCameraManager.destroy();

        // if (this.mLocalStorageManager)
        //     this.mLocalStorageManager.destroy();

        if (this.mSceneManager)
            this.mSceneManager.destroy();

        if (this.mInputManager)
            this.mInputManager.destroy();

        if (this.mDisplayManager)
            this.mDisplayManager.destroy();

        // if (this.mEditorCanvasManager)
        //     this.mEditorCanvasManager.destroy();
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

    resize(width: number, height: number) {
        const panel: any = this.uiManager.getPanel(ModuleName.BOTTOM);
        if (panel) {
            const inputs = this.game.domContainer.getElementsByTagName("input");
            if (inputs && inputs.length > 0) {
                // tslint:disable-next-line:prefer-for-of
                // for (let i = 0; i < inputs.length; i++) {
                //     if (window.document.activeElement === inputs[i]) {
                //         panel.showKeyboard(width * this.mConfig.devicePixelRatio, height * this.mConfig.devicePixelRatio);
                //         return;
                //     }
                // }
                // panel.hideKeyboard();
                if (panel.getInputFocusing()) {
                    panel.showKeyboard(width * this.mConfig.devicePixelRatio, height * this.mConfig.devicePixelRatio);
                    return;
                }
                panel.hideKeyboard();
                return;
            }
        }
        // Logger.getInstance().debug("input: ", input);
        if (this.mConfig) {
            this.mConfig.width = width;
            this.mConfig.height = height;
        }
        const w = width * this.mConfig.devicePixelRatio;
        const h = height * this.mConfig.devicePixelRatio;
        this.mScaleRatio = Math.ceil(this.mConfig.devicePixelRatio || 1);
        this.mConfig.scale_ratio = this.mScaleRatio;
        this.mUIRatio = Math.round(this.mConfig.devicePixelRatio || 1);
        const scaleW = (width / this.DEFAULT_WIDTH) * (this.mConfig.devicePixelRatio / this.mUIRatio);
        this.mUIScale = this.game.device.os.desktop ? 1 : scaleW;
        if (this.mGame) {
            this.mGame.scale.zoom = 1 / this.mConfig.devicePixelRatio;
            this.mGame.scale.resize(w, h);
            const scenes = this.mGame.scene.scenes;
            for (const scene of scenes) {
                const camera = scene.cameras.main;
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
        // if (this.mSceneManager) this.mSceneManager.resize(width, height);
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
        const playScene: Phaser.Scene = this.sceneManager.getMainScene();
        if (playScene) playScene.input.enabled = false;
        const uiScene = this.game.scene.getScene("MainUIScene") as BasicScene;
        if (uiScene) uiScene.input.enabled = false;
    }

    keyboardDidShow(keyboardHeight: number) {
        const bottom: any = this.uiManager.getPanel(ModuleName.BOTTOM);
        const width = this.mConfig.width;
        const height = this.mConfig.height - keyboardHeight;
        if (bottom) {
            bottom.showKeyboard(width * this.mConfig.devicePixelRatio, height * this.mConfig.devicePixelRatio);
        }
    }

    keyboardDidHide() {
        const bottom: any = this.uiManager.getPanel(ModuleName.BOTTOM);
        if (bottom) {
            bottom.hideKeyboard();
        }
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
        this.remote[MAIN_WORKER].MainPeer.initUI();
    }

    startRoomPlay() {
        this.remote[MAIN_WORKER].MainPeer.startRoomPlay();
    }

    updateRoom(time: number, delta: number) {
        // this.remote[MAIN_WORKER].MainPeer.updateRoom(time, delta);
        this.mInputManager.update(time, delta);
        this.mDisplayManager.update(time, delta);
    }

    destroy(): Promise<void> {
        this.mainPeer.destroy();
        this.physicalPeer.destroy();
        return new Promise((resolve, reject) => {
            if (this.mGame) {
                this.destroyManager();
                this.mGame.events.off(Phaser.Core.Events.FOCUS, this.onFocus, this);
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
                    super.destroy();
                    resolve();
                });
                this.mGame.destroy(true);
            } else {
                super.destroy();
                resolve();
            }
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

    // public startConnect(gateway: ServerAddress) {
    //     this.remote[MAIN_WORKER].MainPeer.startConnect(gateway.host, gateway.port, gateway.secure);
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
                resolution: 1,
                fps: {
                    target: 45,
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
                this.mConfig.platform = "pc";
            } else {
                this.mConfig.platform = "nopc";
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
    }

    public onFocus() {
        this.resumeScene();
    }

    public onBlur() {
        this.pauseScene();
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
        if (this.mMainPeer) this.mMainPeer.syncCameraScroll();
    }

    public renderEmitter(eventType: string, data?: any) {
        if (this.mMainPeer) this.mMainPeer.renderEmitter(eventType, data);
    }

    public renderToPhysicalEmitter(eventType: string, data?: any) {
        if (this.physicalPeer) this.physicalPeer.renderEmitter(eventType, data);
    }

    public showMediator(name: string, isShow: boolean) {
        if (this.mMainPeer) this.mMainPeer.showMediator(name, isShow);
    }

    public getMainScene() {
        return this.mSceneManager.getMainScene();
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
        if (this.sceneManager) this.mSceneManager.startScene(SceneName.LOGIN_SCENE, this);
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
            const createPanel = () => {
                this.mUiManager.showPanel(ModuleName.PICACREATEROLE_NAME, data).then((panel) => {
                    if (!panel) {
                        reject(false);
                        return;
                    }
                    panel.addExportListener(() => {
                        resolve(true);
                    });
                });
            };
            if (this.mUiManager.scene && this.mUiManager.scene.scene.key === SceneName.CREATE_ROLE_SCENE) {
                createPanel();
            } else {
                this.mSceneManager.startScene(SceneName.CREATE_ROLE_SCENE, {
                    callBack: () => {
                        createPanel();
                    }
                });
            }
        });
    }

    @Export([webworker_rpc.ParamType.num])
    public updateModel(id: number, displayInfo: any) {
        if (this.displayManager) this.displayManager.updateModel(id, displayInfo);
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
        if (this.mSceneManager) this.mSceneManager.startScene(SceneName.PLAY_SCENE, { render: this, params });
    }

    @Export()
    public updateFPS() {
        if (!this.game) return;
        const scene: MainUIScene = this.game.scene.getScene(SceneName.MAINUI_SCENE) as MainUIScene;
        if (!scene || !scene.scene.isVisible || !scene.scene.isActive || !scene.scene.isPaused) return;
        scene.updateFPS();
    }

    @Export()
    public endFPS() {
    }

    @Export()
    public hidePlay() {
        if (this.mSceneManager) this.mSceneManager.stopScene(SceneName.PLAY_SCENE);
    }

    @Export([webworker_rpc.ParamType.str])
    public showPanel(panelName: string, params?: any): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
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
    public hidePanel(panelName: string) {
        if (this.mUiManager) this.mUiManager.hidePanel(panelName);
    }

    @Export()
    public reload() {
        Logger.getInstance().log("game relaod =====>");
        window.location.reload();
    }

    @Export()
    public showJoystick() {
        if (this.mInputManager) this.mInputManager.showJoystick();
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
    public displayReady(id: number, animation: any) {
        const display = this.mDisplayManager.getDisplay(id);
        if (!display || !animation) return;
        display.play(animation);
        display.showNickname();
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
        this.isConnect = false;
        if (this.mConnectFailFunc) this.mConnectFailFunc();
        // this.mWorld.connectFail();
    }

    @Export([webworker_rpc.ParamType.str])
    public updateUIState(panelName: string, ui: any) {
        this.uiManager.updateUIState(panelName, ui);
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
    public createAccount(gameID: string, worldID: string, sceneID?: number, locX?: number, locY?: number, locZ?: number): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (!this.mAccount) {
                this.mAccount = new Account();
            }
            const now = new Date().getTime();
            Logger.getInstance().debug("createAccount ====>", now);
            this.exportProperty(this.mAccount, this, ModuleName.ACCOUNT_NAME).onceReady(() => {
                Logger.getInstance().debug("createAccountExport ====>", new Date().getTime() - now);
                this.mAccount.enterGame(gameID, worldID, sceneID, { locX, locY, locZ });
                resolve(true);
            });
        });
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
        if (!this.sceneManager) return;
        return new Promise<any>((resolve, reject) => {
            const playScene: Phaser.Scene = this.sceneManager.getMainScene();
            if (playScene) {
                const camera = playScene.cameras.main;
                const rect = camera.worldView;
                const { x, y } = rect;
                const obj = {
                    x,
                    y,
                    width: camera.width,
                    height: camera.height,
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

    @Export()
    public showAlert(text: string, ok: boolean) {
        // 告诉render显示警告框
        this.uiManager.showAlertView(text, ok);
    }

    @Export()
    public showLoading(data?: any) {
        if (!this.mSceneManager) {
            // Logger.getInstance().error("no game created");
            return;
        }
        data.callBack = () => {
            if (data.sceneName) this.mSceneManager.startScene(data.sceneName);
        };
        data.dpr = this.uiRatio;
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
            // Logger.getInstance().error("no game created");
            return;
        }
        this.mSceneManager.sleepScene(SceneName.LOADING_SCENE);
    }

    // @Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str, webworker_rpc.ParamType.str, webworker_rpc.ParamType.str])
    // public sceneAddLoadRes(sceneName: string, type: string, key: string, source: string) {

    // }

    // @Export([webworker_rpc.ParamType.str])
    // public sceneStartLoad(secenName: string) {

    // }

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

    @Export()
    public renderReconnect() {

    }

    @Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public createAnotherGame(gameId: string, worldId: string, sceneId?: number, px?: number, py?: number, pz?: number) {
        // this.newGame().then(() => {
        //     // todo sceneManager loginScene.name
        // });
        Logger.getInstance().debug("gotoanothergame ====>");
        this.account.enterGame(gameId, worldId, sceneId, { x: px, y: py, z: pz });
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public setCamerasBounds(x: number, y: number, width: number, height: number) {
        if (this.mCameraManager) this.mCameraManager.setBounds(x, y, width, height);
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
    public createGameCallBack(keyEvents: any) {
        this.mGame.events.on(Phaser.Core.Events.FOCUS, this.onFocus, this);
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
        if (this.mGameCreatedFunc) this.mGameCreatedFunc.call(this);
        this.gameCreated(keyEvents);
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public addFillEffect(posX: number, posY: number, status: any) {
        this.displayManager.addFillEffect(posX, posY, status);
    }

    @Export()
    public clearRoom() {
        this.clearManager();
    }

    @Export([webworker_rpc.ParamType.boolean])
    public clearGame(boo: boolean): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.mGame) {
                this.destroyManager();
                this.mGame.events.off(Phaser.Core.Events.FOCUS, this.onFocus, this);
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
                    if (boo) {
                        this.newGame().then(() => {
                            this.createManager();
                            resolve();
                        });
                        return;
                    }
                    resolve();
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
    public drawGrids(posObj: IPosition45Obj | undefined) {
        if (!this.displayManager) return;
        this.displayManager.showGridsDebug(posObj);
    }

    @Export()
    public drawAstar_init(map: number[][], posObj: IPosition45Obj) {
        if (!this.displayManager) return;
        this.displayManager.showAstarDebug_init(map, posObj);
    }

    @Export()
    public drawAstar_update(x: number, y: number, val: boolean) {
        if (!this.displayManager) return;
        this.displayManager.showAstarDebug_update(x, y, val);
    }

    @Export()
    public drawAstar_findPath(start: IPos, tar: IPos, points: IPos[]) {
        if (!this.displayManager) return;
        this.displayManager.showAstarDebug_findPath(start, tar, points);
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
    public createDragonBones(id: number, displayInfo: IFramesModel | IDragonbonesModel, layer: number) {
        if (this.mDisplayManager) this.mDisplayManager.addDragonbonesDisplay(id, displayInfo, layer);
    }

    @Export()
    public createUserDragonBones(displayInfo: IFramesModel | IDragonbonesModel, layer: number) {
        if (this.mDisplayManager) this.mDisplayManager.addUserDragonbonesDisplay(displayInfo, true, layer);
    }

    @Export([webworker_rpc.ParamType.num])
    public createFramesDisplay(id: number, displayInfo: IFramesModel, layer: number) {
        if (this.mDisplayManager) this.mDisplayManager.addFramesDisplay(id, displayInfo, layer);
        else Logger.getInstance().debug("no displayManager ====>");
    }

    @Export([webworker_rpc.ParamType.num])
    public createTerrainDisplay(id: number, displayInfo: IFramesModel, layer: number) {
        if (this.mDisplayManager) this.mDisplayManager.addTerrainDisplay(id, displayInfo, layer);
    }

    @Export()
    public setModel(sprite: any) {
        if (this.mDisplayManager) this.mDisplayManager.setModel(sprite);
    }

    // @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    // public updateDirection(id: number, dir: number) {
    //     if (this.mDisplayManager) {
    //         const display = this.mDisplayManager.getDisplay(id);
    //         display.setDirection(dir);
    //     }
    // }

    @Export()
    public addSkybox(scenery: IScenery) {
        if (this.mDisplayManager) this.mDisplayManager.addSkybox(scenery);
    }

    @Export([webworker_rpc.ParamType.num])
    public removeSkybox(id: number) {
        if (this.mDisplayManager) this.mDisplayManager.removeSkybox(id);
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

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.str])
    public showBubble(id: number, text: string, setting: op_client.IChat_Setting) {
        if (!this.mDisplayManager) return;
        const display = this.mDisplayManager.getDisplay(id);
        if (display) display.showBubble(text, setting);
    }

    @Export([webworker_rpc.ParamType.num])
    public clearBubble(id: number) {
        const display = this.mDisplayManager.getDisplay(id);
        if (display) display.clearBubble();
    }

    @Export([webworker_rpc.ParamType.num])
    public startFollow(id: number) {
        // Logger.getInstance().debug("target ===== startFollow");
        const display = this.mDisplayManager.getDisplay(id);
        if (display) this.mCameraManager.startFollow(display);
    }

    @Export()
    public stopFollow() {
        if (this.mCameraManager) this.mCameraManager.stopFollow();
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
        if (this.mDisplayManager) this.mDisplayManager.updateSkyboxState(state);
    }

    @Export([webworker_rpc.ParamType.boolean])
    public setLayerDepth(val: boolean) {
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

    @Export()
    public SetDisplayVisible(id:number, visible: boolean){
        if (!this.mDisplayManager) return;
        const display = this.displayManager.getDisplay(id);
        if (!display) return;
        display.setVisible(visible);
    }

    @Export()
    public showRefernceArea(id: number, area: number[][], origin: IPos) {
        const ele = this.mDisplayManager.getDisplay(id);
        if (!ele) return;
        ele.showRefernceArea(area, origin);
    }

    @Export()
    public hideRefernceArea(id: number) {
        const ele = this.mDisplayManager.getDisplay(id);
        if (!ele) return;
        ele.hideRefernceArea();
    }

    @Export()
    public displayAnimationChange(data: any) {
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
        this.emitter.emit(eventType, data);
    }

    @Export([webworker_rpc.ParamType.str])
    public physicalEmitter(eventType: string, data?: any) {
        this.emitter.emit(eventType, data);
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public mount(id: number, targetID: number, targetIndex: number) {
        this.mDisplayManager.mount(id, targetID, targetIndex);
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public unmount(id: number, targetID: number) {
        this.mDisplayManager.unmount(id, targetID);
    }

    @Export([webworker_rpc.ParamType.num])
    public updateInput(val: number) {
        this.sceneManager.updateInput(val);
    }

    @Export()
    public addEffect(target: number, effectID: number, display: IFramesModel) {
        this.mDisplayManager.addEffect(target, effectID, display);
    }

    @Export()
    public removeEffect(target: number, effectID: number) {
        this.mDisplayManager.removeEffect(target, effectID);
    }

    // private connectReconnect() {
    //     if (!this.game) return;
    //     this.createGame();
    // }

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
        this.mConfig.scale_ratio = this.mScaleRatio;
        this.mUIRatio = Math.round(this.mConfig.devicePixelRatio || 1);
        this.mUIScale = (this.mConfig.width / this.DEFAULT_WIDTH) * (this.mConfig.devicePixelRatio / this.mUIRatio);
        Url.OSD_PATH = this.mConfig.osd;
        Url.RES_PATH = `./resources_v${version}/`;
        Url.RESUI_PATH = `${Url.RES_PATH}ui/`;
        initLocales(path.relative(__dirname, `../${Url.RES_PATH}/locales/{{lng}}.json`));
    }

    private resumeScene() {
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
            const pauseScene: Phaser.Scene = this.mGame.scene.getScene(GamePauseScene.name);
            if (pauseScene) {
                (pauseScene as GamePauseScene).sleep();
                this.mGame.scene.stop(GamePauseScene.name);
            }
            const playScene = this.mGame.scene.getScene(PlayScene.name);
            if (playScene) playScene.scene.resume();
            const uiScene = this.mGame.scene.getScene(MainUIScene.name);
            if (uiScene) uiScene.scene.resume();
            // if (!this.mConnection.isConnect) {
            //     if (this.mConfig.connectFail) {
            //         return this.mConfig.connectFail();
            //     } else {
            //         return this.onDisConnected();
            //     }
            // }
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
            if (!this.mGame.scene.getScene(GamePauseScene.name)) {
                this.mGame.scene.add(GamePauseScene.name, GamePauseScene);
            }
            this.mGame.scene.start(GamePauseScene.name, { render: this });
            const playScene = this.mGame.scene.getScene(PlayScene.name);
            if (playScene) playScene.scene.pause();
            const uiScene = this.mGame.scene.getScene(MainUIScene.name);
            if (uiScene) uiScene.scene.pause();
        }
    }

    get mainPeer() {
        if (!this.mMainPeer) {
            throw new Error("can't find main worker");
        }
        return this.mMainPeer;
    }
}
