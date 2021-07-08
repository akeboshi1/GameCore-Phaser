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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PacketHandler } from "net-socket-packet";
import { Export } from "webworker-rpc";
var BasicModel = /** @class */ (function (_super) {
    __extends_1(BasicModel, _super);
    function BasicModel(game) {
        var _this = _super.call(this) || this;
        _this.game = game;
        _this.event = game.dataControlManager.emitter;
        return _this;
    }
    Object.defineProperty(BasicModel.prototype, "connection", {
        get: function () {
            if (this.game) {
                // @ts-ignore
                return this.game.connection;
            }
        },
        enumerable: true,
        configurable: true
    });
    BasicModel.prototype.register = function () {
    };
    BasicModel.prototype.unregister = function () {
    };
    BasicModel.prototype.destroy = function () {
    };
    __decorate([
        Export()
    ], BasicModel.prototype, "connection", null);
    __decorate([
        Export()
    ], BasicModel.prototype, "register", null);
    __decorate([
        Export()
    ], BasicModel.prototype, "unregister", null);
    __decorate([
        Export()
    ], BasicModel.prototype, "destroy", null);
    return BasicModel;
}(PacketHandler));
export { BasicModel };
//# sourceMappingURL=basic.model.js.map