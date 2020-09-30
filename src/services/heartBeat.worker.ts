import { RPCPeer, RPCExecutor, Export, webworker_rpc } from "../render/node_modules/webworker-rpc";

class HeartBeatPeer extends RPCPeer {
    public inited: boolean = false;
    private delayTime: number = 20000;
    private reConnectCount: number = 0;
    private startDelay: any;
    private mainPeer;
    constructor() {
        super("hearBeatWorker");
        (<any>this).linkTo(MAIN_WORKER, "worker-loader?filename=[hash][name].js!../game/main.worker").onReady(() => {
            this.mainPeer = this.remote[MAIN_WORKER].MainPeer;
        });

        this.remote[MAIN_WORKER].Connection.on("xx", new RPCExecutor("HeartBeatPeer", "startBeat"));
    }

    @Export()
    public startBeat() {
        if (this.startDelay) return;
        this.startDelay = setInterval(() => {
            if (this.reConnectCount >= 8) {
                this.mainPeer.startBeat(null, "reConnect");
                return;
            }
            this.reConnectCount++;
            // Logger.getInstance().log("heartBeatWorker startBeat");
            this.mainPeer.startBeat(null, "heartBeat");
        }, this.delayTime);
    }

    @Export()
    public endBeat() {
        this.reConnectCount = 0;
        if (this.startDelay) {
            clearInterval(this.startDelay);
        }
        // Logger.getInstance().log("heartBeatWorker endBeat");
        this.mainPeer.endHeartBeat(null);
    }

    @Export()
    public clearBeat() {
        this.reConnectCount = 0;
        // Logger.getInstance().log("heartBeatWorker clearBeat");
        this.mainPeer.clearBeat(null);
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
                    this.mainPeer.loadRes(null, new Uint8Array(<any>reader.result));
                    // postMessage({ "method": "completeHandler", "data": xhr.response });
                    close();
                };
            }
        };
        xhr.send(null);
    }
}

const MAIN_WORKER = "mainWorker";
const HEARTBEAT_WORKER = "heartBeatWorker";
