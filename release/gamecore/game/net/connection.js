var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { PBpacket } from "net-socket-packet";
import * as protos from "pixelpai_proto";
import { Logger } from "structure";
import { SocketConnection } from "structure";
for (const key in protos) {
  PBpacket.addProtocol(protos[key]);
}
export class GameSocket extends SocketConnection {
  constructor(mainPeer, $listener) {
    super($listener);
    __publicField(this, "mainPeer");
    this.mainPeer = mainPeer;
  }
  set state(val) {
    this.isAuto = val;
  }
  send(data) {
    super.send(data);
  }
  onData(data) {
    this.mainPeer.onData(data);
  }
}
export class ConnListener {
  constructor(peer) {
    __publicField(this, "mainPeer");
    this.mainPeer = peer;
  }
  onConnected(isAuto) {
    this.mainPeer.onConnected(isAuto);
    Logger.getInstance().log(`MainWorker[\u5DF2\u8FDE\u63A5]`);
  }
  onDisConnected(isAuto) {
    this.mainPeer.onDisConnected(isAuto);
    Logger.getInstance().log(`MainWorker[\u5DF2\u65AD\u5F00]`);
  }
  onRefreshConnect(isAuto) {
    this.mainPeer.reconnect(isAuto);
    Logger.getInstance().log(`MainWorker[\u6B63\u5728\u5237\u65B0\u94FE\u63A5]`);
  }
  onError(reason) {
    if (reason) {
      this.mainPeer.onConnectError(reason.message);
      Logger.getInstance().error(`MainWorker[\u9519\u8BEF]:${reason.message}`);
    } else {
      Logger.getInstance().error(`MainWorker[\u9519\u8BEF]:${reason}`);
    }
  }
}
export class Connection {
  constructor(peer) {
    __publicField(this, "mCache", []);
    __publicField(this, "mUuid", 0);
    __publicField(this, "mPacketHandlers", []);
    __publicField(this, "mCachedServerAddress");
    __publicField(this, "mSocket");
    __publicField(this, "isConnect", false);
    __publicField(this, "isPause", false);
    __publicField(this, "mClock");
    __publicField(this, "mPeer");
    __publicField(this, "gateway");
    __publicField(this, "isCloseing", false);
    this.mPeer = peer;
  }
  update() {
  }
  get pause() {
    return this.isPause;
  }
  get connect() {
    if (!this.mSocket) {
      return false;
    }
    return this.mSocket.isConnect;
  }
  set connect(val) {
    this.isConnect = val;
  }
  get socket() {
    return this.mSocket;
  }
  startConnect(addr, keepalive) {
    if (this.isCloseing) {
      this.gateway = { addr, keepalive };
      return;
    }
    if (this.isConnect)
      this.closeConnect();
    this.mCachedServerAddress = addr;
    if (this.mSocket) {
      return;
    }
    this.mSocket = new GameSocket(this.mPeer, new ConnListener(this.mPeer));
    this.mSocket.startConnect(this.mCachedServerAddress);
  }
  closeConnect() {
    this.isConnect = false;
    this.isCloseing = true;
    this.mCachedServerAddress = void 0;
    if (this.mSocket) {
      this.mSocket.state = false;
      this.mSocket.isConnect ? this.mSocket.stopConnect(this.closeBack()) : this.closeBack();
    }
    this.clearPacketListeners();
  }
  closeBack() {
    this.isCloseing = false;
    this.mSocket.destroy();
    this.mSocket = null;
    if (this.gateway)
      this.startConnect(this.gateway.addr, this.gateway.keepalive);
  }
  setClock(clock) {
    this.mClock = clock;
  }
  addPacketListener(listener) {
    const idx = this.mPacketHandlers.indexOf(listener);
    if (idx !== -1)
      return;
    this.mPacketHandlers.push(listener);
  }
  send(packet) {
    packet.header.timestamp = this.mClock ? this.mClock.unixTime : 0;
    packet.header.uuid = this.mUuid || 0;
    this.mSocket.send(packet.Serialization());
    Logger.getInstance().log(`MainWorker[\u53D1\u9001] >>> ${packet.toString()}`);
  }
  removePacketListener(listener) {
    const idx = this.mPacketHandlers.indexOf(listener);
    if (idx !== -1) {
      this.mPacketHandlers.splice(idx, 1);
    }
  }
  clearPacketListeners() {
    if (!this.mPacketHandlers || this.mPacketHandlers.length < 1) {
      return;
    }
    const len = this.mPacketHandlers.length;
    for (let i = 0; i < len; i++) {
      const listener = this.mPacketHandlers[i];
      if (!listener)
        continue;
      this.removePacketListener(listener);
      i--;
    }
  }
  onData(data) {
    if (!this.isConnect)
      return;
    const protobuf_packet = PBpacket.Create(data);
    this.mUuid = protobuf_packet.header.uuid;
    Logger.getInstance().log(`MainWorker[\u63A5\u6536] <<< ${protobuf_packet.toString()} `);
    const handlers = this.mPacketHandlers;
    this.mPeer.clearBeat();
    handlers.forEach((handler) => {
      handler.onPacketArrived(protobuf_packet);
    });
  }
  onFocus() {
    this.isPause = false;
  }
  onBlur() {
    this.isPause = true;
  }
}
