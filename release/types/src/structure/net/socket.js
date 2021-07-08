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
import { Logger } from "../log";
import { WSWrapper, ReadyState } from "./transport/websocket";
var SocketConnectionError = /** @class */ (function (_super) {
    __extends_1(SocketConnectionError, _super);
    function SocketConnectionError(reason) {
        var _this = _super.call(this, "SocketConnectionError: " + JSON.stringify(reason)) || this;
        _this.name = "SocketConnectionError";
        _this.stack = new Error().stack;
        return _this;
    }
    return SocketConnectionError;
}(Error));
export { SocketConnectionError };
// 实际工作在Web-Worker内的WebSocket客户端
var SocketConnection = /** @class */ (function () {
    function SocketConnection($listener) {
        var _this = this;
        this.mServerAddr = { host: "localhost", port: 80 };
        // true是外部断网，false是手动断网
        this.isAuto = true;
        this.mIsConnect = false;
        this.mTransport = new WSWrapper();
        this.mConnectListener = $listener;
        Logger.getInstance().info("SocketConnection init.");
        // add connection event to listener
        if (typeof this.mTransport !== "undefined" && typeof this.mConnectListener !== "undefined") {
            var listener_1 = this.mConnectListener;
            this.mTransport.on("open", function () {
                Logger.getInstance().info("SocketConnection ready.[" + _this.mServerAddr.host + ":" + _this.mServerAddr.port + "]");
                listener_1.onConnected(_this.isAuto);
                _this.onConnected();
                _this.mIsConnect = true;
                _this.isAuto = true;
            });
            this.mTransport.on("close", function () {
                Logger.getInstance().info("SocketConnection close.");
                _this.mIsConnect = false;
                listener_1.onDisConnected(_this.isAuto);
                if (_this.mCloseBack) {
                    _this.mCloseBack();
                }
            });
            this.mTransport.on("error", function (reason) {
                Logger.getInstance().info("SocketConnection error.");
                if (_this.mIsConnect)
                    listener_1.onError(reason);
            });
        }
    }
    Object.defineProperty(SocketConnection.prototype, "state", {
        set: function (val) {
            this.isAuto = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SocketConnection.prototype, "isConnect", {
        get: function () {
            return this.mIsConnect;
        },
        enumerable: true,
        configurable: true
    });
    SocketConnection.prototype.startConnect = function (addr) {
        this.mServerAddr = addr;
        this.doConnect();
    };
    SocketConnection.prototype.stopConnect = function (closeBack) {
        if (closeBack)
            this.mCloseBack = closeBack;
        if (this.mTransport)
            this.mTransport.Close();
    };
    SocketConnection.prototype.send = function (data) {
        if (!this.mTransport) {
            return Logger.getInstance().error("Empty transport.");
        }
        this.mTransport.Send(data);
    };
    // Frees all resources for garbage collection.
    SocketConnection.prototype.destroy = function () {
        Logger.getInstance().debug("socket close");
        if (this.mTransport) {
            this.mTransport.destroy();
        }
    };
    SocketConnection.prototype.onConnected = function () {
        if (!this.mTransport) {
            return Logger.getInstance().error("Empty transport.");
        }
        this.mTransport.on("packet", this.onData.bind(this));
    };
    SocketConnection.prototype.onData = function (data) {
        // do nothing.
        // override by subclass.
    };
    SocketConnection.prototype.doConnect = function () {
        if (!this.mTransport) {
            return Logger.getInstance().error("Empty transport.");
        }
        if (this.mTransport.readyState() === ReadyState.OPEN)
            return this.mTransport.Close();
        if (this.mServerAddr.secure !== undefined)
            this.mTransport.secure = this.mServerAddr.secure;
        this.mTransport.Open(this.mServerAddr.host, this.mServerAddr.port);
    };
    return SocketConnection;
}());
export { SocketConnection };
//# sourceMappingURL=socket.js.map