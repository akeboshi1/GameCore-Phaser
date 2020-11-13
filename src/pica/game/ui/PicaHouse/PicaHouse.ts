import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def } from "pixelpai_proto";

export class PicaHouse extends BasicModel {
    constructor(game: Game) {
        super(game);
        this.register();
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

    destroy() {
        this.unregister();
        this.event.destroy();
    }
    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
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
        this.event.emit("roominfo", content);
    }
    private on_REFURBISH_REQUIREMENTS(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_ROOM_REFURBISH_REQUIREMENTS = packet.content;
        this.event.emit("refurbish", content);
    }
}
