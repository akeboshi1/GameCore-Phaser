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
import { MAIN_WORKER_URL, RENDER_PEER } from "../structureinterface/worker.name";
// import MainWorker from "worker-loader?filename=js/[name].js!../game/game";

export class Render extends RPCPeer implements GameMain {
    public isConnect: boolean = false;
    public emitter: Phaser.Events.EventEmitter;
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
    constructor(config: ILauncherConfig, callBack?: Function) {
        super(RENDER_PEER);
        this.emitter = new Phaser.Events.EventEmitter();
        this.mConfig = config;
        this.mCallBack = callBack;
        this.linkTo(MAIN_WORKER, MAIN_WORKER_URL).onceReady(() => {
            this.createGame();
            Logger.getInstance().log("worker onReady");
        });
    }

    createGame() {
        this.remote[MAIN_WORKER].MainPeer.createGame(this.mConfig);
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
    public createAccount(gameID: string, worldID: string, sceneID?: number, loc?: any) {
        this.remote[MAIN_WORKER].MainPeer.startConnect(gameID, worldID, sceneID, loc);
    }
    public startConnect(gateway: ServerAddress) {
        this.remote[MAIN_WORKER].MainPeer.startConnect(gateway.host, gateway.port, gateway.secure);
    }
    public newGame(): Phaser.Game {
        if (this.mGame) {
            return this.mGame;
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
        return this.mGame;
    }

    public closeConnect() {
        this.remote[MAIN_WORKER].MainPeer.closeConnect();
    }

    public initWorld(desk: boolean) {
        this.remote[MAIN_WORKER].MainPeer.initWorld(desk);
    }

    public initGame() {
        this.remote[MAIN_WORKER].MainPeer.initGame();
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
        this.newGame();
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

    @Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public onGotoAnotherGame(gameId: string, worldId: string, sceneId?: number, x?: number, y?: number, z?: number) {
        // this.mWorld.onGotoAnotherGame(gameId, worldId, sceneId, { x, y, z });
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
        // this.mWorld.enterVirtualWorld();
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
    public showLoading() {

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
    public createGameCallBack(content: op_client.IOP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT) {

    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public addFillEffect(posX: number, posY: number, status: number) {

    }

    @Export()
    public clearGame() {
        // this.mWorld.clearGame();
    }
}
const MAIN_WORKER = "mainWorker";
