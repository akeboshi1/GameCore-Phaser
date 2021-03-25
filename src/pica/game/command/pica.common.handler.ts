import { MessageHandler } from "gamecore";
import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
export class PicaCommonHandler extends MessageHandler {

    protected onAddListener() {
        this.addHandlerFun(op_client.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_UPDATE_GALLERY, this.on_UPDATE_GALLEPY);
    }

    protected onRemoveListener() {
        this.addHandlerFun(op_client.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_UPDATE_GALLERY, this.on_UPDATE_GALLEPY);
    }

    private on_UPDATE_GALLEPY(packet: PBpacket) {
        const content: op_client.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_UPDATE_GALLERY = packet.content;
    }
}
