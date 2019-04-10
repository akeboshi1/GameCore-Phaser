import {PacketHandler, PBpacket} from "net-socket-packet";
import {op_client} from "pixelpai_proto";

export class BasePacketHandler extends PacketHandler {
    constructor() {
        super();
        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_ERROR, this.onErrorHandler);
    }

    protected onErrorHandler(packet: PBpacket) {
        let err: op_client.IOP_GATEWAY_RES_CLIENT_ERROR = packet.content;
        console.error(`error[${err.responseStatus}]: ${err.msg}`);
    }
}
