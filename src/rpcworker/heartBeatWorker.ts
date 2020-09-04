import { RPCPeer } from "./rpc/rpc.peer";
import { webworker_rpc } from "pixelpai_proto";
import { RPCExecutor, RPCExecutePacket } from "./rpc/rpc.message";

onmessage = (e) => {
    const { key } = e.data;
    if (key === "init") {
        const { worker } = e.data;

        // tslint:disable-next-line:no-console
        console.log("heartBeatWorker onmessage: init");
        if (heartBeatWorkerContext.inited) return;
        heartBeatWorkerContext.inited = true;

        const ports = e.ports;
        for (let i = 0; i < ports.length; i++) {
            const port = ports[i];
            const w = worker[i];
            peer.addLink(w, port);
        }

    } else if (key === "register") {
        peer.registerExecutor(heartBeatWorkerContext, new RPCExecutor("startBeat", "heartBeatWorkerContext"));
        peer.registerExecutor(heartBeatWorkerContext, new RPCExecutor("endBeat", "heartBeatWorkerContext"));
        peer.registerExecutor(heartBeatWorkerContext, new RPCExecutor("clearBeat", "heartBeatWorkerContext"));
        peer.registerExecutor(heartBeatWorkerContext, new RPCExecutor("loadRes", "heartBeatWorkerContext"));
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
                peer.execute(MAIN_WORKER, new RPCExecutePacket(HEARTBEAT_WORKER, "startBeat", "context", [param]));
                return;
            }
            this.reConnectCount++;
            param.valStr = "heartBeat";
            // Logger.getInstance().log("heartBeatWorker startBeat");
            peer.execute(MAIN_WORKER, new RPCExecutePacket(HEARTBEAT_WORKER, "startBeat", "context", [param]));
        }, this.delayTime);
    }

    public endBeat() {
        this.reConnectCount = 0;
        if (this.startDelay) {
            clearInterval(this.startDelay);
        }
        // Logger.getInstance().log("heartBeatWorker endBeat");
        peer.execute(MAIN_WORKER, new RPCExecutePacket(HEARTBEAT_WORKER, "endHeartBeat", "context"));
    }

    public clearBeat() {
        this.reConnectCount = 0;
        // Logger.getInstance().log("heartBeatWorker clearBeat");
        peer.execute(MAIN_WORKER, new RPCExecutePacket(HEARTBEAT_WORKER, "clearBeat", "context"));
    }

    public loadRes(url: string) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "blob";
        xhr.onload = function() {
            if (xhr.readyState === 4) {
                const blob = xhr.response;
                const reader = new FileReader();
                reader.readAsArrayBuffer(blob);
                reader.onload = function(e) {
                    const param = new webworker_rpc.Param();
                    param.t = webworker_rpc.ParamType.arrayBuffer;
                    param.valBytes = new Uint8Array(<any>reader.result);
                    peer.execute(MAIN_WORKER, new RPCExecutePacket(MAIN_WORKER, "loadRes", "heartBeatWorkerContext", [param]));
                    // postMessage({ "method": "completeHandler", "data": xhr.response });
                    close();
                };
            }
        };
        xhr.send(null);
    }
}

const heartBeatWorkerContext: HeartBeatWorkerContext = new HeartBeatWorkerContext();
const peer: RPCPeer = new RPCPeer("heartBeatWorker", self as any);
const MAIN_WORKER = "mainWorker";
const HEARTBEAT_WORKER = "heartBeatWorker";
