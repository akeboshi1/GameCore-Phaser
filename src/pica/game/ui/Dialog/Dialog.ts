import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PBpacket } from "net-socket-packet";
import { op_virtual_world } from "pixelpai_proto";
export class Dialog extends BasicModel {
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
