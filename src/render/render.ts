import { RPCPeer, Export, webworker_rpc, RemoteListener } from "webworker-rpc";
import MainWorker from "worker-loader?filename=[hash][name].js!../game/main.worker";
import { PBpacket } from "net-socket-packet";
import { World } from "./world";
import { ServerAddress } from "../../lib/net/address";
import { MessageType } from "../messageType/MessageType";
export class Render extends RPCPeer {
    public isConnect: boolean = false;
    private _moveStyle: number = 0;
    private _curTime: number;
    private mainPeer: any;
    constructor(private mWorld: World) {
        super("render");
        this.linkTo(MAIN_WORKER, "../game/main.worker").onceReady(() => {
            this.mainPeer = this.remote[MAIN_WORKER].MainPeer;
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
    public createAccount(gameID: string, worldID: string, sceneID?: number, loc?: any) {
        this.mainPeer.startConnect(gameID, worldID, sceneID, loc);
    }
    public startConnect(gateway: ServerAddress) {
        this.mainPeer.startConnect(gateway.host, gateway.port, gateway.secure);
    }

    public closeConnect() {
        this.mainPeer.closeConnect();
    }

    public initWorld(desk: boolean) {
        this.mainPeer.initWorld(desk);
    }

    public initGame() {
        this.mainPeer.initGame();
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

    @RemoteListener("mainWorker", "mainPeer",MessageType )
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
        this.mWorld.connectFail();
    }

    @Export()
    public reconnect() {
        this.mWorld.reconnect();
    }

    @Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public onGotoAnotherGame(gameId: string, worldId: string, sceneId?: number, x?: number, y?: number, z?: number) {
        this.mWorld.onGotoAnotherGame(gameId, worldId, sceneId, { x, y, z });
    }

    @Export([webworker_rpc.ParamType.num])
    public setMoveStyle(moveStyle: number) {
        this._moveStyle = moveStyle;
    }

    @Export()
    public enterVirtualWorld() {
        this.mWorld.enterVirtualWorld();
    }

    @Export()
    public onClockReady() {
        this.mWorld.onClockReady();
    }

    @Export([webworker_rpc.ParamType.num])
    public roomPause(roomID: number) {

    }

    @Export([webworker_rpc.ParamType.num])
    public roomResume(roomID: number) {

    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public setCameraBounds(x: number, y: number, width: number, height: number) {

    }

    @Export([webworker_rpc.ParamType.num])
    public getCurTime(curTime: number) {
        this._curTime = curTime;
    }

    @Export()
    public clearGame() {
        this.mWorld.clearGame();
    }
}
const MAIN_WORKER = "mainWorker";
