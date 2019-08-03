import {ConnectionService} from "./connection.service";
import {ServerAddress} from "./address";
import {IConnectListener} from "./socket";


// 网络连接器
// 使用webworker启动socket，无webworker时直接启动socket
export default class Connection implements ConnectionService {
    constructor(listener: IConnectListener) {
    }

    startConnect(addr: ServerAddress, keepalive?: boolean): void {
    }

    closeConnect(): void {
    }

}
