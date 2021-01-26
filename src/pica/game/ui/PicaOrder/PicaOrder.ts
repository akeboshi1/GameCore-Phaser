import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_pkt_def } from "pixelpai_proto";
import { ModuleName } from "structure";
import { Logger } from "utils";

export class PicaOrder extends BasicModel {
    constructor(game: Game) {
        super(game);
        this.register();
    }
    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ORDER_LIST, this.on_ORDER_LIST);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS, this.on_PLAYER_PROGRESS);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_TEST, this.on_CLIENT_TEST);
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
    }

    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
        }
    }

    public query_WORLD_TEST() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TEST);
        this.connection.send(packet);
    }
    public query_ORDER_LIST() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_QUERY_ORDER_LIST);
        this.connection.send(packet);
        this.query_WORLD_TEST();
    }
    public query_CHANGE_ORDER_STAGE(index: number, state: op_pkt_def.PKT_Order_Operator) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_CHANGE_ORDER_STAGE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_CHANGE_ORDER_STAGE = packet.content;
        content.index = index;
        content.op = state;
        this.connection.send(packet);
    }
    public query_PLAYER_PROGRESS(name: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_QUERY_PLAYER_PROGRESS);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_QUERY_PLAYER_PROGRESS = packet.content;
        content.name = name;
        this.connection.send(packet);
    }

    public query_PLAYER_PROGRESS_REWARD(index: number) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_TAKE_PLAYER_PROGRESS_REWARD);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_TAKE_PLAYER_PROGRESS_REWARD = packet.content;
        content.index = index;
        this.connection.send(packet);
    }
    private on_ORDER_LIST(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ORDER_LIST = packet.content;
        this.event.emit(ModuleName.PICAORDER_NAME + "_modelQuestlist", content);
    }
    private on_PLAYER_PROGRESS(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS = packet.content;
        this.event.emit(ModuleName.PICAORDER_NAME + "_modelProgresslist", content);
    }

    private on_CLIENT_TEST(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_TEST = packet.content;
        Logger.getInstance().debug("++++++++++++++++++++    ", content);
    }
}
