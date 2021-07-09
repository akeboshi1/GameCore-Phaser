var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { PacketHandler } from "net-socket-packet";
export class BaseState extends PacketHandler {
  constructor(main, key) {
    super();
    __publicField(this, "mMain");
    __publicField(this, "mKey");
    __publicField(this, "mConnect");
    __publicField(this, "mGame");
    this.mMain = main;
    this.mKey = key;
  }
  get main() {
    return this.mMain;
  }
  get key() {
    return this.mKey;
  }
  run(data) {
    this.mConnect = this.mMain.game.connection;
    this.mGame = this.mMain.game;
  }
  update(data) {
  }
  next(data) {
    this.removePacketListener();
  }
  addPacketListener() {
    if (this.mConnect)
      this.mConnect.addPacketListener(this);
  }
  removePacketListener() {
    if (this.mConnect)
      this.mConnect.removePacketListener(this);
  }
}
