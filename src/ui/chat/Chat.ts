import { PacketHandler, PBpacket } from "net-socket-packet";
import { WorldService } from "../../game/world.service";
import { op_client } from "pixelpai_proto";
import { ConnectionService } from "../../net/connection.service";

export class Chat extends PacketHandler {
    private world: WorldService;
    private mEvent: Phaser.Events.EventEmitter;
    constructor(world: WorldService) {
        super();
        this.world = world;
        this.mEvent = new Phaser.Events.EventEmitter();
    }

    on(event: string | symbol, fn: Function, context?: any) {
        this.mEvent.on(event, fn, context);
    }

    off(event: string | symbol, fn: Function, context?: any) {
        this.mEvent.off(event, fn, context);
    }

    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CHAT, this.handleCharacterChat);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_QCLOUD_GME_AUTHBUFFER, this.handleQCLoudGME);
        }
    }

    unregister() {
        const connection = this.connection;
        if (connection) {
            this.connection.removePacketListener(this);
        }
    }

    get connection(): ConnectionService {
        if (this.world) {
            return this.world.connection;
        }
    }

    private handleCharacterChat(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_CHAT = packet.content;
        this.mEvent.emit("characterChat", packet);
    }

    private handleQCLoudGME(packet: PBpacket) {
        const authBuffer: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_QCLOUD_GME_AUTHBUFFER = packet.content;
        this.mEvent.emit("QCLoundGME", packet);
    }

}
