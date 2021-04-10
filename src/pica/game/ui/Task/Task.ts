import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { CopyProtoType } from "utils";

export class Task extends BasicModel {
    constructor(game: Game) {
        super(game);
        this.register();
    }
    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_QUEST_LIST, this.onRetQuestList);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_QUEST_DETAIL, this.onRetQuestDetail);
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

    public queryQuestList() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_QUERY_QUEST_LIST);
        this.connection.send(packet);
    }

    public queryQuestDetail(id: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_QUERY_QUEST_DETAIL);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_QUERY_QUEST_DETAIL = packet.content;
        content.id = id;
        this.connection.send(packet);
    }

    public querySubmitQuest(id: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_SUBMIT_QUEST);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_SUBMIT_QUEST = packet.content;
        content.id = id;
        this.connection.send(packet);
    }

    private onRetQuestList(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_QUEST_LIST = packet.content;
        const quests: any = CopyProtoType.copyProtoParam(content.quests);
        this.event.emit("questlist", quests);
    }

    private onRetQuestDetail(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_QUEST_DETAIL = packet.content;
        const quests: any = CopyProtoType.copyProtoParam([content.quest]);
        this.event.emit("questdetail", quests[0]);
    }
}
