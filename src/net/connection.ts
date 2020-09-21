import { ConnectionService } from "./connection.service";
import { ServerAddress } from "./address";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { IConnectListener } from "./socket";
import { Buffer } from "buffer/";
import { Logger } from "../utils/log";
// import {op_client, op_gameconfig, op_gameconfig_01, op_gateway, op_virtual_world} from "pixelpai_proto";
// PBpacket.addProtocol(op_client);
// PBpacket.addProtocol(op_gateway);
// PBpacket.addProtocol(op_gameconfig);
// PBpacket.addProtocol(op_virtual_world);
// PBpacket.addProtocol(op_gameconfig_01);
// import NetWorker from "worker-loader?name=js/[hash].[name].js!./networker";
import MainWorker from "worker-loader?filename=js/[hash].[name].js!../rpcworker/mainWorker";
import * as protos from "pixelpai_proto";
import { load } from "../utils/http";
import { Lite } from "game-capsule";

for (const key in protos) {
    PBpacket.addProtocol(protos[key]);
}
// 网络连接器
// 使用webworker启动socket，无webworker时直接启动socket
export default class Connection implements ConnectionService {
    protected mPacketHandlers: PacketHandler[] = [];
    private mListener: IConnectListener;
    private mMainWorker: MainWorker;
    // private mWorker: NetWorker;
    // private mHeartBeatWorker: HeartBeatWorker;
    private mReConnectCount: number = 0;
    private mCachedServerAddress: ServerAddress | undefined;
    private mTimeout: any;
    private _isConnect: boolean = false;
    constructor(listener: IConnectListener) {
        this.mListener = listener;
    }
    isConnect(): boolean {
        return this._isConnect;
    }
    startConnect(addr: ServerAddress, keepalive?: boolean): void {
        this.mCachedServerAddress = addr;
        try {
            this.mMainWorker = new MainWorker();
            this.mMainWorker.postMessage({ method: "init" });
            this._doConnect();
        } catch (e) {
            throw new Error(`startConnect Error: ${e}`);
        }
    }

    closeConnect(): void {
        this._isConnect = false;
        if (this.mMainWorker) {
            Logger.getInstance().log("close connect");
            this.mMainWorker.postMessage({ method: "close" });
            this.mMainWorker.terminate();
            this.mMainWorker = null;
        }
        // this.mWorker.terminate();
        // this.mHeartBeatWorker.terminate();
        this.mCachedServerAddress = undefined;
        this.mReConnectCount = 0;
        this.mTimeout = null;
        this.clearPacketListeners();
    }

    clearHeartBeat() {
        if (this.mMainWorker) {
            this.mMainWorker.postMessage({ method: "clearBeat" });
        }
    }

    addPacketListener(listener: PacketHandler) {
        this.mPacketHandlers.push(listener);
    }

    send(packet: PBpacket) {
        if (!this.mMainWorker) {
            throw new Error(`NetWorker is undefined.`);
        }

        this.mMainWorker.postMessage({
            "method": "send",
            "buffer": packet.Serialization(),
        });
    }

    clearReconnectCount() {
        this.mMainWorker.postMessage("clearBeat");
    }

    removePacketListener(listener: PacketHandler) {
        const idx: number = this.mPacketHandlers.indexOf(listener);
        if (idx !== -1) {
            this.mPacketHandlers.splice(idx, 1);
        }
    }

    clearPacketListeners() {
        if (!this.mPacketHandlers || this.mPacketHandlers.length < 1) {
            return;
        }
        const len: number = this.mPacketHandlers.length;
        for (let i: number = 0; i < len; i++) {
            const listener: PacketHandler = this.mPacketHandlers[i];
            if (!listener) continue;
            this.removePacketListener(listener);
            i--;
        }
    }

    onFocus() {
        if (this.mMainWorker) this.mMainWorker.postMessage({ "method": "focus" });
    }

    onBlur() {
        if (this.mMainWorker) this.mMainWorker.postMessage({ "method": "blur" });
    }
    loadRes(path: string) {
        if (this.mMainWorker) this.mMainWorker.postMessage({ "method": "loadRes", "url": path });
    }
    move(point: Phaser.Geom.Point, data: any) {
        if (this.mMainWorker) this.mMainWorker.postMessage({ "method": "move", "data": data });
    }

    private _doConnect() {
        // Logger.getInstance().info(`_doConnect `, this.mCachedServerAddress);
        const self = this;
        if (this.mMainWorker) {
            this.mMainWorker.onmessage = (event: any) => {
                self.onWorkerMessage(event.data);
            };
            this.mMainWorker.postMessage({
                "method": "connect",
                "address": self.mCachedServerAddress,
            });
        }
    }

    private onWorkerMessage(data: any) {
        const self = this;
        const method = data.method;
        switch (method) {
            case "canStartBeat":
                Logger.getInstance().log("canStartBeat");
                if (this.mMainWorker) {
                    this.mMainWorker.postMessage({ method: "startBeat" });
                }
                break;
            case "onConnected":
                this.mReConnectCount = 0;
                this.mListener.onConnected();
                this._isConnect = true;
                break;
            case "onDisConnected":
                this._isConnect = false;
                if (this.mReConnectCount > 3) {
                    this.closeConnect();
                    this.mListener.onDisConnected();
                    return;
                }
                this.reConnect();
                // if (!this.mTimeout) {
                //     if (this.mReConnectCount < 10)
                //         this.mReConnectCount++;
                //     const delay = this.mReConnectCount ** 2;
                //     Logger.getInstance().info(`ReConnect: delay = ${delay * 1000}[c/${this.mReConnectCount}]`);
                //     this.mTimeout = setTimeout(() => {
                //         self.mTimeout = undefined;
                //         self._doConnect();
                //     }, delay * 1000);
                // }
                break;
            case "onConnectError":
                this._isConnect = false;
                this.mListener.onError();
                Logger.getInstance().error("error" + data.error);
                break;
            case "heartBeat":
                this.worldStartHeartBeat();
                break;
            case "endBeat":
                this.endHeartBeat();
                break;
            case "reConnect":
                if (this.mReConnectCount > 3) {
                    this.closeConnect();
                    this.mListener.onDisConnected();
                    return;
                }
                this.mReConnectCount++;
                this.reConnect();
                break;
            // case "onData":
            //     const buf = data.buffer;
            //     if (buf) {
            //         this._onData(buf);
            //     }
            //     break;
            default:
                if (data instanceof ArrayBuffer) {
                    this._onData(data);
                } else if (data instanceof Blob) {
                    this._onBlob(data);
                }
                break;
        }
    }

    private _onBlob(data: Blob) {
        const self = this;
        const p = new Promise(function(resolve, reject) {
            const reader = new FileReader();
            reader.readAsDataURL(data);
            reader.onload = function(e) {
                const type = data.type;
                switch (type) {
                    case "image/png":
                        break;
                    case "application/json":
                        const arrayBuffer = new Response(data).arrayBuffer().then((response) => {
                            const gameConfig = new Lite();
                            gameConfig.deserialize(new Uint8Array(response));
                            (<any>self.mListener).elementStorage.setGameConfig(gameConfig);
                        });
                        break;
                }
                // const resList = String(e.target.result).split(",");
                // resolve(resList[1]);
            };

        });
    }

    private _onData(data: ArrayBuffer) {
        const protobufPacket: PBpacket = new PBpacket();
        protobufPacket.Deserialization(new Buffer(data));
        const handlers = this.mPacketHandlers;
        handlers.forEach((handler: PacketHandler) => {
            handler.onPacketArrived(protobufPacket);
        });
    }

    private reConnect() {
        Logger.getInstance().log("reConnect");
        const world: any = this.mPacketHandlers[0];
        world.reconnect();
    }

    private worldStartHeartBeat() {
        const world: any = this.mPacketHandlers[0];
        world.startHeartBeat();
    }

    private endHeartBeat() {
        if (this.mMainWorker) {
            this.mMainWorker.postMessage({ method: "endHeartBeat" });
        }
    }
}
