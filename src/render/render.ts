import "tooqinggamephaser";
import "dragonBones";
import { Game, Scene } from "tooqinggamephaser";
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
import { SceneName } from "../structureinterface/scene.name";
import { SceneManager } from "./managers/scene.manager";
import { LoginScene } from "./scenes/login.scene";
import { UiManager } from "./managers/ui.manager";
import { LoginMediator } from "./ui/Login/LoginMediator";
// import MainWorker from "worker-loader?filename=js/[name].js!../game/game";

export class Render extends RPCPeer implements GameMain {
    public isConnect: boolean = false;
    public emitter: Phaser.Events.EventEmitter;

    private sceneManager: SceneManager;
    private mConfig: ILauncherConfig;
    private mCallBack: Function;
    private _moveStyle: number = 0;
    private _curTime: number;
    private mGame: Phaser.Game;
    private gameConfig: Phaser.Types.Core.GameConfig;
    /**
     * 面板缩放系数
     */
    private mUIScale: number;
    private mAccount: Account;
    private mUiManager: UiManager;
    constructor(config: ILauncherConfig, callBack?: Function) {
        super(RENDER_PEER);
        this.emitter = new Phaser.Events.EventEmitter();
        this.mConfig = config;
        this.mCallBack = callBack;
        this.linkTo(MAIN_WORKER, MAIN_WORKER_URL).onceReady(() => {
            this.createGame();
            Logger.getInstance().log("worker onReady");
        });
        this.createManager();
    }

    get config(): ILauncherConfig {
        return this.mConfig;
    }

    get uiRatio(): number {
        return this.mConfig.scale_ratio;
    }

    get uiScale(): number {
        return this.mUIScale;
    }

    get account(): Account {
        return this.mAccount;
    }

    get uiManager(): UiManager {
        return this.mUiManager;
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
            this.sceneManager = new SceneManager(this.mGame);
            this.exportProperty(this.sceneManager, this)
                .onceReady(() => {
                    resolve();
                });
        });
    }

    public closeConnect() {
        this.remote[MAIN_WORKER].MainPeer.closeConnect();
    }

    public send(packet: PBpacket) {
        this.remote[MAIN_WORKER].MainPeer.send(packet.Serialization);
    }

    public terminate() {
        this.remote[MAIN_WORKER].MainPeer.terminate();
    }

    public onFocus() {
        this.remote[MAIN_WORKER].MainPeer.focus();
    }

    public onBlur() {
        this.remote[MAIN_WORKER].MainPeer.blur();
    }

    public syncClock(times: number) {
        this.remote[MAIN_WORKER].MainPeer.syncClock(times);
    }

    public clearClock() {
        this.remote[MAIN_WORKER].MainPeer.clearClock();
    }

    public destroyClock() {
        this.remote[MAIN_WORKER].MainPeer.destroyClock();
    }

    public clearGameComplete() {
        this.remote[MAIN_WORKER].MainPeer.clearGameComplete();
    }

    public requestCurTime() {
        this.remote[MAIN_WORKER].MainPeer.requestCurTime();
    }

    public requestPhoneCode(phone: string, areaCode: string) {
        this.remote[MAIN_WORKER].MainPeer.requestPhoneCode(phone, areaCode);
    }

    public httpClockEnable(enable: boolean) {
        this.remote[MAIN_WORKER].MainPeer.httpClockEnable(enable);
    }

    public allowLogin() {
        this.remote[MAIN_WORKER].MainPeer.allowLogin();
    }

    public loginByPhoneCode(phone: string, code: string, areaCode: string) {
        this.remote[MAIN_WORKER].MainPeer.loginByPhoneCode(phone, code, areaCode);
    }

    public verified(name: string, idcard: string) {
        this.remote[MAIN_WORKER].MainPeer.verified(name, idcard);
    }

    @Export()
    public login() {
        this.sceneManager.startScene(name, {});
        if (!this.mGame.scene.getScene(SceneName.LOGIN_SCENE)) {
            this.mGame.scene.add(SceneName.LOGIN_SCENE, LoginScene);
        }
        this.mGame.scene.start(SceneName.LOGIN_SCENE, {
            world: this,
            callBack: () => {
                this.enterGame();
                // this.remote[MAIN_WORKER].MainPeer.loginEnterWorld();
                // const loginScene: LoginScene = this.mGame.scene.getScene(LoginScene.name) as LoginScene;
                // this.mGame.scene.remove(LoginScene.name);
            },
        });
    }

    @Export()
    public allowLoginCallBack() {
        this.uiManager.getMediator(LoginMediator.name);
    }

    @Export([webworker_rpc.ParamType.boolean])
    public allowLoginPromise(allow: boolean) {

    }

    @Export()
    public allowLoginPromiseError() {

    }

    @Export()
    public loginByPhoneCodeCallBack(response) {

    }

    @Export()
    public verifiedCallBack(response: any) {

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

    @Export([webworker_rpc.ParamType.num])
    public loadSceneConfig(sceneID: number) {
        // todo world loadSceneConfig
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

    @Export()
    public enterVirtualWorld() {
        const token = localStorage.getItem("token");
        const account = token ? JSON.parse(token) : null;
        Logger.getInstance().log("render---enterVirtualWorld", this.mConfig, token);
        if (!this.mConfig.auth_token) {
            if (!account) {
                this.login();
                return;
            }
            Logger.getInstance().log("render---refreshToken");
            this.mAccount.setAccount(account);
            this.remote[MAIN_WORKER].MainPeer.refreshToken();
        } else {
            // this.mGame.scene.start(LoadingScene.name, { world: this });
            // this.mLoadingManager.start();
            Logger.getInstance().log("render---enterVirtualWorld");
            this.mAccount.setAccount({
                token: this.mConfig.auth_token,
                expire: this.mConfig.token_expire,
                fingerprint: this.mConfig.token_fingerprint,
                refreshToken: account ? account.refreshToken : "",
                id: this.mConfig.user_id ? this.mConfig.user_id : account ? account.id : "",
            });
            this.remote[MAIN_WORKER].MainPeer.loginEnterWorld();
        }
        // this.remote[MAIN_WORKER].MainPeer.enterVirtualWorldCallBack(token);
    }

    @Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str])
    public createAccount(gameID: string, worldID: string, sceneID?: number, locX?: number, locY?: number, locZ?: number) {
        if (!this.mAccount) this.mAccount = new Account();
        this.mAccount.enterGame(gameID, worldID, sceneID, { locX, locY, locZ });
        // this.remote[MAIN_WORKER].MainPeer.createAccount(gameID, worldID, sceneID, loc);
    }

    @Export()
    public refreshAccount(account: any) {
        this.account.refreshToken(account);
    }

    @Export()
    public getAccount(): any {
        return this.mAccount.accountData;
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
        this.sceneManager.wakeScene("LoadingScene", data);
    }

    @Export()
    public hideLoading() {
        this.sceneManager.sleepScene("LoadingScene");
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
        this.newGame();
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
}
