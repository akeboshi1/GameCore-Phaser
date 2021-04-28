import { CacheDataManager, DataMgrType, NewProtoHandler } from "gamecore";
import { EventType, ModuleName } from "structure";
import { op_client, op_virtual_world, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { PicaCommandMsgType } from "./pica.command.msg.type";
export class PicaNewCommonHandler extends NewProtoHandler {
    protected onAddListener() {
        this.proto.on("RED_DOT_STATUS", this.onRedPointHandler, this);
        this.proto.on("TRUMPET", this.onTrumpetMsgHandler, this);
        this.proto.on("ROLLING_BANNER", this.onRollingMsgHandler, this);
        this.proto.on("SELF_ROOM_LIST", this.onSelfRoomListHandler, this);
        this.proto.on("UPDATE_GALLERY_DATAS", this.onUpdateGalleryDatasHandler, this);
        // this.proto.on("UPDATE_ROOM_INFO", this.onModeUpdateRoomInfo, this);
        this.game.emitter.on(EventType.SEND_NEW_PROTO_MESSAGE, this.onSendNewProtoHandler, this);
    }

    protected onRemoveListener() {
        this.proto.off("RED_DOT_STATUS", this.onRedPointHandler, this);
        this.proto.off("TRUMPET", this.onTrumpetMsgHandler, this);
        this.proto.off("ROLLING_BANNER ", this.onRollingMsgHandler, this);
        this.proto.off("SELF_ROOM_LIST", this.onSelfRoomListHandler, this);
        this.proto.off("UPDATE_GALLERY_DATAS", this.onUpdateGalleryDatasHandler, this);
        //  this.proto.on("UPDATE_ROOM_INFO", this.onModeUpdateRoomInfo, this);
        this.game.emitter.off(EventType.SEND_NEW_PROTO_MESSAGE, this.onSendNewProtoHandler, this);
    }

    protected onRedPointHandler(data: any) {
        this.emit(EventType.RETURN_UPDATE_RED_SYSTEM, data.content);
    }
    protected onSendNewProtoHandler(msgName: string, cmd?: string, msg?: any) {
        this.proto.send(msgName, cmd, msg);
    }
    protected onTrumpetMsgHandler(proto: any) {
        const content = proto.content;
        this.emit(PicaCommandMsgType.PicaTrumpetMsg, content);
    }
    protected onRollingMsgHandler(proto: any) {
        const content = proto.content;
        this.game.showMediator(ModuleName.PICAMARQUEE_NAME, true, content);
    }
    protected onSelfRoomListHandler(proto: any) {
        const content = proto.content;
        this.emit(PicaCommandMsgType.PicaSelfRoomList, content);
    }
    protected onModeUpdateRoomInfo(proto: any) {
        const content = proto.content;
        this.emit(PicaCommandMsgType.PicaModeUpdateRoomInfo, content);
    }
    protected onUpdateGalleryDatasHandler(proto: any) {
        const content = proto.content;
        const cache = this.game.getDataMgr<CacheDataManager>(DataMgrType.CacheMgr);
        cache.setGallery(content);
        this.emit(PicaCommandMsgType.PicaUpdateGalleryDatas, cache.gallery);
    }
}
