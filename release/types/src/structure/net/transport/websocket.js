var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { EventEmitter } from "events";
// @ts-ignore
var Socket = WebSocket || MozWebSocket;
export var ReadyState;
(function (ReadyState) {
    ReadyState[ReadyState["CONNECTING"] = 0] = "CONNECTING";
    ReadyState[ReadyState["OPEN"] = 1] = "OPEN";
    ReadyState[ReadyState["CLOSING"] = 2] = "CLOSING";
    ReadyState[ReadyState["CLOSED"] = 3] = "CLOSED";
})(ReadyState || (ReadyState = {}));
var WSWrapper = /** @class */ (function (_super) {
    __extends_1(WSWrapper, _super);
    function WSWrapper(host, port, autoReconnect) {
        var _this = _super.call(this) || this;
        _this.secure = true;
        _this._connection = undefined;
        _this._readyState = ReadyState.CLOSED;
        _this._packets_q = [];
        _this._writable = false;
        _this._sent_count = 0;
        _this._auto_reconnect = false;
        _this._force_close = false;
        _this._host = host || "localhost";
        _this._port = port || 80;
        if (typeof autoReconnect !== "undefined")
            _this._auto_reconnect = autoReconnect;
        return _this;
    }
    WSWrapper.prototype.Open = function (host, port) {
        if (typeof host !== "undefined" && typeof port !== "undefined") {
            this._host = host;
            this._port = port;
        }
        this.doOpen();
    };
    WSWrapper.prototype.readyState = function () {
        return this._readyState;
    };
    WSWrapper.prototype.Close = function () {
        this.doClose();
    };
    WSWrapper.prototype.Send = function (packet) {
        if (ReadyState.OPEN === this._readyState) {
            this._packets_q.push(packet);
            this.write();
        }
        else {
            this.emit("error", "Transport not open yet.");
        }
    };
    // Frees all resources for garbage collection.
    WSWrapper.prototype.destroy = function () {
        this.onClose();
        // TODO
    };
    WSWrapper.prototype.addCallBacks = function () {
        var _this = this;
        this._connection.onopen = function () {
            _this.onOpen();
        };
        this._connection.onclose = function () {
            _this.onClose();
        };
        this._connection.onmessage = function (ev) {
            // console.info(`_connection.onmessage`);
            _this.onData(ev.data);
        };
        this._connection.onerror = function (e) {
            _this.emit("error", e);
        };
    };
    WSWrapper.prototype.onOpen = function () {
        this._readyState = ReadyState.OPEN;
        this._writable = true;
        this.emit("open");
    };
    WSWrapper.prototype.onClose = function () {
        this._readyState = ReadyState.CLOSED;
        this._writable = false;
        this.emit("close");
        if (this._auto_reconnect && !this._force_close) {
            this.emit("reopen");
            this.doOpen();
        }
    };
    WSWrapper.prototype.onData = function (data) {
        this.emit("packet", data);
    };
    WSWrapper.prototype.doOpen = function () {
        /**
         * Get either the `WebSocket` or `MozWebSocket` globals
         * in the browser
         */
        if (typeof Socket === "undefined") {
            this.emit("error", "WebSocket is NOT support by this Browser.");
            return;
        }
        var uri = this.uri();
        try {
            if (this._connection) {
                this._connection.close();
                this._connection = null;
            }
            this._connection = new Socket(uri);
            this._connection.binaryType = "arraybuffer";
            this.addCallBacks();
        }
        catch (e) {
            this.emit("error", e);
        }
    };
    WSWrapper.prototype.doClose = function () {
        if (typeof this._connection !== "undefined") {
            this._force_close = true;
            this._connection.close();
            this._readyState = ReadyState.CLOSING;
            this.emit("closing");
        }
    };
    WSWrapper.prototype.uri = function () {
        var schema = this.secure ? "wss" : "ws";
        var port = "";
        if (this._port && (("wss" === schema && Number(this._port) !== 443) ||
            ("ws" === schema && Number(this._port) !== 80))) {
            port = ":" + this._port;
        }
        return schema + "://" + this._host + port;
    };
    WSWrapper.prototype.write = function () {
        var _this = this;
        if (this._packets_q.length > 0 && this._writable) {
            var packet_1 = this._packets_q.shift();
            this._writable = false; // write lock!
            new Promise(function (resolve, reject) {
                try {
                    _this._connection.send(packet_1);
                    resolve(null);
                }
                catch (e) {
                    reject(e);
                }
            }).then(function () {
                // send ok
                _this.emit("sent", [++_this._sent_count, packet_1]);
                _this._writable = true;
                _this.write();
            }).catch(function (reason) {
                _this.emit("error", reason);
            });
        }
    };
    return WSWrapper;
}(EventEmitter));
export { WSWrapper };
//# sourceMappingURL=websocket.js.map