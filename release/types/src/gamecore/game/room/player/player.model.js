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
import { Sprite } from "baseGame";
import { LogicPos } from "structure";
var PlayerModel = /** @class */ (function (_super) {
    __extends_1(PlayerModel, _super);
    function PlayerModel(data) {
        var _this = _super.call(this, data) || this;
        _this.pos = new LogicPos(data.x, data.y, data.z);
        _this.alpha = 1;
        _this.package = data.package;
        _this.sceneId = data.sceneId;
        _this.uuid = data.uuid;
        _this.platformId = data.platformId;
        _this.setAnimationName("idle");
        return _this;
    }
    return PlayerModel;
}(Sprite));
export { PlayerModel };
//# sourceMappingURL=player.model.js.map