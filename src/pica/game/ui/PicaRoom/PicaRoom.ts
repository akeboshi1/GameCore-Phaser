import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def } from "pixelpai_proto";
import { ModuleName } from "structure";

export class PicaRoom extends BasicModel {
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
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CREATE_PARTY_REQUIREMENTS, this.on_PARTY_REQUIREMENTS);
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
    query_PARTY_REQUIREMENTS(id: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_CREATE_PARTY_REQUIREMENTS);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_CREATE_PARTY_REQUIREMENTS = packet.content;
        content.id = id;
        this.connection.send(packet);
    }
    query_CREATE_PARTY(id: string, topic: string, name: string, des: string, ticket: number) {
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
        this.game.emitter.emit(ModuleName.PICAROOM_NAME + "_themelist", content);
    }
    private onRetRoomInfoHandler(packet: PBpacket) {
        const content = packet.content;
        this.game.emitter.emit(ModuleName.PICAROOM_NAME + "_roominfo", content);
    }
    private on_REFURBISH_REQUIREMENTS(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_ROOM_REFURBISH_REQUIREMENTS = packet.content;
        this.game.emitter.emit(ModuleName.PICAROOM_NAME + "_refurbish", content);
    }
}
