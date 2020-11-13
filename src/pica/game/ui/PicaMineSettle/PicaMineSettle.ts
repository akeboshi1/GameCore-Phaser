import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_def, op_client, op_virtual_world } from "pixelpai_proto";
import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";

export class PicaMineSettle extends BasicModel {
    constructor(game: Game) {
        super(game);
        this.register();
    }
    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_MINING_MODE_SHOW_REWARD_PACKAGE, this.onMineSettlePackageHandler);
        }
    }

    unregister() {
        const connection = this.connection;
        if (connection) {
            this.connection.removePacketListener(this);
        }
    }

    reqMineSettlePacket() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MINING_MODE_STORAGE_REWARD);
        this.connection.send(packet);
    }

    destroy() {
        this.unregister();
    }

    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
        }
    }

    private onMineSettlePackageHandler(packge: PBpacket) {
        const content = packge.content;
        this.game.emitter.emit("minesettlepacket", content);
    }
}
