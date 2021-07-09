var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { PacketHandler } from "net-socket-packet";
export class BaseDataPacketHandler extends PacketHandler {
  constructor(game, event) {
    super();
    this.game = game;
    __publicField(this, "mEvent");
    this.mEvent = event;
  }
  addPackListener() {
    if (this.connection) {
      this.connection.addPacketListener(this);
    }
  }
  removePackListener() {
    if (this.connection) {
      this.connection.removePacketListener(this);
    }
  }
  clear() {
    this.removePackListener();
    this.mEvent.offAllCaller(this);
  }
  destroy() {
    this.clear();
    this.game = void 0;
    this.mEvent = void 0;
  }
  on(event, fn, context) {
    this.mEvent.on(event, context, fn);
  }
  off(event, fn, context) {
    this.mEvent.off(event, context, fn);
  }
  emit(event, data) {
    this.mEvent.emit(event, data);
  }
  get connection() {
    if (this.game) {
      return this.game.connection;
    }
  }
  get Event() {
    return this.mEvent;
  }
}
