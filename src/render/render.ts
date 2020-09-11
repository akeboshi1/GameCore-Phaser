import { RPCExecutePacket } from "../../lib/rpc/rpc.message";
import { RPCPeer, RPCFunction } from "../../lib/rpc/rpc.peer";
import { webworker_rpc } from "pixelpai_proto";
import MainWorker from "worker-loader?filename=[hash][name].js!../game/main.worker";
import { ServerAddress } from "../../lib/net/address";
import { IConnectListener } from "../../lib/net/socket";
import { World } from "../game/world";
import { PBpacket } from "net-socket-packet";
import { CreateRolePanel } from "../role/create.role.panel";
export class Render extends RPCPeer {
    constructor(private mWorld: World) {
        super("render");
        const mainWorker = new MainWorker();
        this.linkTo(MAIN_WORKER, "worker-loader?filename=[hash][name].js!../game/main.worker");
    }
    public startConnect(gateway: ServerAddress) {
        this.remote[MAIN_WORKER].MainPeer.startConnect(null, [gateway.host, gateway.port, gateway.secure]);
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

    public clearHeartBeat() {
        this.remote[MAIN_WORKER].MainPeer.clearBeat();
    }

    public send(packet: PBpacket) {
        this.remote[MAIN_WORKER].MainPeer.send(null, packet.Serialization);
    }

    public terminate() {
        this.remote[MAIN_WORKER].MainPeer.terminate();
    }

    @RPCFunction()
    public onConnected() {
        this.mWorld.connection.connect = true;
        this.mWorld.onConnected();
    }

    @RPCFunction()
    public onDisConnected() {
        this.mWorld.connection.connect = false;
        this.mWorld.onDisConnected();
    }

    @RPCFunction([webworker_rpc.ParamType.str])
    public onConnectError(error: string) {
        this.mWorld.connection.connect = false;
        this.mWorld.onError();
    }
    @RPCFunction()
    public reconnect() {
        this.mWorld.reconnect();
    }

    @RPCFunction([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public onGotoAnotherGame(gameId: string, worldId: string, sceneId?: number, x?: number, y?: number, z?: number) {
        this.mWorld.onGotoAnotherGame(gameId, worldId, sceneId, { x, y, z });
    }

    @RPCFunction([webworker_rpc.ParamType.str])
    public onData(buffer: Buffer) {
        this.mWorld.connection.onData(buffer.buffer);
    }
}
const MAIN_WORKER = "mainWorker";
