import HeartBeatWorker from "worker-loader?filename=[name].js!../rpcworker/heartBeatWorker";
import { RPCPeer, RPCFunction } from "./rpc/rpc.peer";
import { webworker_rpc } from "pixelpai_proto";
import { RPCExecutor, RPCExecutePacket } from "./rpc/rpc.message";
import { SocketConnection, IConnectListener, SocketConnectionError } from "../net/socket";
import { PBpacket, Buffer } from "net-socket-packet";
import { Logger } from "../utils/log";
import { ServerAddress } from "../net/address";
import * as protos from "pixelpai_proto";
import { WorkerLoop, ILoop } from "./workerLoop";
for (const key in protos) {
    PBpacket.addProtocol(protos[key]);
}
// t: current time（当前时间）；
// b: beginning value（初始值）；
// c: change in value（变化量）；
// d: duration（持续时间）。
// ps：Elastic和Back有其他可选参数，里面都有说明。
const Tween = {
    Linear(t, b, c, d) { return c * t / d + b; },
    Quad: {
        easeIn(t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        easeOut(t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        easeInOut(t, b, c, d) {
            // tslint:disable-next-line:no-conditional-assignment
            if ((t /= d / 2) < 1) return c / 2 * t * t + b;
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        }
    },
    Cubic: {
        easeIn(t, b, c, d) {
            return c * (t /= d) * t * t + b;
        },
        easeOut(t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        },
        easeInOut(t, b, c, d) {
            // tslint:disable-next-line:no-conditional-assignment
            if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t + 2) + b;
        }
    },
    Quart: {
        easeIn(t, b, c, d) {
            return c * (t /= d) * t * t * t + b;
        },
        easeOut(t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        easeInOut(t, b, c, d) {
            // tslint:disable-next-line:no-conditional-assignment
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        }
    },
    Quint: {
        easeIn(t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },
        easeOut(t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        },
        easeInOut(t, b, c, d) {
            // tslint:disable-next-line:no-conditional-assignment
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        }
    },
    Sine: {
        easeIn(t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        },
        easeOut(t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b;
        },
        easeInOut(t, b, c, d) {
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        }
    },
    Expo: {
        easeIn(t, b, c, d) {
            return (t === 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
        },
        easeOut(t, b, c, d) {
            return (t === d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        },
        easeInOut(t, b, c, d) {
            if (t === 0) return b;
            if (t === d) return b + c;
            // tslint:disable-next-line:no-conditional-assignment
            if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
            return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
        }
    },
    Circ: {
        easeIn(t, b, c, d) {
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        },
        easeOut(t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
        },
        easeInOut(t, b, c, d) {
            // tslint:disable-next-line:no-conditional-assignment
            if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        }
    },
    Elastic: {
        easeIn(t, b, c, d, a, p) {
            // tslint:disable-next-line:no-conditional-assignment
            if (t === 0) return b; if ((t /= d) === 1) return b + c; if (!p) p = d * .3;
            let s;
            if (!a || a < Math.abs(c)) { a = c; s = p / 4; } else { s = p / (2 * Math.PI) * Math.asin(c / a); }
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        },
        easeOut(t, b, c, d, a, p) {
            // tslint:disable-next-line:no-conditional-assignment
            if (t === 0) return b; if ((t /= d) === 1) return b + c; if (!p) p = d * .3;
            let s;
            if (!a || a < Math.abs(c)) { a = c; s = p / 4; } else s = p / (2 * Math.PI) * Math.asin(c / a);
            return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
        },
        easeInOut(t, b, c, d, a, p) {
            // tslint:disable-next-line:no-conditional-assignment
            if (t === 0) return b; if ((t /= d / 2) === 2) return b + c; if (!p) p = d * (.3 * 1.5);
            let s;
            if (!a || a < Math.abs(c)) { a = c; s = p / 4; } else s = p / (2 * Math.PI) * Math.asin(c / a);
            if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
        }
    },
    Back: {
        easeIn(t, b, c, d, s) {
            if (s === undefined) s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        easeOut(t, b, c, d, s) {
            if (s === undefined) s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        easeInOut(t, b, c, d, s) {
            if (s === undefined) s = 1.70158;
            // tslint:disable-next-line:no-conditional-assignment
            if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        }
    },
    Bounce: {
        easeIn(t, b, c, d) {
            return c - Tween.Bounce.easeOut(d - t, 0, c, d) + b;
        },
        easeOut(t, b, c, d) {
            // tslint:disable-next-line:no-conditional-assignment
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b;
            } else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
            } else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
            } else {
                return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
            }
        },
        easeInOut(t, b, c, d) {
            if (t < d / 2) return Tween.Bounce.easeIn(t * 2, 0, c, d) * .5 + b;
            else return Tween.Bounce.easeOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
        }
    }
};
// 主worker 带有socket通信（原因：socket通信会传输数据，如果socket在子worker中处理，主worker和子worker之间还要再有一道数据传输对性能会有影响）
const worker: Worker = self as any;
worker.onmessage = (e: MessageEvent) => {
    const data = e.data;
    const method = data.method;
    if (!context.peer) context.peer = new RPCPeer("mainWorker", worker);
    switch (method) {
        case "init":
            Logger.getInstance().log("mainWorker onmessage: init");
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
            break;
        case "register":
            // worker注册表方法更新
            if (context.registed) return;
            context.registed = true;

            // const callBackParam = new webworker_rpc.Param();
            // callBackParam.t = webworker_rpc.ParamType.str;
            // const startParam = new webworker_rpc.Param();
            // startParam.t = webworker_rpc.ParamType.str;
            // const loadParam = new webworker_rpc.Param();
            // loadParam.t = webworker_rpc.ParamType.unit8array;
            // // 注册peer桥梁可被调用方法
            // context.peer.registerExecutor(context, new RPCExecutor("startBeat", "context", [startParam]));
            // context.peer.registerExecutor(context, new RPCExecutor("endHeartBeat", "context"));
            // context.peer.registerExecutor(context, new RPCExecutor("clearBeat", "context"));
            // context.peer.registerExecutor(context, new RPCExecutor("loadRes", "context", [loadParam]));
            // // 通知自己的子worker注册各自方法
            // const registerState: WorkerState = {
            //     "key": "register"
            // };
            // context.registerExecutor(registerState);
            break;
        case "connect":
            const addr: ServerAddress = data.address;
            if (addr) socket.startConnect(addr);
            break;
        case "send":
            const buf = data.buffer;
            socket.sendList(new Buffer(buf));
            break;
        case "startBeat":
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
    public startBeat(method: string) {
        // Logger.getInstance().log("mainwork");
        worker.postMessage({ "method": method });
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
        Logger.getInstance().log("workerload" + bytes);
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

class WorkerClient extends SocketConnection implements ILoop {
    protected mUuid: number = 0;
    private _loop: WorkerLoop;
    private _socketSendList: any[];
    private _pause: boolean = false;
    constructor($listener: IConnectListener) {
        super($listener);
        this._socketSendList = [];
        const loop: WorkerLoop = new WorkerLoop();
        loop.add("workerClient", this);
        loop.start();
    }
    sendList(data: any) {
        if (this._pause) return;
        const protobuf_packet: PBpacket = new PBpacket();
        protobuf_packet.Deserialization(new Buffer(data));
        protobuf_packet.header.uuid = this.mUuid || 0;
        this._socketSendList.push(protobuf_packet);
    }
    send(data: any): void {
        super.send(data);
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

    update() {
        if (!this._socketSendList || !this._socketSendList.length || this._pause) return;
        // Logger.getInstance().log("loop update");
        let len: number = this._socketSendList.length;
        let count: number = 0;
        while (count < 3) {
            const protobuf_packet = this._socketSendList[0];
            if (protobuf_packet) {
                const buffer = protobuf_packet.Serialization();
                this.send(buffer);
                Logger.getInstance().info(`MainWorker[发送] >>> ${protobuf_packet.toString()}`);
            }
            this._socketSendList.splice(0, 1);
            len = this._socketSendList.length;
            count++;
        }
    }
    set pause(value: boolean) {
        this._pause = value;
    }
}
// run socket client through web-worker
const socket: WorkerClient = new WorkerClient(new ConnListener());
const MAIN_WORKER = "mainWorker";
const HEARTBEAT_WORKER = "heartBeatWorker";
