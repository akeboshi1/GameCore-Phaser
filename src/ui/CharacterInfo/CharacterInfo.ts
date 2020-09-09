import { PacketHandler, PBpacket } from "net-socket-packet";
import { WorldService } from "../../game/world.service";
import { op_client, op_virtual_world, op_def, op_pkt_def } from "pixelpai_proto";
import { ConnectionService } from "../../../lib/net/connection.service";
import { Logger } from "../../utils/log";

export class CharacterInfo extends PacketHandler {
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
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_SELF_PLAYER_INFO, this.onOwnerCharacterInfo);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO, this.onOtherCharacterInfo);
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

    public queryPlayerInfo() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_SELF_PLAYER_INFO);
        this.connection.send(packet);
    }

    public track(id: string) {
        this.playerInteraction(id, op_pkt_def.PKT_PlayerInteraction.PKT_tracePlayer);
    }

    public invite(id: string) {
        this.playerInteraction(id, op_pkt_def.PKT_PlayerInteraction.PKT_invitePlayer);
    }

    private playerInteraction(id: string, method: op_pkt_def.PKT_PlayerInteraction) {
        const param = op_def.GeneralParam.create();
        param.t = op_def.GeneralParamType.str;
        param.valStr = id;
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_PLAYER_INTERACTION);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_PLAYER_INTERACTION = packet.content;
        content.method = method;
        content.param = param;
        this.connection.send(packet);
    }

    private onOwnerCharacterInfo(packge: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_SELF_PLAYER_INFO = packge.content;
        this.mEvent.emit("ownerInfo", content);
    }

    private onOtherCharacterInfo(packge: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ANOTHER_PLAYER_INFO = packge.content;
        this.mEvent.emit("otherInfo", content);
    }
}
