import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";

export class PicaManorList extends BasicModel {
    constructor(game: Game) {
        super(game);
        this.register();
    }
    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_STREET_LIST, this.onCOMMERCIAL_STREET);
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

    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
        }
    }

    public query_COMMERCIAL_STREET(page: number, per_page: number) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_STREET_LIST);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_STREET_LIST = packet.content;
        content.page = page;
        content.perPage = per_page;
        this.connection.send(packet);
    }
    public queryEnterRoom(roomID: string, password?: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ENTER_ROOM);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ENTER_ROOM = packet.content;
        content.roomId = roomID;
        content.password = password;
        this.connection.send(packet);
    }
    private onCOMMERCIAL_STREET(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_STREET_LIST = packet.content;
        this.game.emitter.emit("streetlist", content);
    }
}
