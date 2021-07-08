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
var BaseState = /** @class */ (function (_super) {
    __extends_1(BaseState, _super);
    function BaseState(main, key) {
        var _this = _super.call(this) || this;
        _this.mMain = main;
        _this.mKey = key;
        return _this;
    }
    Object.defineProperty(BaseState.prototype, "main", {
        get: function () {
            return this.mMain;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseState.prototype, "key", {
        get: function () {
            return this.mKey;
        },
        enumerable: true,
        configurable: true
    });
    BaseState.prototype.run = function (data) {
        this.mConnect = this.mMain.game.connection;
        this.mGame = this.mMain.game;
    };
    BaseState.prototype.update = function (data) {
    };
    BaseState.prototype.next = function (data) {
        this.removePacketListener();
    };
    BaseState.prototype.addPacketListener = function () {
        if (this.mConnect)
            this.mConnect.addPacketListener(this);
    };
    BaseState.prototype.removePacketListener = function () {
        if (this.mConnect)
            this.mConnect.removePacketListener(this);
    };
    return BaseState;
}(PacketHandler));
export { BaseState };
//# sourceMappingURL=base.state.js.map