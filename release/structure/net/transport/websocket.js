var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { EventEmitter } from "events";
const Socket = WebSocket || MozWebSocket;
export var ReadyState;
(function(ReadyState2) {
  ReadyState2[ReadyState2["CONNECTING"] = 0] = "CONNECTING";
  ReadyState2[ReadyState2["OPEN"] = 1] = "OPEN";
  ReadyState2[ReadyState2["CLOSING"] = 2] = "CLOSING";
  ReadyState2[ReadyState2["CLOSED"] = 3] = "CLOSED";
})(ReadyState || (ReadyState = {}));
export class WSWrapper extends EventEmitter {
  constructor(host, port, autoReconnect) {
    super();
    __publicField(this, "secure", true);
    __publicField(this, "_host");
    __publicField(this, "_port");
    __publicField(this, "_connection");
    __publicField(this, "_readyState", 3);
    __publicField(this, "_packets_q", []);
    __publicField(this, "_writable", false);
    __publicField(this, "_sent_count", 0);
    __publicField(this, "_auto_reconnect", false);
    __publicField(this, "_force_close", false);
    this._host = host || "localhost";
    this._port = port || 80;
    if (typeof autoReconnect !== "undefined")
      this._auto_reconnect = autoReconnect;
  }
  Open(host, port) {
    if (typeof host !== "undefined" && typeof port !== "undefined") {
      this._host = host;
      this._port = port;
    }
    this.doOpen();
  }
  readyState() {
    return this._readyState;
  }
  Close() {
    this.doClose();
  }
  Send(packet) {
    if (this._readyState === 1) {
      this._packets_q.push(packet);
      this.write();
    } else {
      this.emit(`error`, `Transport not open yet.`);
    }
  }
  destroy() {
    this.onClose();
  }
  addCallBacks() {
    this._connection.onopen = () => {
      this.onOpen();
    };
    this._connection.onclose = () => {
      this.onClose();
    };
    this._connection.onmessage = (ev) => {
      this.onData(ev.data);
    };
    this._connection.onerror = (e) => {
      this.emit(`error`, e);
    };
  }
  onOpen() {
    this._readyState = 1;
    this._writable = true;
    this.emit("open");
  }
  onClose() {
    this._readyState = 3;
    this._writable = false;
    this.emit("close");
    if (this._auto_reconnect && !this._force_close) {
      this.emit(`reopen`);
      this.doOpen();
    }
  }
  onData(data) {
    this.emit("packet", data);
  }
  doOpen() {
    if (typeof Socket === "undefined") {
      this.emit(`error`, `WebSocket is NOT support by this Browser.`);
      return;
    }
    const uri = this.uri();
    try {
      if (this._connection) {
        this._connection.close();
        this._connection = null;
      }
      this._connection = new Socket(uri);
      this._connection.binaryType = "arraybuffer";
      this.addCallBacks();
    } catch (e) {
      this.emit(`error`, e);
    }
  }
  doClose() {
    if (typeof this._connection !== "undefined") {
      this._force_close = true;
      this._connection.close();
      this._readyState = 2;
      this.emit(`closing`);
    }
  }
  uri() {
    const schema = this.secure ? "wss" : "ws";
    let port = "";
    if (this._port && (schema === "wss" && Number(this._port) !== 443 || schema === "ws" && Number(this._port) !== 80)) {
      port = ":" + this._port;
    }
    return `${schema}://${this._host}${port}`;
  }
  write() {
    if (this._packets_q.length > 0 && this._writable) {
      const packet = this._packets_q.shift();
      this._writable = false;
      new Promise((resolve, reject) => {
        try {
          this._connection.send(packet);
          resolve(null);
        } catch (e) {
          reject(e);
        }
      }).then(() => {
        this.emit(`sent`, [++this._sent_count, packet]);
        this._writable = true;
        this.write();
      }).catch((reason) => {
        this.emit(`error`, reason);
      });
    }
  }
}
