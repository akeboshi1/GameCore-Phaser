import { CacheDataManager, DataMgrType, MessageHandler } from "gamecore";
import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { EventType } from "structure";
export class PicaCommonHandler extends MessageHandler {

    protected onAddListener() {
        this.addHandlerFun(op_client.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_UPDATE_GALLERY, this.on_UPDATE_GALLEPY);
        this.game.emitter.on(EventType.QUERY_SURVEY_FURNITURE, this.query_INVESTIGATE_FURNITURE, this);
    }

    protected onRemoveListener() {
        this.game.emitter.off(EventType.QUERY_SURVEY_FURNITURE, this.query_INVESTIGATE_FURNITURE, this);
    }

    private on_UPDATE_GALLEPY(packet: PBpacket) {
        const content: op_client.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_UPDATE_GALLERY = packet.content;
        const cache = this.game.getDataMgr<CacheDataManager>(DataMgrType.CacheMgr);
        cache.setGallery(content);
    }
    private query_INVESTIGATE_FURNITURE(elementID: number) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_INVESTIGATE_FURNITURE);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_INVESTIGATE_FURNITURE = packet.content;
        content.elementId = elementID;
        this.connection.send(packet);
    }
}
