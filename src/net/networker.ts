import {IConnectListener, SocketConnection, SocketConnectionError} from "./socket";
import {ServerAddress} from "./address";
import {PBpacket} from "net-socket-packet";
import {Buffer} from "buffer/";

const ctx: Worker = self as any;

class ConnListener implements IConnectListener {
    onConnected(connection: SocketConnection): void {
    }

    onDisConnected(connection: SocketConnection): void {
    }

    onError(reason: SocketConnectionError | undefined): void {
    }

}

// run socket client through web-worker
const socket: SocketConnection = new SocketConnection(new ConnListener());

ctx.onmessage = ev => {
    const data: any = ev.data;
    let addr: ServerAddress;
    console.log(`I am the worker.`);
    console.dir(data);

    const pkt: PBpacket = new PBpacket();
    console.log(data.method);
    pkt.Deserialization(new Buffer(data['msg']));
    console.dir(pkt.header);
    console.dir(pkt.content);
    // ctx.postMessage(`bot: hello boss.`);
    // switch (msg) {
    //     case ''
    //     case 'connect':
    //         if (addr) socket.startConnect(addr);
    //         break;
    //
    // }
};


