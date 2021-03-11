import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { ModuleName } from "structure";

export class PicaNewRole extends BasicModel {
    constructor(game: Game) {
        super(game);
        this.register();
    }

    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO, this.onOtherCharacterInfo);
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
    }

    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
        }
    }

    public fetchAnotherInfo(id: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_ANOTHER_PLAYER_INFO);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_ANOTHER_PLAYER_INFO = packet.content;
        content.platformId = id;
        this.connection.send(packet);
    }

    queryAction(uiid: number, cid: string, action: number) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = packet.content;
        content.uiId = uiid;
        content.componentId = action;
        content.strData = cid;
        this.connection.send(packet);
    }

    private onOtherCharacterInfo(packge: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO = packge.content;
        this.game.emitter.emit(ModuleName.PICANEWROLE_NAME + "_anotherinfo", content);
    }
}
