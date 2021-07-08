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
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_virtual_world, op_client } from "pixelpai_proto";
import { Logger } from "structure";
var CHECK_INTERVAL = 8000; // (ms)
var Clock = /** @class */ (function (_super) {
    __extends_1(Clock, _super);
    function Clock(con, mainPeer, listener) {
        var _this = _super.call(this) || this;
        // clock是否同步完成
        _this.mClockSync = false;
        _this.mDeltaTimeToServer = 0;
        _this.mStartCheckBoo = false;
        _this.mConn = con;
        _this.mConn.addPacketListener(_this);
        _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SYNC_TIME, _this.proof);
        _this.mListener = listener;
        _this.mainPeer = mainPeer;
        con.setClock(_this);
        return _this;
    }
    Object.defineProperty(Clock.prototype, "sysUnixTime", {
        get: function () {
            return new Date().getTime();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Clock.prototype, "unixTime", {
        get: function () {
            return this.sysUnixTime + this.mDeltaTimeToServer;
        },
        enumerable: true,
        configurable: true
    });
    Clock.prototype.startCheckTime = function () {
        if (this.mStartCheckBoo)
            return;
        this.mStartCheckBoo = true;
        this._check();
    };
    Clock.prototype.sync = function (times) {
        if (times === void 0) { times = 1; }
        if (!this.mStartCheckBoo) {
            Logger.getInstance().log("clock no start ====>");
            return;
        }
        if (!this.mConn)
            return;
        if (times < 0) {
            times = 1;
        }
        for (var i = 0; i < times; ++i) {
            var pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SYNC_TIME);
            var ct = pkt.content;
            ct.clientStartTs = this.sysUnixTime;
            this.mainPeer.send(pkt.Serialization());
        }
    };
    Clock.prototype.clearTime = function () {
        this.mStartCheckBoo = false;
        this.mClockSync = false;
        if (this.mIntervalId) {
            clearInterval(this.mIntervalId);
        }
        this.mDeltaTimeToServer = 0;
        this._check();
    };
    Clock.prototype.destroy = function () {
        if (this.mConn) {
            this.mConn.removePacketListener(this);
            this.mConn = undefined;
        }
        if (this.mIntervalId) {
            clearInterval(this.mIntervalId);
        }
    };
    Object.defineProperty(Clock.prototype, "clockSync", {
        get: function () {
            return this.mClockSync;
        },
        enumerable: true,
        configurable: true
    });
    Clock.prototype._check = function () {
        var self = this;
        this.mIntervalId = setInterval(function () {
            self.sync();
        }, CHECK_INTERVAL);
    };
    Clock.prototype.proof = function (packet) {
        var ct = packet.content;
        var local_receive = this.sysUnixTime, local_send = ct.clientStartTs, remote_receive = ct.serverReceiveTs, remote_send = ct.serverSendTs;
        // 参考文档：https://zhuanlan.zhihu.com/p/106069365
        this.mDeltaTimeToServer = Math.floor(((remote_receive - local_send) + (remote_send - local_receive)) / 2);
        if (this.mListener) {
            this.mClockSync = true;
            // Logger.getInstance().debug("clock同步完成");
            this.mListener.onClockReady();
        }
        // Logger.getInstance().debug(`mDeltaTimeToServer: ${this.mDeltaTimeToServer}`);
    };
    return Clock;
}(PacketHandler));
export { Clock };
//# sourceMappingURL=clock.js.map