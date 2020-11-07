import { ConnectionService } from "lib/net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_virtual_world } from "pixelpai_proto";
import { Game } from "src/game/game";

export class Dialog extends PacketHandler {
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

    public queryNextDialog(uiid: number, comid: number, data: number[]) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = packet.content;
        content.uiId = uiid;
        content.componentId = comid;
        content.data = data;
        this.connection.send(packet);
    }

    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
        }
    }
}
