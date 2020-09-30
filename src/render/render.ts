import { RPCPeer, Export, webworker_rpc } from "webworker-rpc";
import MainWorker from "worker-loader?filename=[hash][name].js!../game/main.worker";
import { PBpacket } from "net-socket-packet";
import { World } from "./world";
import { ServerAddress } from "../../lib/net/address";
export class Render extends RPCPeer {
    public isConnect: boolean = false;
    private _moveStyle: number = 0;
    private _curTime: number;
    constructor(private mWorld: World) {
        super("render");
        this.linkTo(MAIN_WORKER, "../game/main.worker");
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
    public createAccount(gameID: string, worldID: string, sceneID?: number, loc?: any) {
        this.remote[MAIN_WORKER].MainPeer.startConnect(null, gameID, worldID, sceneID, loc);
    }
    public startConnect(gateway: ServerAddress) {
        this.remote[MAIN_WORKER].MainPeer.startConnect(null, gateway.host, gateway.port, gateway.secure);
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
        this.remote[MAIN_WORKER].MainPeer.send(null, packet.Serialization);
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
        this.remote[MAIN_WORKER].MainPeer.syncClock(null, times);
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

    @Export([webworker_rpc.ParamType.number])
    public roomPause(roomID: number) {

    }

    @Export([webworker_rpc.ParamType.number])
    public roomResume(roomID: number) {

    }

    @Export([webworker_rpc.ParamType.number, webworker_rpc.ParamType.number, webworker_rpc.ParamType.number, webworker_rpc.ParamType.number])
    public setCameraBounds(x: number, y: number, width: number, height: number) {

    }

    @Export([webworker_rpc.ParamType.number])
    public getCurTime(curTime: number) {
        this._curTime = curTime;
    }

    @Export()
    public clearGame() {
        this.mWorld.clearGame();
    }
}
const MAIN_WORKER = "mainWorker";
