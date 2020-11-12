import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { EventType } from "structure";
import { EventDispatcher } from "utils";
import { Game } from "../game";
import { BasePacketHandler } from "./base.packet.handler";
export class BaseDataManager extends BasePacketHandler {
    private mSNRequirements: Map<string, op_client.ICountablePackageItem[]>;
    constructor(game: Game, event: EventDispatcher) {
        super(game);
        this.mSNRequirements = new Map();
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_REQUIRE_FURNITURE_UNFROZEN_REQUIREMENTS, this.on_FURNITURE_UNFROZEN_REQUIREMENTS);
    }
    clear() {
        super.clear();
    }

    destroy() {
        super.destroy();
    }

    query_FURNITURE_UNFROZEN_REQUIREMENTS(sns: string[]) {
        const needSNs: string[] = [];
        const items = new Map();
        for (const sn of sns) {
            if (this.mSNRequirements.has(sn)) {
                items.set(sn, this.mSNRequirements.get(sn));
            } else needSNs.push(sn);
        }
        if (needSNs.length > 0) {
            const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_REQUIRE_FURNITURE_UNFROZEN_REQUIREMENTS);
            const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_REQUIRE_FURNITURE_UNFROZEN_REQUIREMENTS = packet.content;
            content.sn = needSNs;
            this.connection.send(packet);
        }
        if (items.size > 0) {
            this.mEvent.emit(EventType.SEND_FURNITURE_REQUIREMENTS, items);
        }
    }

    private on_FURNITURE_UNFROZEN_REQUIREMENTS(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_REQUIRE_FURNITURE_UNFROZEN_REQUIREMENTS = packet.content;
        const items = new Map();
        if (content.furnitureRequirements) {
            for (const item of content.furnitureRequirements) {
                this.mSNRequirements.set(item.sn, item.requirements);
                items.set(item.sn, item.requirements);
            }
        }
        this.mEvent.emit(EventType.SEND_FURNITURE_REQUIREMENTS, items);
    }

}
