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
import { Logger } from "structure";
import { Export } from "webworker-rpc";
export class Account {
  constructor() {
    __publicField(this, "gameId");
    __publicField(this, "virtualWorldId");
    __publicField(this, "sceneID");
    __publicField(this, "loc");
    __publicField(this, "spawnPointId");
    __publicField(this, "accountData");
    __publicField(this, "worldId");
  }
  getAccountData() {
    return this.accountData;
  }
  setAccount(val) {
    this.accountData = {
      id: val.id,
      fingerprint: val.fingerprint,
      refreshToken: val.refreshToken,
      expire: val.expire,
      accessToken: val.token || val.accessToken,
      gateway: val.gateway
    };
    this.saveLocalStorage();
  }
  refreshToken(data) {
    if (!this.accountData) {
      try {
        this.accountData = JSON.parse(localStorage.getItem("token"));
      } catch (e) {
        return Logger.getInstance().error(`parse token error`);
      }
    }
    const { newExpire, newFingerprint, newToken } = data;
    this.accountData.expire = newExpire;
    this.accountData.fingerprint = newFingerprint;
    this.accountData.accessToken = newToken;
    this.saveLocalStorage();
  }
  saveLocalStorage() {
    if (!this.accountData) {
      return;
    }
    const { id, fingerprint, refreshToken, expire, accessToken, gateway } = this.accountData;
    try {
      localStorage.setItem("token", JSON.stringify({ id, fingerprint, refreshToken, expire, accessToken, gateway }));
    } catch (e) {
      Logger.getInstance().warn("write localStorage fail");
    }
  }
  clear() {
    this.accountData = null;
  }
  destroy() {
    this.clear();
    localStorage.removeItem("token");
    this.enterGame(void 0, void 0, void 0, void 0, void 0);
  }
  enterGame(gameId, virtualWorldId, sceneId, loc, spawnPointId, worldId) {
    this.gameId = gameId;
    this.virtualWorldId = virtualWorldId;
    this.sceneID = sceneId;
    this.loc = loc;
    this.spawnPointId = spawnPointId;
    this.worldId = worldId;
  }
  get gameID() {
    return this.gameId;
  }
  get sceneId() {
    return this.sceneID;
  }
}
__decorateClass([
  Export()
], Account.prototype, "getAccountData", 1);
__decorateClass([
  Export()
], Account.prototype, "setAccount", 1);
__decorateClass([
  Export()
], Account.prototype, "refreshToken", 1);
__decorateClass([
  Export()
], Account.prototype, "saveLocalStorage", 1);
__decorateClass([
  Export()
], Account.prototype, "clear", 1);
__decorateClass([
  Export()
], Account.prototype, "destroy", 1);
__decorateClass([
  Export()
], Account.prototype, "enterGame", 1);
