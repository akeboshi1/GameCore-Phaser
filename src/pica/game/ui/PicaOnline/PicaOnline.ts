import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { ModuleName } from "structure";

export class PicaOnline extends BasicModel {
    constructor(game: Game) {
        super(game);
        this.register();
    }

    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CURRENT_ROOM_PLAYER_LIST, this.onRetOnlineInfo);
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

    public fetchOnlineInfo() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_CURRENT_ROOM_PLAYER_LIST);
        this.connection.send(packet);
    }
    public fetchAnotherInfo(id: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_ANOTHER_PLAYER_INFO);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_ANOTHER_PLAYER_INFO = packet.content;
        content.platformId = id;
        this.connection.send(packet);
    }

    private onRetOnlineInfo(packge: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CURRENT_ROOM_PLAYER_LIST = packge.content;
        this.game.emitter.emit(ModuleName.PICAONLINE_NAME + "_retOnlineInfo", content);
    }

    private onOtherCharacterInfo(packge: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO = packge.content;
        this.game.emitter.emit(ModuleName.PICAONLINE_NAME + "_anotherinfo", content);
    }
}
