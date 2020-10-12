import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { WorldService } from "../../world.service";
import { ConnectionService } from "../../../../lib/net/connection.service";

export class Compose extends PacketHandler {
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
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CRAFT_QUERY_FORMULA, this.onRetFormulaDetial);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CRAFT_SKILLS, this.openComposePanel);
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

    public onReqFormulaDetail(id: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_CRAFT_QUERY_FORMULA);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_CRAFT_QUERY_FORMULA = packet.content;
        content.id = id;
        this.connection.send(packet);
    }
    public onReqUseFormula(id: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_CRAFT_ALCHEMY);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_CRAFT_ALCHEMY = packet.content;
        content.id = id;
        this.connection.send(packet);
    }
    private onRetFormulaDetial(packge: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CRAFT_QUERY_FORMULA = packge.content;
        this.mEvent.emit("formulaDetial", content);
    }
    private openComposePanel(packge: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CRAFT_SKILLS = packge.content;
        this.mEvent.emit("showopen", content);
    }

}
