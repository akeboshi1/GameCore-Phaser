import { RPCPeer, RPCFunction, webworker_rpc } from "webworker-rpc";
import MainWorker from "worker-loader?filename=[hash][name].js!../game/main.worker";
import { ServerAddress } from "../../lib/net/address";
import { World } from "../game/world";
import { PBpacket } from "net-socket-packet";
export class Render extends RPCPeer {
    public isConnect: boolean = false;
    public moveStyle: number = 0;
    constructor(private mWorld: World) {
        super("render");
        const mainWorker = new MainWorker();
        this.linkTo(MAIN_WORKER, "../game/main.worker");
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

    public initWorld() {
        this.remote[MAIN_WORKER].MainPeer.initWorld();
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

    @RPCFunction([webworker_rpc.ParamType.num])
    public onConnected(moveStyle: number) {
        this.isConnect = true;
        this.moveStyle = moveStyle;
    }

    @RPCFunction()
    public onDisConnected() {
        this.isConnect = false;
    }

    @RPCFunction([webworker_rpc.ParamType.str])
    public onConnectError(error: string) {
        this.isConnect = false;
    }

    @RPCFunction()
    public reconnect() {
        this.mWorld.reconnect();
    }

    @RPCFunction([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public onGotoAnotherGame(gameId: string, worldId: string, sceneId?: number, x?: number, y?: number, z?: number) {
        this.mWorld.onGotoAnotherGame(gameId, worldId, sceneId, { x, y, z });
    }
    @RPCFunction()
    public enterVirtualWorld() {
        this.mWorld.enterVirtualWorld();
    }
    @RPCFunction()
    public onClockReady() {
        this.mWorld.onClockReady();
    }
}
const MAIN_WORKER = "mainWorker";
