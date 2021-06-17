import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";

export class PicaRecharge extends BasicModel {
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
        this.event.destroy();
    }

    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
        }
    }

    public query_JOB_LIST() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_JOB_LIST);
        this.connection.send(packet);
    }
}
