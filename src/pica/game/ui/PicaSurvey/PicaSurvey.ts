import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PBpacket } from "net-socket-packet";
import { op_client } from "pixelpai_proto";
import { ModuleName } from "structure";

export class PicaSurvey extends BasicModel {
    constructor(game: Game) {
        super(game);
        this.register();
    }

    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_INVESTIGATE_SUCCESS, this.onSurveySuccessHandler);
        }
    }

    unregister() {
        const connection = this.connection;
        if (connection) {
            this.connection.removePacketListener(this);
        }
    }

    private onSurveySuccessHandler(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_INVESTIGATE_SUCCESS = packet.content;
        this.game.emitter.emit(ModuleName.PICASURVEY_NAME + "_surveysuccess", content.id);
    }

    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
        }
    }
}
