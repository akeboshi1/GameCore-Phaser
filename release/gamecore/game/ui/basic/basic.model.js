var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { PacketHandler } from "net-socket-packet";
import { Export } from "webworker-rpc";
export class BasicModel extends PacketHandler {
  constructor(game) {
    super();
    this.game = game;
    __publicField(this, "event");
    this.event = game.dataControlManager.emitter;
  }
  get connection() {
    if (this.game) {
      return this.game.connection;
    }
  }
  register() {
  }
  unregister() {
  }
  destroy() {
  }
}
__decorateClass([
  Export()
], BasicModel.prototype, "connection", 1);
__decorateClass([
  Export()
], BasicModel.prototype, "register", 1);
__decorateClass([
  Export()
], BasicModel.prototype, "unregister", 1);
__decorateClass([
  Export()
], BasicModel.prototype, "destroy", 1);
