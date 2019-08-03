import {ServerAddress} from "./address";
import {PacketHandler, PBpacket} from "net-socket-packet";
import {WSWrapper} from "./transport/websocket";
import {Buffer} from "buffer/";

export interface IConnectListener {
    onConnected(connection: SocketConnection): void;

    onDisConnected(connection: SocketConnection): void;

    onError(reason: SocketConnectionError | undefined): void;
}

export class SocketConnectionError extends Error {
    name = "SocketConnectionError";

    constructor(reason: any) {
        super(`SocketConnectionError: ${JSON.stringify(reason)}`);
        this.stack = new Error().stack;
    }
}

export class SocketConnection {
    protected mTransport: WSWrapper;
    protected mServerAddr: ServerAddress = {host: "localhost", port: 80};
    protected mConnectListener?: IConnectListener;

    constructor(listener: IConnectListener) {
        this.mTransport = new WSWrapper();
        this.mConnectListener = listener;

        // add connection event to listener
        if (typeof this.mTransport !== "undefined" && typeof this.mConnectListener !== "undefined") {
            let listener: IConnectListener = this.mConnectListener;
            this.mTransport.on("open", () => {
                console.info(`SocketConnection ready.`);
                listener.onConnected(this);
                this.onConnected();
            });
            this.mTransport.on("close", () => {
                console.info(`SocketConnection close.`);
                listener.onDisConnected(this);
            });
            this.mTransport.on("error", reason => {
                console.info(`SocketConnection error.`);
                listener.onError(reason);
            });
        }
    }

    protected onConnected() {
        if (typeof this.mTransport !== "undefined") {
            this.mTransport.on("packet", this.onData);
        }
    }

    protected onData(data: any) {
    }

    startConnect(addr: ServerAddress): void {
        this.mServerAddr = addr;
        this.doConnect();
    }

    stopConnect(): void {
        if (typeof this.mTransport !== "undefined") {
            this.mTransport.Close();
        }
    }

    private doConnect() {
        if (typeof this.mTransport !== "undefined") {
            this.mTransport.Open(this.mServerAddr.host, this.mServerAddr.port);
        }
    }

    send(data: any): void {
        if (typeof this.mTransport !== "undefined") {
            this.mTransport.Send(data);
        }
    }

    //Frees all resources for garbage collection.
    destroy(): void {
        if (typeof this.mTransport !== "undefined") {
            this.mTransport.destroy();
        }
    }
}


export class SocketClient extends SocketConnection {
    protected mUuid: number = 0;
    protected mPacketHandlers: PacketHandler[] = [];

    protected onData(data: any) {
        super.onData(data);

        let protobuf_packet: PBpacket = new PBpacket();
        this.mUuid = protobuf_packet.header.uuid;
        protobuf_packet.Deserialization(new Buffer(data));
        console.log(`[接收] <<< ${protobuf_packet.toString()} `);
        this.mPacketHandlers.forEach((handler: PacketHandler) => {
            handler.onPacketArrived(protobuf_packet);
        });
    }

    addPacketListener(handler: PacketHandler) {
        this.mPacketHandlers.push(handler);
    }

    removePacketListener(handler: PacketHandler) {
        let idx: number = this.mPacketHandlers.indexOf(handler);
        if (idx !== -1) {
            this.mPacketHandlers.splice(idx, 1);
        }
    }

    send(packet: PBpacket): void {
        packet.header.uuid = this.mUuid || 0;
        super.send(packet.Serialization());
        console.log(`[发送] >>> ${packet.toString()}`);
    }

    destroy(): void {
        super.destroy();
        this.mPacketHandlers = [];
    }
}
