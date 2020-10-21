import "tooqinggamephaser";
import "dragonBones";
import { Game } from "tooqinggamephaser";
import { RPCPeer, Export, webworker_rpc } from "webworker-rpc";
import { op_def } from "pixelpai_proto";
import { Logger } from "../utils/log";
import { ServerAddress } from "../../lib/net/address";
import { PBpacket } from "net-socket-packet";
import { MessageType } from "../structureinterface/message.type";
import { op_client } from "pixelpai_proto";
import { ILauncherConfig } from "../structureinterface/lanucher.config";
import { GameMain } from "../structureinterface/game.main";
import { MAIN_WORKER, MAIN_WORKER_URL, RENDER_PEER } from "../structureinterface/worker.name";
import { Account } from "./account/account";
import { SceneManager } from "./managers/scene.manager";
import { LoginScene } from "./scenes/login.scene";
import { UiManager } from "./ui/ui.manager";
import { Url } from "../utils";
import { LocalStorageManager } from "./managers/local.storage.manager";
import { BasicScene } from "./scenes/basic.scene";
// import MainWorker from "worker-loader?filename=js/[name].js!../game/game";

export class Render extends RPCPeer implements GameMain {
    public isConnect: boolean = false;
    public emitter: Phaser.Events.EventEmitter;

    private readonly DEFAULT_WIDTH = 360;
    private readonly DEFAULT_HEIGHT = 640;
    private mSceneManager: SceneManager;
    private mConfig: ILauncherConfig;
    private mCallBack: Function;
    private _moveStyle: number = 0;
    private _curTime: number;
    private mGame: Phaser.Game;
    private gameConfig: Phaser.Types.Core.GameConfig;
    private mAccount: Account;
    private mUiManager: UiManager;
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
        this.linkTo(MAIN_WORKER, MAIN_WORKER_URL).onceReady(() => {
            this.mMainPeer = this.remote[MAIN_WORKER].MainPeer;
            this.createGame();
            Logger.getInstance().log("worker onReady");
        });

        this.initConfig();
        this.createManager();
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
        this.mLocalStorageManager = new LocalStorageManager();
    }

    resize(width: number, height: number) {

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
        this.remote[MAIN_WORKER].MainPeer.updateRoom(time,delta);
    }

    destroy(): Promise<void> {
        return new Promise((reslove, reject) => {
        });
    }

    // @Export()
    // public add(type: number, id: number, data: Uint8Array) {
    //     if (!Object.prototype.hasOwnProperty.call(this.nodes, type)) {
    //         Logger.getInstance().error("type error: ", type, this.nodes);
    //         return;
    //     }
    //     const nodesMap: Map<number, DisplayObject> = this.nodes[type];
    //     if (nodesMap.has(id)) {
    //         Logger.getInstance().warn("repeated id: ", id);
    //     }
    //     // TODO: data转换为iSprite；创建displayObject 存入nodes
    // }

    // @Export()
    // public remove(type: number, id: number) {
    //     if (!Object.prototype.hasOwnProperty.call(this.nodes, type)) {
    //         Logger.getInstance().error("type error: ", type, this.nodes);
    //         return;
    //     }
    //     const nodesMap: Map<number, DisplayObject> = this.nodes[type];
    //     nodesMap.delete(id);
    // }

    // @Export()
    // public setData(type: number, id: number, data: Uint8Array) {
    //     if (!Object.prototype.hasOwnProperty.call(this.nodes, type)) {
    //         Logger.getInstance().error("type error: ", type, this.nodes);
    //         return;
    //     }
    //     const nodesMap: Map<number, DisplayObject> = this.nodes[type];
    //     if (!nodesMap.has(id)) {
    //         Logger.getInstance().error("id error: ", id, nodesMap);
    //         return;
    //     }
    //     const node = nodesMap.get(id);
    //     // TODO: data转换为iSprite；修改displayObject
    // }

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
            Logger.getInstance().log("dragonbones: ", dragonBones);
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
            this.mSceneManager = new SceneManager(this);
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

    @Export()
    public showLogin() {
        this.mSceneManager.startScene("LoginScene", this);
    }

    @Export([webworker_rpc.ParamType.str])
    public showPanel(panelName: string) {
        this.mUiManager.showPanel(panelName);
    }

    @Export([webworker_rpc.ParamType.str])
    public hidePanel(panelName: string) {
        this.mUiManager.hidePanel(panelName);
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
            Logger.getInstance().error("no game created");
            return;
        }
        return this.mSceneManager.startScene("LoadingScene", data).then((scene: BasicScene) => {
            if (data.sceneName) this.mSceneManager.startScene(data.sceneName);
        });
    }

    @Export()
    public hideLoading() {
        if (!this.mSceneManager) {
            Logger.getInstance().error("no game created");
            return;
        }
        this.mSceneManager.sleepScene("LoadingScene");
    }

    @Export()
    public showPlay(data?: any) {
        if (!this.mSceneManager) {
            Logger.getInstance().error("no game created");
            return;
        }
        this.mSceneManager.startScene("PlayScene", data);
    }

    @Export()
    public hidePlay() {
        if (!this.mSceneManager) {
            Logger.getInstance().error("no game created");
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
    public setCameraBounds(x: number, y: number, width: number, height: number) {

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
    public createGameCallBack(content: op_def.IKeyCodeEvent[]) {
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

        this.gameCreated();
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

    private onFullScreenChange() {
        this.resize(this.mGame.scale.gameSize.width, this.mGame.scale.gameSize.height);
    }

    private gameCreated() {
        if (this.mCallBack) {
            this.mCallBack();
        }
        if (this.mConfig.game_created) {
            this.mConfig.game_created();
        }
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
    }

    get mainPeer() {
        if (!this.mMainPeer) {
            throw new Error("can't find main worker");
        }
        return this.mMainPeer;
    }
}
