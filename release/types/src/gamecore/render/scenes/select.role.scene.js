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
import { BasicScene } from "baseRender";
import { SceneName } from "structure";
var SelectRoleScene = /** @class */ (function (_super) {
    __extends_1(SelectRoleScene, _super);
    function SelectRoleScene() {
        return _super.call(this, { key: SceneName.SELECTROLE_SCENE }) || this;
    }
    SelectRoleScene.prototype.preload = function () { };
    SelectRoleScene.prototype.init = function (data) {
        this.mWorld = data;
    };
    SelectRoleScene.prototype.create = function () {
        _super.prototype.create.call(this);
    };
    Object.defineProperty(SelectRoleScene.prototype, "key", {
        get: function () {
            return this.sys.config.key;
        },
        enumerable: true,
        configurable: true
    });
    return SelectRoleScene;
}(BasicScene));
export { SelectRoleScene };
//# sourceMappingURL=select.role.scene.js.map