import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";

export class PicaBusinessMarketingPlan extends BasicModel {
    constructor(game: Game) {
        super(game);
        this.register();
    }
    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_MARKET_PLAN, this.onEquiped_MARKET_PLAN);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_MARKET_PLAN_MODELS_BY_TYPE, this.onMARKET_PLAN_MODELS_BY_TYPE);
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

    public query_Equiped_MARKET_PLAN(room_id: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_MARKET_PLAN);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_MARKET_PLAN = packet.content;
        content.roomId = room_id;
        this.connection.send(packet);
    }

    public query_MARKET_PLAN_MODELS_BY_TYPE(market_plan_type: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_MARKET_PLAN_MODELS_BY_TYPE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_MARKET_PLAN_MODELS_BY_TYPE = packet.content;
        content.marketPlanType = market_plan_type;
        this.connection.send(packet);
    }

    public query_SELECT_MARKET_PLAN(room_id: string, marketPlanId: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_SELECT_MARKET_PLAN);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_SELECT_MARKET_PLAN = packet.content;
        content.marketPlanId = marketPlanId;
        content.roomId = room_id;
        this.connection.send(packet);
    }

    private onEquiped_MARKET_PLAN(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_MARKET_PLAN = packet.content;
        this.game.emitter.emit("onequipedplan", content);
    }

    private onMARKET_PLAN_MODELS_BY_TYPE(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_MARKET_PLAN_MODELS_BY_TYPE = packet.content;
        this.game.emitter.emit("onplanmodels", content);
    }
}
