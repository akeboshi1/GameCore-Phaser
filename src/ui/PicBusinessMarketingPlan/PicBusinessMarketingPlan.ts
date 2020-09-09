import { PacketHandler, PBpacket } from "net-socket-packet";
import { WorldService } from "../../game/world.service";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { ConnectionService } from "../../../lib/net/connection.service";

export class PicBusinessMarketingPlan extends PacketHandler {
    private readonly world: WorldService;
    private mEvent: Phaser.Events.EventEmitter;
    constructor(world: WorldService) {
        super();
        this.world = world;
        this.mEvent = new Phaser.Events.EventEmitter();
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

    on(event: string | symbol, fn: Function, context?: any) {
        this.mEvent.on(event, fn, context);
    }

    off(event: string | symbol, fn: Function, context?: any) {
        this.mEvent.off(event, fn, context);
    }

    destroy() {
        this.unregister();
        this.mEvent.destroy();
    }

    get connection(): ConnectionService {
        if (this.world) {
            return this.world.connection;
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
        this.mEvent.emit("onequipedplan", content);
    }

    private onMARKET_PLAN_MODELS_BY_TYPE(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_MARKET_PLAN_MODELS_BY_TYPE = packet.content;
        this.mEvent.emit("onplanmodels", content);
    }
}
