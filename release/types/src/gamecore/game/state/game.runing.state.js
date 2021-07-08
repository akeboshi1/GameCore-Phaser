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
import { BaseState } from "./base.state";
var GameRunningState = /** @class */ (function (_super) {
    __extends_1(GameRunningState, _super);
    function GameRunningState(main, key) {
        return _super.call(this, main, key) || this;
    }
    GameRunningState.prototype.next = function (data) {
    };
    return GameRunningState;
}(BaseState));
export { GameRunningState };
//# sourceMappingURL=game.runing.state.js.map