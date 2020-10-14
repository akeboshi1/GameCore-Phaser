import { WorldService } from "../../game/world.service";
import { ConnectionService } from "../../net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_pkt_def } from "pixelpai_proto";

export class PicOpenParty extends PacketHandler {
    private readonly world: WorldService;
    private mEvent: Phaser.Events.EventEmitter;
    constructor(world: WorldService) {
        super();
        this.world = world;
        this.mEvent = new Phaser.Events.EventEmitter();
    }
    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CREATE_PARTY_REQUIREMENTS, this.on_PARTY_REQUIREMENTS);
        }
    }

    unregister() {
        const connection = this.connection;
        if (connection) {
            this.connection.removePacketListener(this);
        }
    }

    on(event: string | symbol, fn: Function, context?: any) {
        this.mEvent.on(event, fn, context);
    }

    off(event: string | symbol, fn: Function, context?: any) {
        this.mEvent.off(event, fn, context);
    }

    destroy() {
        this.unregister();
        this.mEvent.destroy();
    }

    get connection(): ConnectionService {
        if (this.world) {
            return this.world.connection;
        }
    }

    public query_PARTY_REQUIREMENTS(id: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_CREATE_PARTY_REQUIREMENTS);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_CREATE_PARTY_REQUIREMENTS = packet.content;
        content.id = id;
        this.connection.send(packet);
    }
    public query_CREATE_PARTY(id: string, topic: string, name: string, des: string, ticket: number) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_CREATE_PARTY);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_CREATE_PARTY = packet.content;
        content.id = id;
        content.topic = topic;
        content.name = name;
        content.des = des;
        content.ticketCount = ticket;
        this.connection.send(packet);
    }

    private on_PARTY_REQUIREMENTS(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CREATE_PARTY_REQUIREMENTS = packet.content;
        this.mEvent.emit("themelist", content);
    }
}
