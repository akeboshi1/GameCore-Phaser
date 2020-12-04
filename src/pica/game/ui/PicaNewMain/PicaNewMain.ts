import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { EventType } from "structure";

export class PicaNewMain extends BasicModel {
    constructor(game: Game) {
        super(game);
        this.register();
    }

    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
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
    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
        }
    }
}
