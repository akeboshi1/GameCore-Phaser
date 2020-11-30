import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def } from "pixelpai_proto";
import { Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
export class PicaFurniFun extends PacketHandler {

    constructor(private game: Game) {
        super();
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

    queryUnlockElement(ids: number[]) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_UNLOCK_ELEMENT);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_UNLOCK_ELEMENT = packet.content;
        content.ids = ids;
        this.connection.send(packet);
    }

    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
        }
    }

}
