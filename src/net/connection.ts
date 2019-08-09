import {ConnectionService} from "./connection.service";
import {ServerAddress} from "./address";
import {IConnectListener} from "./socket";
import {PBpacket} from "net-socket-packet";
import {op_gateway} from "pixelpai_proto";

const NetWorker = require("worker-loader?publicPath=/dist/&name=[hash].[name].js!./networker.ts");

// 网络连接器
// 使用webworker启动socket，无webworker时直接启动socket
export default class Connection implements ConnectionService {
    private mWorker: any;

    constructor(listener: IConnectListener) {
        try {
            this.mWorker = new NetWorker();
            const pkt: PBpacket = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT);
            // pkt.content.gameId = 'this-is-a-test';
            this.mWorker.postMessage({
                "method": "test",
                "msg":pkt.Serialization()
            })
        } catch (e) {
            // TODO throw error message
        }
    }

    startConnect(addr: ServerAddress, keepalive?: boolean): void {
    }

    closeConnect(): void {
    }

}
