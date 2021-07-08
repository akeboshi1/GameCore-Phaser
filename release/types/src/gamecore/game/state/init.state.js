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
import { Logger } from "structure";
import { BaseState } from "./base.state";
var InitState = /** @class */ (function (_super) {
    __extends_1(InitState, _super);
    function InitState(main, key) {
        return _super.call(this, main, key) || this;
    }
    InitState.prototype.run = function (data) {
        var _this = this;
        _super.prototype.run.call(this, data);
        var config = data;
        // ============
        Logger.getInstance().debug("createGame");
        Logger.getInstance().debug("render link onReady");
        this.mGame.createGame(config).then(function () {
            _this.next();
        });
    };
    InitState.prototype.next = function () {
        this.mGame.login();
    };
    return InitState;
}(BaseState));
export { InitState };
//# sourceMappingURL=init.state.js.map