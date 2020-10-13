import { WorldService } from "../../game/world.service";
import { ConnectionService } from "../../../../lib/net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def } from "pixelpai_proto";

export class PicHouse extends PacketHandler {
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
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO, this.onRetRoomInfoHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_ROOM_REFURBISH_REQUIREMENTS, this.on_REFURBISH_REQUIREMENTS);
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
    sendEnterDecorate() {
        if (this.connection) {
            this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ENTER));
        }
    }

    queryRoomInfo(roomid) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_GET_ROOM_INFO);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_GET_ROOM_INFO = packet.content;
        content.roomId = roomid;
        this.connection.send(packet);
    }
    query_REFURBISH_REQUIREMENTS(roomid) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_QUERY_ROOM_REFURBISH_REQUIREMENTS);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_QUERY_ROOM_REFURBISH_REQUIREMENTS = packet.content;
        content.id = roomid;
        this.connection.send(packet);
    }
    query_ROOM_REFURBISH(roomid) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_ROOM_REFURBISH);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_ROOM_REFURBISH = packet.content;
        content.id = roomid;
        this.connection.send(packet);
    }
    private onRetRoomInfoHandler(packet: PBpacket) {
        const content = packet.content;
        this.mEvent.emit("roominfo", content);
    }
    private on_REFURBISH_REQUIREMENTS(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_ROOM_REFURBISH_REQUIREMENTS = packet.content;
        this.mEvent.emit("refurbish", content);
    }
}
