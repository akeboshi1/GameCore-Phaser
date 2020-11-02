import { ConnectionService } from "lib/net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { Game } from "src/game/game";
import { EventType } from "structure";

export class PicaMainUI extends PacketHandler {
    constructor(private game: Game) {
        super();
        this.register();
    }

    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_PLAYER_INFO, this.onUpdatePlayerInfo);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO, this.onUpdateModeRoomInfo);
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
    }

    query_PRAISE_ROOM(roomid: string, praise: boolean) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_PRAISE_ROOM);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_PRAISE_ROOM = packet.content;
        content.roomId = roomid;
        content.praise = praise;
        this.connection.send(packet);
    }

    fetchPlayerInfo() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_SELF_PLAYER_INFO);
        this.connection.send(packet);
    }

    private onUpdatePlayerInfo(packet: PBpacket) {
        this.game.peer.workerEmitter(EventType.UPDATE_PLAYER_INFO, packet.content);
    }

    private onUpdateModeRoomInfo(packet: PBpacket) {
        this.game.peer.workerEmitter(EventType.UPDATE_ROOM_INFO, packet.content);
    }

    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
        }
    }
}
