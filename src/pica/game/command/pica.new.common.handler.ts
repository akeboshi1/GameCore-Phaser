import { NewProtoHandler } from "gamecore";
import { EventType } from "structure";
import { op_client, op_virtual_world, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
export class PicaNewCommonHandler extends NewProtoHandler {
    protected onAddListener() {
        this.proto.on("OP_CLIENT_REQ_VIRTUAL_RED_DOT_STATUS", this.onRedPointHandler, this);
    }

    protected onRemoveListener() {
        this.proto.off("OP_CLIENT_REQ_VIRTUAL_RED_DOT_STATUS", this.onRedPointHandler, this);
    }

    protected onRedPointHandler(data: any) {
        this.emitter.emit(EventType.RETURN_UPDATE_RED_SYSTEM, data.content);
    }
}
