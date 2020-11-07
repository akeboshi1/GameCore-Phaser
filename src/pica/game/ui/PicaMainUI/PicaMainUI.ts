import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { EventType } from "structure";

export class PicaMainUI extends BasicModel {
    constructor(game: Game) {
        super(game);
        this.register();
    }

    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
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

    private onUpdateModeRoomInfo(packet: PBpacket) {
        this.game.peer.workerEmitter(EventType.UPDATE_ROOM_INFO, packet.content);
        this.game.peer.workerEmitter(EventType.UPDATE_PARTY_STATE, packet.content.openingParty);
    }

    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
        }
    }
}
