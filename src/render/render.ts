import { RPCPeer, Export, webworker_rpc } from "webworker-rpc";
import MainWorker from "worker-loader?filename=[hash][name].js!../game/main.worker";
import { PBpacket } from "net-socket-packet";
import { World } from "./world";
import { ServerAddress } from "../../lib/net/address";
export class Render extends RPCPeer {
    public isConnect: boolean = false;
    private _moveStyle: number = 0;
    private _curTime: number;
    private mainWorker: any;
    constructor(private mWorld: World) {
        super("render");
        this.linkTo(MAIN_WORKER, "../game/main.worker").onceReady(() => {
            this.mainWorker = this.remote[MAIN_WORKER].MainPeer;
        });
    }

    get curTime(): number {
        return this._curTime;
    }

    get moveStyle(): number {
        return this._moveStyle;
    }

    public initGameConfig(config: any) {
        this.mainWorker.initGameConfig(JSON.stringify(config));
    }
    public createAccount(gameID: string, worldID: string, sceneID?: number, loc?: any) {
        this.mainWorker.startConnect(gameID, worldID, sceneID, loc);
    }
    public startConnect(gateway: ServerAddress) {
        this.mainWorker.startConnect(gateway.host, gateway.port, gateway.secure);
    }

    public closeConnect() {
        this.mainWorker.closeConnect();
    }

    public initWorld(desk: boolean) {
        this.mainWorker.initWorld(desk);
    }

    public initGame() {
        this.mainWorker.initGame();
    }

    public send(packet: PBpacket) {
        this.mainWorker.send(packet.Serialization);
    }

    public terminate() {
        this.mainWorker.terminate();
    }

    public onFocus() {
        this.mainWorker.focus();
    }

    public onBlur() {
        this.mainWorker.blur();
    }

    public syncClock(times: number) {
        this.mainWorker.syncClock(times);
    }

    public clearClock() {
        this.mainWorker.clearClock();
    }

    public destroyClock() {
        this.mainWorker.destroyClock();
    }

    public clearGameComplete() {
        this.mainWorker.clearGameComplete();
    }

    public requestCurTime() {
        this.mainWorker.requestCurTime();
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
