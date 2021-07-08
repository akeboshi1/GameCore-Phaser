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
import { PacketHandler } from "net-socket-packet";
var BaseDataPacketHandler = /** @class */ (function (_super) {
    __extends_1(BaseDataPacketHandler, _super);
    function BaseDataPacketHandler(game, event) {
        var _this = _super.call(this) || this;
        _this.game = game;
        _this.mEvent = event;
        return _this;
    }
    BaseDataPacketHandler.prototype.addPackListener = function () {
        if (this.connection) {
            this.connection.addPacketListener(this);
        }
    };
    BaseDataPacketHandler.prototype.removePackListener = function () {
        if (this.connection) {
            this.connection.removePacketListener(this);
        }
    };
    BaseDataPacketHandler.prototype.clear = function () {
        this.removePackListener();
        this.mEvent.offAllCaller(this);
    };
    BaseDataPacketHandler.prototype.destroy = function () {
        this.clear();
        this.game = undefined;
        this.mEvent = undefined;
    };
    BaseDataPacketHandler.prototype.on = function (event, fn, context) {
        this.mEvent.on(event, context, fn);
    };
    BaseDataPacketHandler.prototype.off = function (event, fn, context) {
        this.mEvent.off(event, context, fn);
    };
    BaseDataPacketHandler.prototype.emit = function (event, data) {
        this.mEvent.emit(event, data);
    };
    Object.defineProperty(BaseDataPacketHandler.prototype, "connection", {
        get: function () {
            if (this.game) {
                return this.game.connection;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseDataPacketHandler.prototype, "Event", {
        get: function () {
            return this.mEvent;
        },
        enumerable: true,
        configurable: true
    });
    return BaseDataPacketHandler;
}(PacketHandler));
export { BaseDataPacketHandler };
//# sourceMappingURL=base.data.packet.handler.js.map