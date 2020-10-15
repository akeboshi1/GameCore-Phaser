import { PacketHandler } from "net-socket-packet";
import { op_client } from "pixelpai_proto";
import { Game } from "../game";

export class UIManager extends PacketHandler {

    constructor(private game: Game) {
        super();
    }

    public addPackListener() {
        const connection = this.game.connection;
        if (!connection) {
            return;
        }
        connection.addPacketListener(this);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI, this.handleShowUI);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI, this.handleUpdateUI);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CLOSE_UI, this.handleCloseUI);
    }

    public removePackListener() {
        const connection = this.game.connection;
        if (!connection) {
            return;
        }
        connection.removePacketListener(this);
    }

    private handleCloseUI() {
    }

    private handleUpdateUI() {
    }

    private handleShowUI() {
    }
}
