import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { EventType } from "structure";
import { EventDispatcher } from "utils";
import { Game } from "../game";
import { BasePacketHandler } from "./base.packet.handler";
export class BaseDataManager extends BasePacketHandler {
    private mSNRequirements: Map<string, op_client.ICountablePackageItem[]>;
    private mSNIDConfig: Map<string, any>;
    constructor(game: Game, event?: EventDispatcher) {
        super(game, event);
        this.mSNRequirements = new Map();
        this.mSNIDConfig = new Map();
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_REQUIRE_FURNITURE_UNFROZEN_REQUIREMENTS, this.on_FURNITURE_UNFROZEN_REQUIREMENTS);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_CONFIGS, this.on_ELEMENT_ITEM_REQUIREMENTS);
        this.addPackListener();
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

    /**
     * 数据配置请求
     * @param id 道具-ID或element-SN
     * @param schema 标记 QueryItems-道具 ,PreviewElementRewards-宝箱
     */
    query_ELEMENT_ITEM_REQUIREMENTS(id: string, schema: string = "PreviewElementRewards") {
        if (this.mSNIDConfig.has(id)) {
            const status = 0;
            const data = this.mSNIDConfig.get(id);
            this.mEvent.emit(EventType.ELEMENT_ITEM_CONFIG, { status, data });
        } else {
            const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_QUERY_CONFIGS);
            const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_QUERY_CONFIGS = pkt.content;
            content.schema = schema;
            content.request = id;
            this.connection.send(pkt);
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
    private on_ELEMENT_ITEM_REQUIREMENTS(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_CONFIGS = packet.content;
        const status = content.status;
        const data = content.data;
        if (status === 0) {
            const jsonData = JSON.parse(data);
            if (jsonData.hasOwnProperty("sn")) {
                const sn = jsonData["sn"];
                this.mSNIDConfig.set(sn, jsonData);
            } else if (jsonData.hasOwnProperty("id")) {
                const id = jsonData["id"];
                this.mSNIDConfig.set(id, jsonData);
            }
        }
        this.mEvent.emit(EventType.ELEMENT_ITEM_CONFIG, { status, data });
    }

}
