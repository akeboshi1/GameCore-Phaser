import HeartBeatWorker from "worker-loader?filename=[name].js!./heartBeat.worker";
import { RPCPeer, RPCFunction } from "../../lib/rpc/rpc.peer";
import { webworker_rpc } from "pixelpai_proto";
import { SocketConnection, IConnectListener, SocketConnectionError } from "../../lib/net/socket";
import { PBpacket, Buffer } from "net-socket-packet";
import { ServerAddress } from "../../lib/net/address";
import * as protos from "pixelpai_proto";
import { Logger } from "../utils/log";
for (const key in protos) {
    PBpacket.addProtocol(protos[key]);
}
// 主worker 带有socket通信（原因：socket通信会传输数据，如果socket在子worker中处理，主worker和子worker之间还要再有一道数据传输对性能会有影响）
const worker: Worker = self as any;
worker.onmessage = (e: MessageEvent) => {
    const data = e.data;
    const method = data.method;
    if (!context.peer) context.peer = new RPCPeer("mainWorker", worker);
    switch (method) {
        case "init":
            // Logger.getInstance().log("mainWorker onmessage: init");
            if (context.inited) return;
            context.inited = true;
            const heartBeatWorker = new HeartBeatWorker();
            // 增加worker引用
            context.addWorker(HEARTBEAT_WORKER, heartBeatWorker);
            // heartbeat与main之间的通道
            const channelHeartBeatToMain = new MessageChannel();
            const initState: WorkerState = {
                "key": "init",
                "worker": [MAIN_WORKER]
            };
            const ports = [channelHeartBeatToMain.port2];
            // 初始化worker状态
            context.initWorker(HEARTBEAT_WORKER, initState, ports);
            // 将worker与channel通道联系起来
            context.peer.addLink(HEARTBEAT_WORKER, channelHeartBeatToMain.port1);
            // context.linkMainWorker(HEARTBEAT_WORKER, linkMainState, channelHeartBeatToMain);
            context.peer.onChannelReady = (workerName: string) => {
                if (workerName === HEARTBEAT_WORKER) {
                    worker.postMessage({ method: "canStartBeat" });
                }
            };
            break;
        case "connect":
            const addr: ServerAddress = data.address;
            if (addr) socket.startConnect(addr);
            break;
        case "send":
            const buf = data.buffer;
            socket.send(new Buffer(buf));
            break;
        case "startBeat":
            // context.peer.remote.heartBeatWorker.HeartBeatWorkerContext.startBeat(null);
            context.peer.remote[HEARTBEAT_WORKER].HeartBeatWorkerContext.startBeat(null);
            break;
        case "endBeat":
            context.peer.remote[HEARTBEAT_WORKER].HeartBeatWorkerContext.endBeat(null);
            break;
        case "clearBeeat":
            context.peer.remote[HEARTBEAT_WORKER].HeartBeatWorkerContext.clearBeat(null);
            break;
        case "loadRes":
            const url: string = data.url;
            context.peer.remote[HEARTBEAT_WORKER].HeartBeatWorkerContext.loadRes(null, url);
            break;
        case "focus":
            socket.pause = false;
            context.peer.remote[HEARTBEAT_WORKER].HeartBeatWorkerContext.clearBeat(null);
            break;
        case "blur":
            socket.pause = true;
            break;
        case "close":
            context.terminate();
            worker.terminate();
            break;
        // move
        case "move":
            // const movePath = data.data;
            // const lastPos = data.point;
            // let point = null;
            // let now: number = 0;
            // let duration: number = 0;
            // let angle: number = 0;
            // let paths: any[] = [];
            // for (const path of movePath) {
            //     point = path.point3f;
            //     if (!(point.y === lastPos.y && point.x === lastPos.x)) {
            //         angle = Math.atan2(point.y - lastPos.y, point.x - lastPos.x) * (180 / Math.PI);
            //     }
            //     now += duration;
            //     duration = path.timestemp - now;
            //     paths.push({
            //         x: point.x,
            //         y: point.y + this.offsetY,
            //         duration,
            //         onStartParams: angle,
            //         onStart: (tween, target, params) => {
            //             this.onCheckDirection(params);
            //         },
            //         onCompleteParams: { duration, index },
            //         onComplete: (tween, targets, params) => {
            //             this.onMovePathPointComplete(params);
            //         }
            //     });
            //     lastPos = new Pos(point.x, point.y);
            //     index++;
            //     path.timestemp -= now;
            // }
            break;
    }
};
// worker对应的实体，用于注册worker之间的回调，方法
class MainWorkerContext {
    public inited: boolean = false;
    public peer: RPCPeer;
    public workerMap: Map<string, Worker>;
    public addWorker(name: string, webworker: Worker) {
        if (!this.workerMap) this.workerMap = new Map();
        if (this.workerMap.get(name)) return;
        this.workerMap.set(name, webworker);
    }
    public initWorker(name: string, state: WorkerState, ports: MessagePort[]) {
        if (!this.workerMap || !this.workerMap.get(name)) return;
        // tslint:disable-next-line:no-shadowed-variable
        const worker: Worker = this.workerMap.get(name);
        worker.postMessage(state, ports);
    }
    public terminate() {
        if (!this.workerMap) return;
        this.workerMap.forEach((subWorker) => {
            subWorker.terminate();
        });
    }
    public linkMainWorker(name: string, state: WorkerState, channel: MessageChannel) {
        if (!this.workerMap || !this.workerMap.get(name)) return;
        this.peer.addLink(name, channel.port1);
        // tslint:disable-next-line:no-shadowed-variable
        const worker: Worker = this.workerMap.get(name);
        worker.postMessage(state, [channel.port2]);
    }
    public linkWorker(name: string, state: WorkerState, port: MessagePort) {
        if (!this.workerMap || !this.workerMap.get(name)) return;
        // tslint:disable-next-line:no-shadowed-variable
        const worker: Worker = this.workerMap.get(name);
        worker.postMessage(state, [port]);
    }
    public registerExecutor(state: WorkerState) {
        // Logger.getInstance().log("register worker");
        this.workerMap.forEach((value: Worker) => {
            value.postMessage(state);
            // Logger.getInstance().log("register" + "state");
        });
    }

    public onConnected() {
        // 告诉主进程链接成功
        worker.postMessage({
            method: "onConnected",
        });
    }

    public onDisConnected() {
        // 告诉主进程断开链接
        worker.postMessage({
            method: "onDisConnected",
        });
    }
    public onConnectError(error: string) {
        // 告诉主进程断开链接
        worker.postMessage({
            method: "onConnectError",
            error,
        });
    }

    public onData(buffer: Buffer) {
        // 告诉主进程socket数据
        worker.postMessage(buffer.buffer, [buffer.buffer]);
    }

    @RPCFunction([webworker_rpc.ParamType.str])
    public startBeat() {
        // Logger.getInstance().log("mainwork");
        worker.postMessage({ "method": "startBeat" });
    }
    @RPCFunction()
    public endHeartBeat() {
        worker.postMessage({ "method": "endHeartBeat" });
    }
    @RPCFunction()
    public clearBeat() {
    }
    @RPCFunction([webworker_rpc.ParamType.unit8array])
    public loadRes(bytes: Uint8Array) {
        // Logger.getInstance().log("workerload" + bytes);
    }
    public focus() {
        socket.pause = false;
    }
    public blur() {
        socket.pause = true;
    }
}

interface WorkerState {
    key: string;
    data?: any;
    worker?: any;
}

const context: MainWorkerContext = new MainWorkerContext();

class ConnListener implements IConnectListener {
    onConnected(): void {
        context.onConnected();
        // context.peer.execute(MAIN_WORKER, new RPCExecutePacket(NET_WORKER, "onConnected", "context"));
        Logger.getInstance().info(`MainWorker[已连接]`);
    }

    onDisConnected(): void {
        context.onDisConnected();
        // context.peer.execute(MAIN_WORKER, new RPCExecutePacket(NET_WORKER, "onDisConnected", "context"));
        Logger.getInstance().info(`MainWorker[已断开]`);
    }

    // reason: SocketConnectionError | undefined
    onError(reason: SocketConnectionError | undefined): void {
        if (reason) {
            context.onConnectError(reason.message);
            Logger.getInstance().error(`MainWorker[错误]:${reason.message}`);
        } else {
            Logger.getInstance().error(`MainWorker[错误]:${reason}`);
        }
    }
}

class WorkerClient extends SocketConnection {
    protected mUuid: number = 0;
    // private _loop: WorkerLoop;
    private _pause: boolean = false;
    constructor($listener: IConnectListener) {
        super($listener);
        // const loop: WorkerLoop = new WorkerLoop();
        // loop.add("workerClient", this);
        // loop.start();
    }
    send(data: any): void {
        if (this._pause) return;
        const protobuf_packet: PBpacket = new PBpacket();
        protobuf_packet.Deserialization(new Buffer(data));
        protobuf_packet.header.uuid = this.mUuid || 0;
        super.send(protobuf_packet.Serialization());
        Logger.getInstance().info(`MainWorker[发送] >>> ${protobuf_packet.toString()}`);
    }
    onData(data: any) {
        if (this._pause) return;
        const protobuf_packet: PBpacket = new PBpacket();
        protobuf_packet.Deserialization(new Buffer(data));
        this.mUuid = protobuf_packet.header.uuid;
        Logger.getInstance().info(`MainWorker[接收] <<< ${protobuf_packet.toString()} `);
        // Send the packet to parent thread
        const buffer = protobuf_packet.Serialization();
        context.onData(buffer);
    }

    set pause(value: boolean) {
        this._pause = value;
    }
}
// run socket client through web-worker
const socket: WorkerClient = new WorkerClient(new ConnListener());
const MAIN_WORKER = "mainWorker";
const HEARTBEAT_WORKER = "heartBeatWorker";
