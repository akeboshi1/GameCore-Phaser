import "common-injector";
import { Injectable, rootInjector } from "common-injector";
import { PBpacket } from "net-socket-packet";

@Injectable()
export class WebWorkerControl {
    public static NET_WORKER: string = "networker";
    public static HEARTBEAT_WORKER: string = "heartbeat_worker";
    public static NET_URL: string = "worker-loader?name=js/[hash].[name].js!./networker";
    public static HEARTBEAT_URL: string = "worker-loader?name=js/[hash].[name].js!./heartbeatworker";
    private workers: Map<string, Worker>;
    private rpcMethods_main: Map<any, Function>;
    constructor() {
        this.workers = new Map();
        this.rpcMethods_main = new Map();
    }

    // create worker
    public createWorker(name: string, url: string) {
        const worker = new Worker(url);
        this.workers[name] = worker;
        worker.onmessage = (event: any) => {
            const data = event.data;
            if (data.code !== undefined && data.params !== undefined) {
                this.callMainMethods(data.code, data.params);
            }
        };
    }

    // register worker function
    public registerMainMethods(key: any, fn?: (params: PBpacket) => void) {
        if (key in this.rpcMethods_main) return;
        this.rpcMethods_main[key] = {
            fn
        };
    }

    // main => worker
    public callWorkerMethods(name: string, method: string, params?: any) {
        if (!(name in this.workers)) return;
        this.workers[name].postMessage({ method, params });
    }

    // worker => main
    public callMainMethods(key: any, params?: any) {
        if (!(key in this.rpcMethods_main)) return;
        this.rpcMethods_main[key].fn(params);
    }

    public destroyWorker(name) {
        if (!(name in this.workers)) return;
        const worker = this.workers[name];
        worker.terminate();
        delete this.workers[name];
    }
}
rootInjector.setInstance(WebWorkerControl, new WebWorkerControl());
