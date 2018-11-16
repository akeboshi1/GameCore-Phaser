import {PacketHandler, PBpacket} from "net-socket-packet";
import {Buffer} from "buffer/";
import {SocketConnection} from "../net/SocketConnection";


export class ClientConnection extends SocketConnection {
    private static _instance: ClientConnection = new ClientConnection();
    protected _packetHandlers: PacketHandler[] = [];

    constructor() {
        super();
        if (ClientConnection._instance)
            throw new Error(`Error: Instantiation failed: Use ${this.constructor.name}.getInstance() instead of new.`);
        ClientConnection._instance = this;
    }

    public static getInstance(): ClientConnection {
        return ClientConnection._instance;
    }

    public addPacketListener(handler: PacketHandler) {
        this._packetHandlers.push(handler);
    }

    public rmPacketListener(handler: PacketHandler) {
        let idx: number = this._packetHandlers.indexOf(handler);
        if (idx !== -1) {
            this._packetHandlers.splice(idx, 1);
        }
    }

    // overwrite
    protected onData(data: any) {
        let protobuf_packet: PBpacket = new PBpacket();
        protobuf_packet.Deserialization(new Buffer(data));
        this._packetHandlers.forEach((handler: PacketHandler) => {
            handler.onPacketArrived(protobuf_packet);
        });
    }

    send(packet: PBpacket) {
        // hack
        super.send(packet.Serialization());
    }

    destroy(): void {
        super.destroy();
    }


}