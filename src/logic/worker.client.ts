import { SocketConnection, IConnectListener, SocketConnectionError } from "../../lib/net/socket";
import { PBpacket, Buffer } from "net-socket-packet";
import { Logger } from "../utils/log";

export class WorkerClient extends SocketConnection {
    protected mUuid: number = 0;
    private _pause: boolean = false;
    constructor($listener: IConnectListener) {
        super($listener);
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
        mainPeer.onData(buffer);
    }

    set pause(value: boolean) {
        this._pause = value;
    }
}

export class ConnListener implements IConnectListener {
    onConnected(): void {
        mainPeer.onConnected();
        Logger.getInstance().info(`MainWorker[已连接]`);
    }

    onDisConnected(): void {
        mainPeer.onDisConnected();
        Logger.getInstance().info(`MainWorker[已断开]`);
    }

    // reason: SocketConnectionError | undefined
    onError(reason: SocketConnectionError | undefined): void {
        if (reason) {
            mainPeer.onConnectError(reason.message);
            Logger.getInstance().error(`MainWorker[错误]:${reason.message}`);
        } else {
            Logger.getInstance().error(`MainWorker[错误]:${reason}`);
        }
    }
}
