import HeartBeatWorker from "worker-loader?name=js/[name].js!./heartBeatworker";
import { RPCPeer } from "./rpc/rpc.peer";
import { webworker_rpc } from "pixelpai_proto";
import { RPCExecutor, RPCExecutePacket } from "./rpc/rpc.message";
import { SocketConnection, IConnectListener, SocketConnectionError } from "../net/socket";
import { PBpacket, Buffer } from "net-socket-packet";
import { Logger } from "../utils/log";
import { ServerAddress } from "../net/address";
import * as protos from "pixelpai_proto";
for (const key in protos) {
    PBpacket.addProtocol(protos[key]);
}
// 主worker 带有socket通信（原因：socket通信会传输数据，如果socket在子worker中处理，主worker和子worker之间还要再有一道数据传输对性能会有影响）
const worker: Worker = self as any;
worker.onmessage = (e: MessageEvent) => {
    const data = e.data;
    const method = data.method;
    context.peer = new RPCPeer("mainWorker", worker);
    switch (method) {
        case "init":
            Logger.getInstance().log("mainWorker onmessage: init");
            if (context.inited) return;
            context.inited = true;
            const heartBeatworker = new HeartBeatWorker();
            // 增加worker引用
            context.addWorker(HEARTBEAT_WORKER, heartBeatworker);
            const initState: WorkerState = {
                "key": "init"
            };
            // 初始化worker状态
            context.initWorker(HEARTBEAT_WORKER, initState);

            // heartbeat与main之间的通道
            const channelHeartBeatToMain = new MessageChannel();

            const linkMainState: WorkerState = {
                "key": "link",
                "data": MAIN_WORKER
            };
            // 将worker与channel通道联系起来
            context.linkMainWorker(HEARTBEAT_WORKER, linkMainState, channelHeartBeatToMain);
            break;
        case "register":
            // worker注册表方法更新
            if (context.registed) return;
            context.registed = true;

            const callBackParam = new webworker_rpc.Param();
            callBackParam.t = webworker_rpc.ParamType.str;
            // 注册peer桥梁可被调用方法
            context.peer.registerExecutor(context, new RPCExecutor("mainWorkerCallback", "context", [callBackParam]));

            // 通知自己的子worker注册各自方法
            const registerState: WorkerState = {
                "key": "register"
            };
            context.registerExecutor(registerState);
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
            context.peer.execute(HEARTBEAT_WORKER,
                new RPCExecutePacket(MAIN_WORKER, "startBeat", "heartBeatWorkerContext"));
            break;
        case "endBeat":
            context.peer.execute(HEARTBEAT_WORKER,
                new RPCExecutePacket(MAIN_WORKER, "endBeat", "heartBeatWorkerContext"));
            break;
        case "clearBeeat":
            context.peer.execute(HEARTBEAT_WORKER,
                new RPCExecutePacket(MAIN_WORKER, "clearBeat", "heartBeatWorkerContext"));
            break;
    }
    //  if (e.data === "start") {
    //     // 由socket通信影响对应worker
    //     // tslint:disable-next-line:no-console
    //     console.log("mainWorker onmessage: start");
    //     const callback = new webworker_rpc.Executor();
    //     callback.method = "mainWorkerCallback";
    //     callback.context = "context";
    //     const paramCB = new webworker_rpc.Param();
    //     paramCB.t = webworker_rpc.ParamType.str;
    //     paramCB.valStr = "callbackFrom";
    //     callback.params = [paramCB];

    //     // // A
    //     // const paramA = new webworker_rpc.Param();
    //     // paramA.t = webworker_rpc.ParamType.boolean;
    //     // paramA.valBool = true;
    //     // peer.execute("workerA", new RPCExecutePacket(peer.name, "methodA", "contextA", [paramA], callback));

    //     // // B
    //     // const paramB = new webworker_rpc.Param();
    //     // paramB.t = webworker_rpc.ParamType.num;
    //     // paramB.valNum = 333;
    //     // peer.execute("workerB", new RPCExecutePacket(peer.name, "methodB", "contextB", [paramB], callback));

    //     // // C
    //     // const paramC = new webworker_rpc.Param();
    //     // paramC.t = webworker_rpc.ParamType.arrayBuffer;
    //     // paramC.valBytes = new Uint8Array(webworker_rpc.Executor.encode(callback).finish().buffer.slice(0));
    //     // peer.execute("workerC", new RPCExecutePacket(peer.name, "methodC", "contextC", [paramC], callback));
    //     // const paramC = new webworker_rpc.Param();
    //     // paramC.t = webworker_rpc.ParamType.arrayBuffer;
    //     // paramC.valBytes = new Uint8Array(webworker_rpc.Executor.encode(callback).finish().buffer.slice(0));
    //     // peer.execute("workerC", new RPCExecutePacket(peer.name, "methodC", "contextC", [paramC], callback));
    // }
};

// worker对应的实体，用于注册worker之间的回调，方法
class MainWorkerContext {
    public inited: boolean = false;
    public registed: boolean = false;
    public peer: RPCPeer;
    public workerMap: Map<string, Worker>;
    public addWorker(name: string, webworker: Worker) {
        if (!this.workerMap) this.workerMap = new Map();
        if (this.workerMap[name]) return;
        this.workerMap[name] = webworker;
    }
    public initWorker(name: string, state: WorkerState) {
        if (!this.workerMap || !this.workerMap[name]) return;
        // tslint:disable-next-line:no-shadowed-variable
        const worker: Worker = this.workerMap[name];
        worker.postMessage(state);
    }

    public linkMainWorker(name: string, state: WorkerState, channel: MessageChannel) {
        if (!this.workerMap || !this.workerMap[name]) return;
        this.peer.addLink(name, channel.port1);
        // tslint:disable-next-line:no-shadowed-variable
        const worker: Worker = this.workerMap[name];
        worker.postMessage(state, [channel.port2]);
    }
    public linkWorker(name: string, state: WorkerState, port: MessagePort) {
        if (!this.workerMap || !this.workerMap[name]) return;
        // tslint:disable-next-line:no-shadowed-variable
        const worker: Worker = this.workerMap[name];
        worker.postMessage(state, [port]);
    }
    public registerExecutor(state: WorkerState) {
        this.workerMap.forEach((value: Worker) => {
            value.postMessage(state);
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

    public startBeat(method: string) {
        worker.postMessage({ "method": method });
    }
    public endBeat() {
        worker.postMessage({ "method": "endHeartBeat" });
    }
    public clearBeat() {
    }
}

interface WorkerState {
    key: string;
    data?: any;
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
    send(data: any): void {
        const protobuf_packet: PBpacket = new PBpacket();
        protobuf_packet.Deserialization(new Buffer(data));
        protobuf_packet.header.uuid = this.mUuid || 0;
        super.send(protobuf_packet.Serialization());
        Logger.getInstance().info(`MainWorker[发送] >>> ${protobuf_packet.toString()}`);
    }

    onData(data: any) {
        const protobuf_packet: PBpacket = new PBpacket();
        protobuf_packet.Deserialization(new Buffer(data));
        this.mUuid = protobuf_packet.header.uuid;
        Logger.getInstance().info(`MainWorker[接收] <<< ${protobuf_packet.toString()} `);
        // Send the packet to parent thread
        const buffer = protobuf_packet.Serialization();
        context.onData(buffer);
    }
}
// run socket client through web-worker
const socket: SocketConnection = new WorkerClient(new ConnListener());
const MAIN_WORKER = "mainworker";
const HEARTBEAT_WORKER = "heartbeatworker";
