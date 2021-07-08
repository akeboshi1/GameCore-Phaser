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
import { PBpacket } from "net-socket-packet";
import * as protos from "pixelpai_proto";
import { Logger } from "structure";
import { SocketConnection } from "structure";
for (var key in protos) {
    PBpacket.addProtocol(protos[key]);
}
var GameSocket = /** @class */ (function (_super) {
    __extends_1(GameSocket, _super);
    // private socketList: any[];
    // private mTimestamp: number;
    function GameSocket(mainPeer, $listener) {
        var _this = _super.call(this, $listener) || this;
        _this.mainPeer = mainPeer;
        return _this;
        // this.socketList = [];
    }
    Object.defineProperty(GameSocket.prototype, "state", {
        set: function (val) {
            this.isAuto = val;
        },
        enumerable: true,
        configurable: true
    });
    GameSocket.prototype.send = function (data) {
        _super.prototype.send.call(this, data);
    };
    GameSocket.prototype.onData = function (data) {
        this.mainPeer.onData(data);
    };
    return GameSocket;
}(SocketConnection));
export { GameSocket };
var ConnListener = /** @class */ (function () {
    function ConnListener(peer) {
        this.mainPeer = peer;
    }
    ConnListener.prototype.onConnected = function (isAuto) {
        this.mainPeer.onConnected(isAuto);
        Logger.getInstance().log("MainWorker[\u5DF2\u8FDE\u63A5]");
    };
    ConnListener.prototype.onDisConnected = function (isAuto) {
        this.mainPeer.onDisConnected(isAuto);
        Logger.getInstance().log("MainWorker[\u5DF2\u65AD\u5F00]");
    };
    ConnListener.prototype.onRefreshConnect = function (isAuto) {
        this.mainPeer.reconnect(isAuto);
        Logger.getInstance().log("MainWorker[\u6B63\u5728\u5237\u65B0\u94FE\u63A5]");
    };
    // reason: SocketConnectionError | undefined
    ConnListener.prototype.onError = function (reason) {
        if (reason) {
            this.mainPeer.onConnectError(reason.message);
            Logger.getInstance().error("MainWorker[\u9519\u8BEF]:" + reason.message);
        }
        else {
            Logger.getInstance().error("MainWorker[\u9519\u8BEF]:" + reason);
        }
    };
    return ConnListener;
}());
export { ConnListener };
// 网络连接器
// 使用webworker启动socket，无webworker时直接启动socket
var Connection = /** @class */ (function () {
    function Connection(peer) {
        // 数据缓存队列
        this.mCache = [];
        /**
         * 客户端向服务端表明的socket session的唯一标识
         */
        this.mUuid = 0;
        this.mPacketHandlers = [];
        this.isConnect = false;
        this.isPause = false;
        this.isCloseing = false;
        this.mPeer = peer;
    }
    Connection.prototype.update = function () {
    };
    Object.defineProperty(Connection.prototype, "pause", {
        get: function () {
            return this.isPause;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Connection.prototype, "connect", {
        get: function () {
            if (!this.mSocket) {
                return false;
            }
            return this.mSocket.isConnect;
        },
        set: function (val) {
            this.isConnect = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Connection.prototype, "socket", {
        get: function () {
            return this.mSocket;
        },
        enumerable: true,
        configurable: true
    });
    Connection.prototype.startConnect = function (addr, keepalive) {
        if (this.isCloseing) {
            this.gateway = { addr: addr, keepalive: keepalive };
            return;
        }
        if (this.isConnect)
            this.closeConnect();
        this.mCachedServerAddress = addr;
        // 存在socket，等待销毁并重新创建
        if (this.mSocket) {
            return;
        }
        this.mSocket = new GameSocket(this.mPeer, new ConnListener(this.mPeer));
        this.mSocket.startConnect(this.mCachedServerAddress);
    };
    Connection.prototype.closeConnect = function () {
        this.isConnect = false;
        this.isCloseing = true;
        this.mCachedServerAddress = undefined;
        if (this.mSocket) {
            this.mSocket.state = false;
            // socket.isConnect判断socket是否关闭===》客户端先关闭socket,则走socket关闭逻辑；服务端关闭socket，则直接closeBack逻辑
            this.mSocket.isConnect ? this.mSocket.stopConnect(this.closeBack()) : this.closeBack();
        }
        this.clearPacketListeners();
    };
    Connection.prototype.closeBack = function () {
        this.isCloseing = false;
        this.mSocket.destroy();
        this.mSocket = null;
        if (this.gateway)
            this.startConnect(this.gateway.addr, this.gateway.keepalive);
    };
    Connection.prototype.setClock = function (clock) {
        this.mClock = clock;
    };
    Connection.prototype.addPacketListener = function (listener) {
        var idx = this.mPacketHandlers.indexOf(listener);
        if (idx !== -1)
            return;
        this.mPacketHandlers.push(listener);
    };
    Connection.prototype.send = function (packet) {
        // if (this.isPause) return;
        packet.header.timestamp = this.mClock ? this.mClock.unixTime : 0;
        packet.header.uuid = this.mUuid || 0;
        this.mSocket.send(packet.Serialization());
        Logger.getInstance().log("MainWorker[\u53D1\u9001] >>> " + packet.toString());
    };
    Connection.prototype.removePacketListener = function (listener) {
        var idx = this.mPacketHandlers.indexOf(listener);
        if (idx !== -1) {
            this.mPacketHandlers.splice(idx, 1);
        }
    };
    Connection.prototype.clearPacketListeners = function () {
        if (!this.mPacketHandlers || this.mPacketHandlers.length < 1) {
            return;
        }
        var len = this.mPacketHandlers.length;
        for (var i = 0; i < len; i++) {
            var listener = this.mPacketHandlers[i];
            if (!listener)
                continue;
            this.removePacketListener(listener);
            i--;
        }
    };
    Connection.prototype.onData = function (data) {
        if (!this.isConnect)
            return;
        var protobuf_packet = PBpacket.Create(data);
        this.mUuid = protobuf_packet.header.uuid;
        Logger.getInstance().log("MainWorker[\u63A5\u6536] <<< " + protobuf_packet.toString() + " ");
        var handlers = this.mPacketHandlers;
        this.mPeer.clearBeat();
        handlers.forEach(function (handler) {
            handler.onPacketArrived(protobuf_packet);
        });
    };
    Connection.prototype.onFocus = function () {
        this.isPause = false;
    };
    Connection.prototype.onBlur = function () {
        this.isPause = true;
    };
    return Connection;
}());
export { Connection };
//# sourceMappingURL=connection.js.map