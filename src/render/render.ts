import { RPCExecutePacket } from "../../lib/rpc/rpc.message";
import { RPCPeer } from "../../lib/rpc/rpc.peer";

export class Render extends RPCPeer {
    constructor() {
        super("render");
    }
}
