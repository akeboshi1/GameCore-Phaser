import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { EventType } from "structure";
import { EventDispatcher } from "utils";
import { Game } from "../game";
import { BasePacketHandler } from "./base.packet.handler";
import { DataMgrType } from "./dataManager";
export class SceneDataManager extends BasePacketHandler {
    constructor(game: Game,event?: EventDispatcher) {
        super(game,event);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_PARTY_SEND_GIFT, this.on_SEND_GIFT_DATA);
        this.addPackListener();
    }
    clear() {
        super.clear();
    }

    destroy() {
        super.destroy();
    }

    private on_SEND_GIFT_DATA(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_PARTY_SEND_GIFT = packet.content;
        this.mEvent.emit(EventType.SEND_GIFT_DATA_UPDATE, content);
        this.sendOpenGiftEffect(content);
    }
    private sendOpenGiftEffect(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_PARTY_SEND_GIFT) {
        this.mEvent.emit(EventType.SCENE_SHOW_UI, ["PicGiftEffect", content]);
        const dataMgr = this.game.dataManager;
        const mgr = dataMgr.getDataMgr<any>(DataMgrType.BaseMgr);
        if (mgr) {
            mgr.query_ELEMENT_ITEM_REQUIREMENTS(content.itemId, "QueryItems");
        }
    }
}
