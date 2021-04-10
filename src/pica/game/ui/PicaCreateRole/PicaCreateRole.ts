import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def } from "pixelpai_proto";
export class PicaCreateRole extends BasicModel {
    constructor(game: Game) {
        super(game);
    }

    register() {
        const connection = this.connection;
        if (connection) {
            connection.addPacketListener(this);
        }
    }

    unregister() {
        const connection = this.connection;
        if (connection) {
            this.connection.removePacketListener(this);
        }
    }
    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
        }
    }
    public onSubmitHandler(gender: op_def.Gender, ids: string[]) {
        const connection = this.connection;
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_CREATE_ROLE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_CREATE_ROLE = packet.content;
        content.gender = gender;
        content.avatarIds = ids;
        connection.send(packet);
    }
}
