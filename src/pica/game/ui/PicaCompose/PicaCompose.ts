import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";
export class PicaCompose extends BasicModel {
    constructor(game: Game) {
        super(game);
        this.register();
    }

    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CRAFT_QUERY_FORMULA, this.onRetFormulaDetial);
        }
    }

    unregister() {
        const connection = this.connection;
        if (connection) {
            this.connection.removePacketListener(this);
        }
    }

    destroy() {
        super.destroy();
        this.unregister();
        this.event.destroy();
    }

    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
        }
    }

    // public onReqFormulaDetail(id: string) {
    //     const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_CRAFT_QUERY_FORMULA);
    //     const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_CRAFT_QUERY_FORMULA = packet.content;
    //     content.id = id;
    //     this.connection.send(packet);
    // }
    public onReqUseFormula(id: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_CRAFT_ALCHEMY);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_CRAFT_ALCHEMY = packet.content;
        content.id = id;
        this.connection.send(packet);
    }
    private onRetFormulaDetial(packge: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CRAFT_QUERY_FORMULA = packge.content;
        this.event.emit("formulaDetial", content);
    }
}
