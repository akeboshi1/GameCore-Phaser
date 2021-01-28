import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { ModuleName } from "structure";

export class PicaExploreLog extends BasicModel {
    constructor(game: Game) {
        super(game);
        this.register();
    }
    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_EXPLORE_REQUIRE_LIST, this.onEXPLORE_REQUIRE_LIST);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_CHAPTER_RESULT, this.onQUERY_CHAPTER_RESULT);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_EXPLORE_SUMMARY, this.onEXPLORE_SUMMARY);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_EXPLORE_SHOW_COUNTDOWN, this.onSHOW_COUNTDOWN);
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

    queryExploreChapter(chapterId: number) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_QUERY_CHAPTER);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_QUERY_CHAPTER = packet.content;
        content.chapterId = chapterId;
        this.connection.send(packet);
    }

    queryExploreUseHint() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_EXPLORE_USE_HINT);
        this.connection.send(packet);
    }
    queryGOHome() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_GO_HOME);
        this.connection.send(packet);
    }

    private onEXPLORE_REQUIRE_LIST(packge: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_EXPLORE_REQUIRE_LIST = packge.content;
        this.event.emit(ModuleName.PICAEXPLORELOG_NAME + "_retexplorelist", content);
    }
    private onQUERY_CHAPTER_RESULT(packge: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_CHAPTER_RESULT = packge.content;
        this.event.emit(ModuleName.PICAEXPLORELOG_NAME + "_retchapterlist", content);
    }
    private onEXPLORE_SUMMARY(packge: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_EXPLORE_SUMMARY = packge.content;
        this.event.emit(ModuleName.PICAEXPLORELOG_NAME + "_retexploresettle", content);
    }
    private onSHOW_COUNTDOWN(packge: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_EXPLORE_SHOW_COUNTDOWN = packge.content;
        this.event.emit(ModuleName.PICAEXPLORELOG_NAME + "_retexplorecountdown", content);
    }
}
