import { RPCPeer, RPCExecutor, Export, webworker_rpc, RemoteListener } from "webworker-rpc";
import { HEARTBEAT_WORKER, HEARTBEAT_WORKER_URL, MAIN_WORKER, MAIN_WORKER_URL } from "structureinterface";
import { Logger } from "utils";

class HeartBeatPeer extends RPCPeer {
    public inited: boolean = false;
    private delayTime: number = 20000;
    private reConnectCount: number = 0;
    private startDelay: any;
    constructor() {
        super(HEARTBEAT_WORKER);
        // this.linkTo(MAIN_WORKER, MAIN_WORKER_URL).onceReady(() => {
        //     Logger.getInstance().log("mainworker link ready");
        // });
        // this.remote[MAIN_WORKER].Connection.on("xx", new RPCExecutor("startBeat", "HeartBeatPeer"));// TODO:使用@RemoteListener
    }

    @Export()
    public startBeat() {
        Logger.getInstance().log("startBeat");
        if (this.startDelay) return;
        this.startDelay = setInterval(() => {
            if (this.reConnectCount >= 8) {
                this.remote[MAIN_WORKER].MainPeer.startHeartBeat("reConnect");
                return;
            }
            this.reConnectCount++;
            // Logger.getInstance().log("heartBeatWorker startBeat");
            this.remote[MAIN_WORKER].MainPeer.startHeartBeat("heartBeat");
        }, this.delayTime);
    }

    @Export()
    public endBeat() {
        this.reConnectCount = 0;
        if (this.startDelay) {
            clearInterval(this.startDelay);
        }
        // Logger.getInstance().log("heartBeatWorker endBeat");
        this.remote[MAIN_WORKER].MainPeer.endHeartBeat();
    }

    @Export()
    public clearBeat() {
        this.reConnectCount = 0;
        // Logger.getInstance().log("heartBeatWorker clearBeat");
        this.remote[MAIN_WORKER].MainPeer.clearHeartBeat(null);
    }

    @Export([webworker_rpc.ParamType.str])
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
                    this.remote[MAIN_WORKER].MainPeer.loadRes(null, new Uint8Array(<any>reader.result));
                    // postMessage({ "method": "completeHandler", "data": xhr.response });
                    close();
                };
            }
        };
        xhr.send(null);
    }
}
const context: HeartBeatPeer = new HeartBeatPeer();
