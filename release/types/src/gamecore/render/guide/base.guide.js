import { SceneName } from "structure";
import { GuideEffect } from "./guide.effect";
var BaseGuide = /** @class */ (function () {
    function BaseGuide(render) {
        this.render = render;
        this.mIsShow = false;
        this.scene = render.sceneManager.getSceneByName(SceneName.MAINUI_SCENE);
        this.uiManager = render.uiManager;
    }
    Object.defineProperty(BaseGuide.prototype, "data", {
        get: function () {
            return this.mData;
        },
        enumerable: true,
        configurable: true
    });
    BaseGuide.prototype.show = function (data) {
        this.mIsShow = true;
        this.mData = data;
        this.id = data.id;
        this.guideID = data.guideID;
        if (!this.guideEffect)
            this.guideEffect = new GuideEffect(this.scene, this.render.uiRatio, this.render.url);
        this.render.guideManager.startGuide(this);
    };
    BaseGuide.prototype.end = function () {
        this.hide();
    };
    BaseGuide.prototype.hide = function () {
        this.mIsShow = false;
        this.render.guideManager.stopGuide();
        if (this.guideEffect) {
            this.guideEffect.destroy();
            this.guideEffect = null;
        }
        this.render.uiManager.closePanel(this.id);
    };
    /**
     * 检查是否阻挡交互
     */
    BaseGuide.prototype.checkInteractive = function (data) {
        return true;
    };
    BaseGuide.prototype.destroy = function () {
        this.hide();
    };
    BaseGuide.prototype.resize = function () {
    };
    BaseGuide.prototype.isShow = function () {
        return this.mIsShow;
    };
    BaseGuide.prototype.addExportListener = function (f) {
    };
    return BaseGuide;
}());
export { BaseGuide };
//# sourceMappingURL=base.guide.js.map