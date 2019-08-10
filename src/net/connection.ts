import {ConnectionService} from "./connection.service";
import {ServerAddress} from "./address";
import {PacketHandler, PBpacket} from "net-socket-packet";
import {IConnectListener} from "./socket";
import {Buffer} from "buffer/";

const NetWorker = require("worker-loader?publicPath=/dist/&name=[hash].[name].js!./networker.ts");

// 网络连接器
// 使用webworker启动socket，无webworker时直接启动socket
export default class Connection implements ConnectionService {
    private mListener: IConnectListener;
    private mWorker: any;
    protected mPacketHandlers: PacketHandler[] = [];

    constructor(listener: IConnectListener) {
        this.mListener = listener;
    }

    startConnect(addr: ServerAddress, keepalive?: boolean): void {
        const self = this;
        try {
            this.mWorker = new NetWorker();
            this.mWorker.onmessage = event => {
                self.onWorkerMessage(event.data);
            };
            this.mWorker.postMessage({
                "method": "connect",
                "address": {
                    host: "115.182.75.79",
                    port: 12100
                }
            })
        } catch (e) {
            // TODO throw error message
        }
    }

    private onWorkerMessage(data) {
        console.dir(data);
        const method = data.method;
        switch (method) {
            case "onConnected":
                this.mListener.onConnected();
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
        console.log(`_onData`);
        let protobuf_packet: PBpacket = new PBpacket();
        protobuf_packet.Deserialization(new Buffer(data));
        let handlers = this.mPacketHandlers;
        handlers.forEach((handler: PacketHandler) => {
            handler.onPacketArrived(protobuf_packet);
        });
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
            "buffer": packet.Serialization()
        });
    }

    removePacketListener(listener: PacketHandler) {
        let idx: number = this.mPacketHandlers.indexOf(listener);
        if (idx !== -1) {
            this.mPacketHandlers.splice(idx, 1);
        }
    }
}
