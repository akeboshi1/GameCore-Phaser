import {
  IConnectListener,
  SocketConnection,
  SocketConnectionError
} from "./socket";
import { ServerAddress } from "./address";
import { PBpacket } from "net-socket-packet";
import { Buffer } from "buffer/";

const ctx: Worker = self as any;

class ConnListener implements IConnectListener {
  onConnected(connection: SocketConnection): void {
    ctx.postMessage({
      method: "onConnected"
    });
    console.info(`NetWorker[已连接]`);
  }

  onDisConnected(connection: SocketConnection): void {
    ctx.postMessage({
      method: "onDisConnected"
    });
    console.info(`NetWorker[已断开]`);
  }

  onError(reason: SocketConnectionError | undefined): void {
    if (reason) {
      ctx.postMessage({
        method: "onConnectError",
        error: reason.message
      });
      console.error(`NetWorker[错误]:${reason.message}`);
    } else {
      console.error(`NetWorker[错误]:${reason}`);
    }
  }
}

class WorkerClient extends SocketConnection {
  protected mUuid: number = 0;

  protected onData(data: any) {
    let protobuf_packet: PBpacket = new PBpacket();
    protobuf_packet.Deserialization(new Buffer(data));
    this.mUuid = protobuf_packet.header.uuid;
    console.log(`NetWorker[接收] <<< ${protobuf_packet.toString()} `);
    // Send the packet to parent thread
    ctx.postMessage({
      method: "onData",
      buffer: protobuf_packet.Serialization()
    });
  }

  send(data: any): void {
    let protobuf_packet: PBpacket = new PBpacket();
    protobuf_packet.Deserialization(new Buffer(data));
    protobuf_packet.header.uuid = this.mUuid || 0;
    super.send(protobuf_packet.Serialization());
    console.log(`NetWorker[发送] >>> ${protobuf_packet.toString()}`);
  }
}

// run socket client through web-worker
const socket: SocketConnection = new WorkerClient(new ConnListener());

ctx.onmessage = ev => {
  const data: any = ev.data;

  switch (data.method) {
    case "connect":
      let addr: ServerAddress = data.address;
      if (addr) socket.startConnect(addr);
      break;
    case "send":
      const buf = data.buffer;
      socket.send(new Buffer(buf));
      break;
  }
};
