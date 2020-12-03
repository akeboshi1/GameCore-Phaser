import { RPCPeer, Export, webworker_rpc } from "webworker-rpc";
import { HEARTBEAT_WORKER, MAIN_WORKER, RENDER_PEER } from "structure";
import { Logger } from "utils";

export const fps: number = 45;
export const delayTime = 1000 / fps;
class HeartBeatPeer extends RPCPeer {
    public inited: boolean = false;
    protected currentTime: number = 0;
    protected mWorkerLoop: any;
    private delayTime: number = 20000;
    private reConnectCount: number = 0;
    private startDelay: any;
    private isStartUpdateFps: boolean = false;
    private startUpdateFps: any;
    constructor() {
        super(HEARTBEAT_WORKER);
        // this.linkTo(MAIN_WORKER, MAIN_WORKER_URL).onceReady(() => {
        //     Logger.getInstance().log("mainworker link ready");
        // });
        // this.remote[MAIN_WORKER].Connection.on("xx", new RPCExecutor("startBeat", "HeartBeatPeer"));// TODO:使用@RemoteListener
    }

    get mainPeer() {
        return this.remote[MAIN_WORKER].MainPeer;
    }

    get render() {
        return this.remote[RENDER_PEER].Render;
    }

    public run(): Promise<any> {
        return new Promise<any>((resolve) => {
            this.currentTime = new Date().getTime();
            const self = this;
            this.mWorkerLoop = setInterval(() => {
                clearInterval(self.mWorkerLoop);
                resolve(new Date().getTime() - self.currentTime);
            }, delayTime);
        });
    }

    public async update() {
        let now: number = 0;
        let tmpTime: number = new Date().getTime();
        for (; ;) {
            await this.run();
            now = new Date().getTime();
            let delay = now - tmpTime;
            if (delay < delayTime) delay = delayTime;
            if (this.mainPeer) this.mainPeer.update(now, delay);
            tmpTime = now;
        }
    }

    @Export()
    public onFocus() {
        if (this.mWorkerLoop) clearInterval(this.mWorkerLoop);
        this.update();
    }

    @Export()
    public onBlur() {
        this.currentTime = 0;
        if (this.mWorkerLoop) clearInterval(this.mWorkerLoop);
    }

    @Export()
    public startUpdate() {
        this.update();
    }

    @Export()
    public updateFps() {
        if (this.isStartUpdateFps) return;
        this.isStartUpdateFps = true;
        this.startUpdateFps = setInterval(() => {
            this.remote[RENDER_PEER].Render.updateFPS();
        }, 100);
    }

    @Export()
    public endFps() {
        if (this.startUpdateFps) {
            clearInterval(this.startUpdateFps);
            this.startUpdateFps = null;
        }
        // Logger.getInstance().log("heartBeatWorker endBeat");
        this.remote[RENDER_PEER].MainPeer.endFPS();
    }

    @Export()
    public startBeat() {
        // tslint:disable-next-line:no-console
        console.log("startBeat======");
        if (this.startDelay) return;
        this.startDelay = setInterval(() => {
            // tslint:disable-next-line:no-console
            console.log("heartbeat++++interval");
            if (this.reConnectCount >= 8) {
                this.remote[MAIN_WORKER].MainPeer.reconnect();
                return;
            }
            this.reConnectCount++;
            // Logger.getInstance().log("heartBeatWorker startBeat");
            this.remote[MAIN_WORKER].MainPeer.startHeartBeat();
        }, this.delayTime);
    }

    @Export()
    public endBeat() {
        this.reConnectCount = 0;
        if (this.startDelay) {
            clearInterval(this.startDelay);
            this.startDelay = null;
        }
        Logger.getInstance().log("heartBeatWorker endBeat");
        this.remote[MAIN_WORKER].MainPeer.endHeartBeat();
    }

    @Export()
    public clearBeat() {
        // tslint:disable-next-line:no-console
        console.log("clearBeat======");
        this.reConnectCount = 0;
        // Logger.getInstance().log("heartBeatWorker clearBeat");
        this.remote[MAIN_WORKER].MainPeer.clearHeartBeat();
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
