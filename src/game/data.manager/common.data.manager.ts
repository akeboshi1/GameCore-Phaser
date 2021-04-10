import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { EventType, ModuleName, RoomType } from "structure";
import { EventDispatcher } from "utils";
import { Game } from "../game";
import { BasePacketHandler } from "./base.packet.handler";
import { CacheDataManager } from "./cache.dataManager";
import { DataMgrType } from "./dataManager";
export class CommonDataManager extends BasePacketHandler {
    constructor(game: Game, event?: EventDispatcher) {
        super(game, event);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_EXPLORE_CHAPTER_PROGRESS, this.on_ALL_CHAPTER_PROGRESS);
        this.addPackListener();
    }
    clear() {
        super.clear();
    }

    destroy() {
        super.destroy();
    }

    private on_ALL_CHAPTER_PROGRESS(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_EXPLORE_CHAPTER_PROGRESS = packet.content;
        const mgr = this.game.getDataMgr<CacheDataManager>(DataMgrType.CacheMgr);
        mgr.setChapters(content);
    }

}
