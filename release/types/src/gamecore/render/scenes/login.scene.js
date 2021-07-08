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
import { SceneName } from "structure";
import { BaseLayer, BasicScene } from "baseRender";
import { MainUIScene } from "./main.ui.scene";
// 编辑器用 Phaser.Scene
var LoginScene = /** @class */ (function (_super) {
    __extends_1(LoginScene, _super);
    function LoginScene() {
        return _super.call(this, { key: SceneName.LOGIN_SCENE }) || this;
    }
    LoginScene.prototype.preload = function () {
        //  this.load.atlas(ModuleName.MASK_LOADING_NAME, Url.getUIRes(this.dpr, "mask_loading/mask_loading.png"), Url.getUIRes(this.dpr, "mask_loading/mask_loading.json"));
    };
    LoginScene.prototype.create = function () {
        _super.prototype.create.call(this);
        if (this.render) {
            // const uimanager: UiManager = this.render.uiManager;
            // uimanager.setScene(this);
            // this.render.showMediator(ModuleName.PICA_BOOT_NAME, true);
            this.render.gameLoadedCallBack();
            this.render.hideLoading();
            this.layerManager.addLayer(this, BaseLayer, MainUIScene.LAYER_UI, 1);
            this.layerManager.addLayer(this, BaseLayer, MainUIScene.LAYER_DIALOG, 2);
            // uimanager.showPanel(ModuleName.LOGIN_NAME);
        }
    };
    LoginScene.prototype.init = function (data) {
        _super.prototype.init.call(this, data);
        if (data) {
            this.dpr = data.dpr;
        }
    };
    LoginScene.prototype.stop = function () {
        // if (this.render) {
        //     this.render.showMediator("Login", false);
        // }
        _super.prototype.stop.call(this);
    };
    LoginScene.prototype.sleep = function () {
        // if (this.render) {
        //     this.render.showMediator("Login", false);
        // }
    };
    return LoginScene;
}(BasicScene));
export { LoginScene };
//# sourceMappingURL=login.scene.js.map