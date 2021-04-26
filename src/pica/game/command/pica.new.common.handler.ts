import { NewProtoHandler } from "gamecore";
import { EventType, ModuleName } from "structure";
import { op_client, op_virtual_world, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { CommandMsgType } from "./command.msg.type";
export class PicaNewCommonHandler extends NewProtoHandler {
    protected onAddListener() {
        this.proto.on("OP_CLIENT_REQ_VIRTUAL_RED_DOT_STATUS", this.onRedPointHandler, this);
        this.proto.on("OP_RES_SERVER_TEST_GET_TRUMPET_MESSAGE", this.onTrumpetMsgHandler, this);
        this.proto.on("OP_RES_SERVER_TEST_GET_ROLLING_BANNER", this.onRollingMsgHandler, this);
        this.proto.on("OP_VIRTUAL_WORLD_RES_CLIENT_SELF_ROOM_LIST", this.onSelfRoomListHandler, this);
        this.game.emitter.on(EventType.SEND_NEW_PROTO_MESSAGE, this.onSendNewProtoHandler, this);
    }

    protected onRemoveListener() {
        this.proto.off("OP_CLIENT_REQ_VIRTUAL_RED_DOT_STATUS", this.onRedPointHandler, this);
        this.proto.off("OP_RES_SERVER_TEST_GET_TRUMPET_MESSAGE", this.onTrumpetMsgHandler, this);
        this.proto.off("OP_RES_SERVER_TEST_GET_ROLLING_BANNER", this.onRollingMsgHandler, this);
        this.proto.on("OP_VIRTUAL_WORLD_RES_CLIENT_SELF_ROOM_LIST", this.onSelfRoomListHandler, this);
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
        this.emit(CommandMsgType.PicaTrumpetMsg, content);
    }
    protected onRollingMsgHandler(proto: any) {
        const content = proto.content;
        this.game.showMediator(ModuleName.PICAMARQUEE_NAME, true, content);
    }
    protected onSelfRoomListHandler(proto: any) {
        const content = proto.content;
        this.emit(CommandMsgType.PicaSelfRoomList, content);
    }
}
