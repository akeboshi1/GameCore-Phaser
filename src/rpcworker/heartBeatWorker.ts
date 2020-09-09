import { RPCPeer, RPCFunction } from "./rpc/rpc.peer";
import { webworker_rpc } from "pixelpai_proto";

onmessage = (e) => {
    const { key } = e.data;
    if (key === "init") {
        const { worker } = e.data;

        // tslint:disable-next-line:no-console
        // console.log("heartBeatWorker onmessage: init");
        if (heartBeatWorkerContext.inited) return;
        heartBeatWorkerContext.inited = true;

        const ports = e.ports;
        for (let i = 0; i < ports.length; i++) {
            const port = ports[i];
            const w = worker[i];
            peer.addLink(w, port);
        }

    }
    // else if (key === "register") {
    //     peer.registerExecutor(heartBeatWorkerContext, new RPCExecutor("startBeat", "heartBeatWorkerContext"));
    //     peer.registerExecutor(heartBeatWorkerContext, new RPCExecutor("endBeat", "heartBeatWorkerContext"));
    //     peer.registerExecutor(heartBeatWorkerContext, new RPCExecutor("clearBeat", "heartBeatWorkerContext"));
    //     peer.registerExecutor(heartBeatWorkerContext, new RPCExecutor("loadRes", "heartBeatWorkerContext"));
    // }
};

class HeartBeatWorkerContext {
    public inited: boolean = false;
    private delayTime: number = 20000;
    private reConnectCount: number = 0;
    private startDelay: any;
    @RPCFunction()
    public startBeat() {
        if (this.startDelay) return;
        this.startDelay = setInterval(() => {
            if (this.reConnectCount >= 8) {
                peer.remote[MAIN_WORKER].MainWorkerContext.startBeat(null, "reConnect");
                return;
            }
            this.reConnectCount++;
            // Logger.getInstance().log("heartBeatWorker startBeat");
            peer.remote[MAIN_WORKER].MainWorkerContext.startBeat(null, "heartBeat");
        }, this.delayTime);
    }

    @RPCFunction()
    public endBeat() {
        this.reConnectCount = 0;
        if (this.startDelay) {
            clearInterval(this.startDelay);
        }
        // Logger.getInstance().log("heartBeatWorker endBeat");
        peer.remote[MAIN_WORKER].MainWorkerContext.endHeartBeat(null);
    }

    @RPCFunction()
    public clearBeat() {
        this.reConnectCount = 0;
        // Logger.getInstance().log("heartBeatWorker clearBeat");
        peer.remote[MAIN_WORKER].MainWorkerContext.clearBeat(null);
    }

    @RPCFunction([webworker_rpc.ParamType.str])
    public loadRes(url: string) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "blob";
        xhr.onload = () => {
            if (xhr.readyState === 4) {
                const blob = xhr.response;
                const reader = new FileReader();
                reader.readAsArrayBuffer(blob);
                reader.onload = (e) => {
                    peer.remote[MAIN_WORKER].MainWorkerContext.loadRes(null, new Uint8Array(<any>reader.result));
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
