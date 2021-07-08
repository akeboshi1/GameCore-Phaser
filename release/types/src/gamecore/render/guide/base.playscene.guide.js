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
import { Tool } from "utils";
import { BaseGuide } from "./base.guide";
/**
 * 场景点击引导基类
 */
var BasePlaySceneGuide = /** @class */ (function (_super) {
    __extends_1(BasePlaySceneGuide, _super);
    function BasePlaySceneGuide(id, uiManager) {
        var _this = _super.call(this, uiManager.render) || this;
        _this.mElementID = id;
        _this.mPlayScene = _this.render.game.scene.getScene(SceneName.PLAY_SCENE);
        return _this;
    }
    Object.defineProperty(BasePlaySceneGuide.prototype, "data", {
        get: function () {
            return this.mElementID;
        },
        enumerable: true,
        configurable: true
    });
    BasePlaySceneGuide.prototype.show = function (param) {
        _super.prototype.show.call(this, param);
        this.mElement = this.render.displayManager.getDisplay(this.mElementID);
        if (!this.mElement)
            this.end();
        this.step1(this.getGuidePosition());
    };
    BasePlaySceneGuide.prototype.hide = function () {
        this.mPlayScene.input.off("gameobjectup", this.gameObjectUpHandler, this);
        // this.scene.sys.events.off("update", this.updateGuidePos, this);
        if (this.mPointer) {
            this.mPlayScene.motionMgr.onGuideOnPointUpHandler(this.mPointer, this.mElementID);
            this.mPointer = null;
        }
        _super.prototype.hide.call(this);
    };
    BasePlaySceneGuide.prototype.checkInteractive = function (data) {
        if (data === this.mElementID)
            return false;
        return true;
    };
    BasePlaySceneGuide.prototype.step1 = function (pos) {
        var tmpPos = { x: pos.x, y: pos.y };
        this.guideEffect.createGuideEffect(tmpPos, this.mData.guideText[0]);
        this.mPlayScene.input.on("gameobjectup", this.gameObjectUpHandler, this);
    };
    BasePlaySceneGuide.prototype.gameObjectUpHandler = function (pointer, gameobject) {
        var id = gameobject.getData("id");
        // todo 写死护照id
        if (id === this.mElementID) {
            this.mPointer = pointer;
            this.end();
        }
    };
    BasePlaySceneGuide.prototype.updateGuidePos = function () {
        this.guideEffect.createGuideEffect(this.getGuidePosition(), this.mData.guideText[0]);
    };
    BasePlaySceneGuide.prototype.getGuidePosition = function () {
        if (!this.mElement) {
            this.mPlayScene.input.off("gameobjectup", this.gameObjectUpHandler, this);
            this.end();
            return;
        }
        var pos = Tool.getPosByScenes(this.mPlayScene, { x: this.mElement.x, y: this.mElement.y });
        var tmpPos = { x: pos.x, y: pos.y };
        return tmpPos;
    };
    return BasePlaySceneGuide;
}(BaseGuide));
export { BasePlaySceneGuide };
//# sourceMappingURL=base.playscene.guide.js.map