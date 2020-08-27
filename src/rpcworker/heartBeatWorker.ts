import { RPCPeer } from "./rpc/rpc.peer";
import { webworker_rpc } from "pixelpai_proto";
import { RPCExecutor, RPCExecutePacket } from "./rpc/rpc.message";

onmessage = (e) => {
    const data = e.data;
    const { key } = e.data;
    if (key === "init") {
        // tslint:disable-next-line:no-console
        console.log("heartBeatWorker onmessage: init");
        if (heartBeatWorkerContext.inited) return;
        heartBeatWorkerContext.inited = true;

        peer = new RPCPeer("heartBeatWorker", self as any);
    } else if (key === "register") {
        peer.registerExecutor(heartBeatWorkerContext, new RPCExecutor("startBeat", "heartBeatWorkerContext"));
        peer.registerExecutor(heartBeatWorkerContext, new RPCExecutor("endBeat", "heartBeatWorkerContext"));
        peer.registerExecutor(heartBeatWorkerContext, new RPCExecutor("clearBeat", "heartBeatWorkerContext"));
    }
};

class HeartBeatWorkerContext {
    public inited: boolean = false;
    private delayTime: number = 20000;
    private reConnectCount: number = 0;
    private startDelay: any;

    public startBeat() {
        this.startDelay = setInterval(() => {
            const param = new webworker_rpc.Param();
            param.t = webworker_rpc.ParamType.str;
            if (this.reConnectCount >= 8) {
                param.valStr = "reConnect";
                peer.execute(MAIN_WORKER, new RPCExecutePacket(MAIN_WORKER, "startBeat", "heartBeatWorkerContext", [param]));
                return;
            }
            this.reConnectCount++;
            param.valStr = "heartBeat";
            peer.execute(MAIN_WORKER, new RPCExecutePacket(MAIN_WORKER, "startBeat", "heartBeatWorkerContext", [param]));
        }, this.delayTime);
    }

    public endBeat() {
        this.reConnectCount = 0;
        if (this.startDelay) {
            clearInterval(this.startDelay);
        }
        peer.execute(MAIN_WORKER, new RPCExecutePacket(MAIN_WORKER, "endHeartBeat", "heartBeatWorkerContext"));
    }

    public clearBeat() {
        this.reConnectCount = 0;
        peer.execute(MAIN_WORKER, new RPCExecutePacket(MAIN_WORKER, "clearBeat", "heartBeatWorkerContext"));
    }
}

const heartBeatWorkerContext: HeartBeatWorkerContext = new HeartBeatWorkerContext();
let peer: RPCPeer;
const MAIN_WORKER = "mainworker";
const HEARTBEAT_WORKER = "heartbeatworker";
