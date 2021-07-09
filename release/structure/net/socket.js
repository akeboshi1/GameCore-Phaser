var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Logger } from "../log";
import { WSWrapper, ReadyState } from "./transport/websocket";
export class SocketConnectionError extends Error {
  constructor(reason) {
    super(`SocketConnectionError: ${JSON.stringify(reason)}`);
    __publicField(this, "name", "SocketConnectionError");
    this.stack = new Error().stack;
  }
}
export class SocketConnection {
  constructor($listener) {
    __publicField(this, "mTransport");
    __publicField(this, "mServerAddr", { host: "localhost", port: 80 });
    __publicField(this, "mConnectListener");
    __publicField(this, "isAuto", true);
    __publicField(this, "mIsConnect", false);
    __publicField(this, "mCloseBack");
    this.mTransport = new WSWrapper();
    this.mConnectListener = $listener;
    Logger.getInstance().info(`SocketConnection init.`);
    if (typeof this.mTransport !== "undefined" && typeof this.mConnectListener !== "undefined") {
      const listener = this.mConnectListener;
      this.mTransport.on("open", () => {
        Logger.getInstance().info(`SocketConnection ready.[${this.mServerAddr.host}:${this.mServerAddr.port}]`);
        listener.onConnected(this.isAuto);
        this.onConnected();
        this.mIsConnect = true;
        this.isAuto = true;
      });
      this.mTransport.on("close", () => {
        Logger.getInstance().info(`SocketConnection close.`);
        this.mIsConnect = false;
        listener.onDisConnected(this.isAuto);
        if (this.mCloseBack) {
          this.mCloseBack();
        }
      });
      this.mTransport.on("error", (reason) => {
        Logger.getInstance().info(`SocketConnection error.`);
        if (this.mIsConnect)
          listener.onError(reason);
      });
    }
  }
  set state(val) {
    this.isAuto = val;
  }
  get isConnect() {
    return this.mIsConnect;
  }
  startConnect(addr) {
    this.mServerAddr = addr;
    this.doConnect();
  }
  stopConnect(closeBack) {
    if (closeBack)
      this.mCloseBack = closeBack;
    if (this.mTransport)
      this.mTransport.Close();
  }
  send(data) {
    if (!this.mTransport) {
      return Logger.getInstance().error(`Empty transport.`);
    }
    this.mTransport.Send(data);
  }
  destroy() {
    Logger.getInstance().debug("socket close");
    if (this.mTransport) {
      this.mTransport.destroy();
    }
  }
  onConnected() {
    if (!this.mTransport) {
      return Logger.getInstance().error(`Empty transport.`);
    }
    this.mTransport.on("packet", this.onData.bind(this));
  }
  onData(data) {
  }
  doConnect() {
    if (!this.mTransport) {
      return Logger.getInstance().error(`Empty transport.`);
    }
    if (this.mTransport.readyState() === ReadyState.OPEN)
      return this.mTransport.Close();
    if (this.mServerAddr.secure !== void 0)
      this.mTransport.secure = this.mServerAddr.secure;
    this.mTransport.Open(this.mServerAddr.host, this.mServerAddr.port);
  }
}
