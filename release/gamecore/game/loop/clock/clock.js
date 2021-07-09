var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_virtual_world, op_client } from "pixelpai_proto";
import { Logger } from "structure";
const IOP_CLIENT_REQ_VIRTUAL_WORLD_SYNC_TIME = op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_SYNC_TIME;
const IOP_VIRTUAL_WORLD_RES_CLIENT_SYNC_TIME = op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SYNC_TIME;
const CHECK_INTERVAL = 8e3;
export class Clock extends PacketHandler {
  constructor(con, mainPeer, listener) {
    super();
    __publicField(this, "mClockSync", false);
    __publicField(this, "mDeltaTimeToServer", 0);
    __publicField(this, "mConn");
    __publicField(this, "mIntervalId");
    __publicField(this, "mListener");
    __publicField(this, "mainPeer");
    __publicField(this, "mStartCheckBoo", false);
    this.mConn = con;
    this.mConn.addPacketListener(this);
    this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SYNC_TIME, this.proof);
    this.mListener = listener;
    this.mainPeer = mainPeer;
    con.setClock(this);
  }
  get sysUnixTime() {
    return new Date().getTime();
  }
  get unixTime() {
    return this.sysUnixTime + this.mDeltaTimeToServer;
  }
  startCheckTime() {
    if (this.mStartCheckBoo)
      return;
    this.mStartCheckBoo = true;
    this._check();
  }
  sync(times = 1) {
    if (!this.mStartCheckBoo) {
      Logger.getInstance().log("clock no start ====>");
      return;
    }
    if (!this.mConn)
      return;
    if (times < 0) {
      times = 1;
    }
    for (let i = 0; i < times; ++i) {
      const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SYNC_TIME);
      const ct = pkt.content;
      ct.clientStartTs = this.sysUnixTime;
      this.mainPeer.send(pkt.Serialization());
    }
  }
  clearTime() {
    this.mStartCheckBoo = false;
    this.mClockSync = false;
    if (this.mIntervalId) {
      clearInterval(this.mIntervalId);
    }
    this.mDeltaTimeToServer = 0;
    this._check();
  }
  destroy() {
    if (this.mConn) {
      this.mConn.removePacketListener(this);
      this.mConn = void 0;
    }
    if (this.mIntervalId) {
      clearInterval(this.mIntervalId);
    }
  }
  get clockSync() {
    return this.mClockSync;
  }
  _check() {
    const self = this;
    this.mIntervalId = setInterval(() => {
      self.sync();
    }, CHECK_INTERVAL);
  }
  proof(packet) {
    const ct = packet.content;
    const local_receive = this.sysUnixTime, local_send = ct.clientStartTs, remote_receive = ct.serverReceiveTs, remote_send = ct.serverSendTs;
    this.mDeltaTimeToServer = Math.floor((remote_receive - local_send + (remote_send - local_receive)) / 2);
    if (this.mListener) {
      this.mClockSync = true;
      this.mListener.onClockReady();
    }
  }
}
