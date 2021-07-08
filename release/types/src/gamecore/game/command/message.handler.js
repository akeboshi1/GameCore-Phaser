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
var MessageHandler = /** @class */ (function (_super) {
    __extends_1(MessageHandler, _super);
    function MessageHandler(game) {
        var _this = _super.call(this) || this;
        _this.game = game;
        _this.addPackListener();
        return _this;
    }
    MessageHandler.prototype.clear = function () {
        this.removePackListener();
    };
    MessageHandler.prototype.destroy = function () {
        this.clear();
        this.game = undefined;
    };
    MessageHandler.prototype.emit = function (event, data) {
        this.emitter.emit(event, data);
    };
    MessageHandler.prototype.addPackListener = function () {
        if (this.connection) {
            this.connection.addPacketListener(this);
            this.onAddListener();
        }
    };
    MessageHandler.prototype.removePackListener = function () {
        if (this.connection) {
            this.connection.removePacketListener(this);
            this.onRemoveListener();
        }
    };
    MessageHandler.prototype.onAddListener = function () {
    };
    MessageHandler.prototype.onRemoveListener = function () {
    };
    Object.defineProperty(MessageHandler.prototype, "connection", {
        get: function () {
            if (this.game) {
                return this.game.connection;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MessageHandler.prototype, "emitter", {
        get: function () {
            return this.game.emitter;
        },
        enumerable: true,
        configurable: true
    });
    return MessageHandler;
}(PacketHandler));
export { MessageHandler };
//# sourceMappingURL=message.handler.js.map