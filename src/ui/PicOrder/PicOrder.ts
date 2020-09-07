import { WorldService } from "../../game/world.service";
import { ConnectionService } from "../../net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_pkt_def } from "pixelpai_proto";

export class PicOrder extends PacketHandler {
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
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ORDER_LIST, this.on_ORDER_LIST);
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

    public query_ORDER_LIST() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_QUERY_ORDER_LIST);
        this.connection.send(packet);
    }
    public query_CHANGE_ORDER_STAGE(index: number, state: op_pkt_def.PKT_Order_Operator) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_CHANGE_ORDER_STAGE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_CHANGE_ORDER_STAGE = packet.content;
        content.index = index;
        content.op = state;
        this.connection.send(packet);
    }
    private on_ORDER_LIST(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ORDER_LIST = packet.content;
        this.mEvent.emit("questlist", content);
    }
}
