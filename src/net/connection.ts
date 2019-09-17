import {ConnectionService} from "./connection.service";
import {ServerAddress} from "./address";
import {PacketHandler, PBpacket} from "net-socket-packet";
import {IConnectListener} from "./socket";
import {Buffer} from "buffer/";
import {op_client, op_gameconfig, op_gameconfig_01, op_gateway, op_virtual_world} from "pixelpai_proto";
import {Logger} from "../utils/log";
PBpacket.addProtocol(op_client);
PBpacket.addProtocol(op_gateway);
PBpacket.addProtocol(op_gameconfig);
PBpacket.addProtocol(op_virtual_world);
PBpacket.addProtocol(op_gameconfig_01);
const NetWorker = require("worker-loader?publicPath=./&name=js/[hash].[name].js!./networker.ts");
// 网络连接器
// 使用webworker启动socket，无webworker时直接启动socket
export default class Connection implements ConnectionService {
    protected mPacketHandlers: PacketHandler[] = [];
    private mListener: IConnectListener;
    private mWorker: any;
    private mReConnectCount: number = 0;
    private mCachedServerAddress: ServerAddress | undefined;
    private mTimeout: any;

    constructor(listener: IConnectListener) {
        this.mListener = listener;
    }

    startConnect(addr: ServerAddress, keepalive?: boolean): void {
        this.mCachedServerAddress = addr;
        try {
            this.mWorker = new NetWorker();
            this._doConnect();
        } catch (e) {
            throw new Error(`startConnect Error: ${e}`);
        }
    }

    closeConnect(): void {
    }

    addPacketListener(listener: PacketHandler) {
        this.mPacketHandlers.push(listener);
    }

    send(packet: PBpacket) {
        if (!this.mWorker) {
            throw new Error(`NetWorker is undefined.`);
        }

        this.mWorker.postMessage({
            "method": "send",
            "buffer": packet.Serialization(),
        });
    }

    removePacketListener(listener: PacketHandler) {
        const idx: number = this.mPacketHandlers.indexOf(listener);
        if (idx !== -1) {
            this.mPacketHandlers.splice(idx, 1);
        }
    }

    private _doConnect() {
        Logger.info(`_doConnect `, this.mCachedServerAddress);
        const self = this;
        if (this.mWorker) {
            this.mWorker.onmessage = (event: any) => {
                self.onWorkerMessage(event.data);
            };
            this.mWorker.postMessage({
                "method": "connect",
                "address": self.mCachedServerAddress,
            });
        }
    }

    private onWorkerMessage(data: any) {
        const self = this;
        const method = data.method;
        switch (method) {
            case "onConnected":
                this.mReConnectCount = 0;
                this.mListener.onConnected();
                break;
            case "onDisConnected":

                if (!this.mTimeout) {
                    if (this.mReConnectCount < 10)
                        this.mReConnectCount++;
                    const delay = this.mReConnectCount ** 2;
                    Logger.info(`ReConnect: delay = ${delay * 1000}[c/${this.mReConnectCount}]`);

                    this.mTimeout = setTimeout(() => {
                        self.mTimeout = undefined;
                        self._doConnect();
                    }, delay * 1000);
                }
                break;
            case "onConnectError":
                // TODO
                break;
            case "onData":
                const buf = data.buffer;
                if (buf) {
                    this._onData(buf);
                }
                break;
            default:
                break;
        }
    }

    private _onData(data: any) {
        const protobufPacket: PBpacket = new PBpacket();
        protobufPacket.Deserialization(new Buffer(data));
        const handlers = this.mPacketHandlers;
        handlers.forEach((handler: PacketHandler) => {
            handler.onPacketArrived(protobufPacket);
        });
    }
}
