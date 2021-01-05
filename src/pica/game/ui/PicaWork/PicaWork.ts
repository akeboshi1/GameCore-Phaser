import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { ModuleName } from "structure";

export class PicaWork extends BasicModel {
    constructor(game: Game) {
        super(game);
        this.register();
    }

    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_JOB_LIST, this.on_JOB_LIST);
            // this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_PLAYER_INFO, this.onUpdatePlayerInfo);
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

    public query_JOB_LIST() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_JOB_LIST);
        this.connection.send(packet);
    }
    public query_WORK_ON_JOB(id: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_WORK_ON_JOB);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_WORK_ON_JOB = packet.content;
        content.id = id;
        this.connection.send(packet);
    }
    private on_JOB_LIST(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_JOB_LIST = packet.content;
        this.event.emit(ModuleName.PICAWORK_NAME + "_retquestlist", content);
    }
}
