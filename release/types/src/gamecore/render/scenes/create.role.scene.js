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
import { Logger, SceneName } from "structure";
var CreateRoleScene = /** @class */ (function (_super) {
    __extends_1(CreateRoleScene, _super);
    function CreateRoleScene() {
        return _super.call(this, { key: SceneName.CREATE_ROLE_SCENE }) || this;
    }
    CreateRoleScene.prototype.init = function (data) {
        _super.prototype.init.call(this, data);
        this.params = data.params;
    };
    CreateRoleScene.prototype.create = function () {
        if (this.render) {
            var uimanager = this.render.uiManager;
            uimanager.setScene(this);
            Logger.getInstance().debug("createrole===scene");
            // uimanager.showPanel(ModuleName.CREATEROLE_NAME, this.params);
            // this.render.hideLoading();
        }
        _super.prototype.create.call(this);
    };
    CreateRoleScene.prototype.stop = function () {
        if (this.render) {
            this.render.showMediator("CreateRoleScene", false);
        }
        _super.prototype.stop.call(this);
    };
    return CreateRoleScene;
}(BasicScene));
export { CreateRoleScene };
//# sourceMappingURL=create.role.scene.js.map