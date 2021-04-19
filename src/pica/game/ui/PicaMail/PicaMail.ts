import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PBpacket } from "net-socket-packet";
import { UIAtlasName } from "picaRes";
import { op_client, op_virtual_world, op_pkt_def } from "pixelpai_proto";
import { ModuleName } from "structure";
import { CopyProtoType } from "utils";

export class PicaTask extends BasicModel {
    constructor(game: Game) {
        super(game);
        this.register();
    }
    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_UPDATE_MAILS_DATA, this.onRetMailList);
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
        this.event.destroy();
    }

    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
        }
    }

    public queryMailList() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_CHECK_ALL_MAILS);
        this.connection.send(packet);
    }

    public queryReadMail(id: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_READ_TARGET_MAIL);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_READ_TARGET_MAIL = packet.content;
        content.id = id;
        this.connection.send(packet);
    }

    public queryGetAllRewards() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_GET_ALL_ATTACHMENTS);
        this.connection.send(packet);
    }

    public queryGetTargetMail(id: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_GET_TARGET_MAIL_ATTACHMENTS);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_GET_TARGET_MAIL_ATTACHMENTS = packet.content;
        content.id = id;
        this.connection.send(packet);
    }

    private onRetMailList(packet: PBpacket) {
        const content: op_client.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_UPDATE_MAILS_DATA = packet.content;
        this.event.emit(ModuleName.PICAMAIL_NAME + "_retmaillist", content);
    }
}
