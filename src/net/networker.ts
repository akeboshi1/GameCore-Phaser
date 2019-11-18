import {IConnectListener, SocketConnection, SocketConnectionError} from "./socket";
import {ServerAddress} from "./address";
import {Buffer, PBpacket} from "net-socket-packet";
import {Logger} from "../utils/log";
import * as protos from "pixelpai_proto";

for (const key in protos) {
    PBpacket.addProtocol(protos[key]);
}
const ctx: Worker = self as any;

class ConnListener implements IConnectListener {
    onConnected(connection: SocketConnection): void {
        ctx.postMessage({
            method: "onConnected",
        });
        Logger.getInstance().info(`NetWorker[已连接]`);
    }

    onDisConnected(connection: SocketConnection): void {
        ctx.postMessage({
            method: "onDisConnected",
        });
        Logger.getInstance().info(`NetWorker[已断开]`);
    }

    onError(reason: SocketConnectionError | undefined): void {
        if (reason) {
            ctx.postMessage({
                method: "onConnectError",
                error: reason.message,
            });
            Logger.getInstance().error(`NetWorker[错误]:${reason.message}`);
        } else {
            Logger.getInstance().error(`NetWorker[错误]:${reason}`);
        }
    }
}

class WorkerClient extends SocketConnection {
    protected mUuid: number = 0;

    public send(data: any): void {
        const protobuf_packet: PBpacket = new PBpacket();
        protobuf_packet.Deserialization(new Buffer(data));
        protobuf_packet.header.uuid = this.mUuid || 0;
        super.send(protobuf_packet.Serialization());
        Logger.getInstance().info(`NetWorker[发送] >>> ${protobuf_packet.toString()}`);
    }

    protected onData(data: any) {
        const protobuf_packet: PBpacket = new PBpacket();
        protobuf_packet.Deserialization(new Buffer(data));
        this.mUuid = protobuf_packet.header.uuid;
        Logger.getInstance().info(`NetWorker[接收] <<< ${protobuf_packet.toString()} `);
        // Send the packet to parent thread
        ctx.postMessage({
            method: "onData",
            buffer: protobuf_packet.Serialization(),
        });
    }
}

// run socket client through web-worker
const socket: SocketConnection = new WorkerClient(new ConnListener());
ctx.onmessage = (ev) => {
    const data: any = ev.data;

    switch (data.method) {
        case "connect":
            const addr: ServerAddress = data.address;
            if (addr) socket.startConnect(addr);
            break;
        case "send":
            const buf = data.buffer;
            socket.send(new Buffer(buf));
            break;
    }
};
