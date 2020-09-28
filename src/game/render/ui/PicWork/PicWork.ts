import { WorldService } from "../../game/world.service";
import { ConnectionService } from "../../net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_pkt_def } from "pixelpai_proto";

export class PicWork extends PacketHandler {
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
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_JOB_LIST, this.on_JOB_LIST);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_PLAYER_INFO, this.onUpdatePlayerInfo);
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

    public query_JOB_LIST() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_JOB_LIST);
        this.connection.send(packet);
    }
    public query_WORK_ON_JOB(id: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_WORK_ON_JOB);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_WORK_ON_JOB = packet.content;
        content.id = id;
        this.connection.send(packet);
    }
    private on_JOB_LIST(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_JOB_LIST = packet.content;
        this.mEvent.emit("questlist", content);
    }
    private onUpdatePlayerInfo(packet: PBpacket) {
        this.mEvent.emit("updateplayer", packet.content);
    }
}
