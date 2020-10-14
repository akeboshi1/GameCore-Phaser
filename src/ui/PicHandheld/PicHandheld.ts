import { WorldService } from "../../game/world.service";
import { ConnectionService } from "../../net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def } from "pixelpai_proto";

export class PicHandheld extends PacketHandler {
    private readonly world: WorldService;
    private mEvent: Phaser.Events.EventEmitter;
    constructor($world: WorldService) {
        super();
        this.world = $world;
        this.mEvent = new Phaser.Events.EventEmitter();
    }
    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_HANDHELD, this.onRetHandheldList);
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

    queryChangeHandheld(id: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_PICK_HANDHELD);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_PICK_HANDHELD = packet.content;
        content.id = id;
        this.connection.send(packet);
    }

    queryClearHandheld() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_DROP_HANDHELD);
        this.connection.send(packet);
    }

    queryHandheldList() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_HANDHELD);
        this.connection.send(packet);
    }

    private onRetHandheldList(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_HANDHELD = packet.content;
        this.mEvent.emit("handheldlist", content);
    }

}
