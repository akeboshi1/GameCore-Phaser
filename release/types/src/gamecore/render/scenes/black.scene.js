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
import { Font, i18n, Logger, SceneName } from "structure";
var BlackScene = /** @class */ (function (_super) {
    __extends_1(BlackScene, _super);
    function BlackScene() {
        return _super.call(this, { key: SceneName.BLACK_SCENE }) || this;
    }
    BlackScene.prototype.preload = function () {
        this.load.script("webfont", this.render.url.getRes("scripts/webfont/1.6.26/webfont.js"));
    };
    BlackScene.prototype.create = function () {
        _super.prototype.create.call(this);
        try {
            WebFont.load({
                custom: {
                    // families: ["Source Han Sans", "tt0173m_", "tt0503m_"]
                    families: ["Source Han Sans", "tt0173m_", "tt0503m_", "t04B25"]
                },
            });
        }
        catch (error) {
            Logger.getInstance().warn("webfont failed to load");
        }
        var width = this.scale.gameSize.width;
        var height = this.scale.gameSize.height;
        var dpr = this.render.uiRatio;
        var bg = this.add.graphics(undefined);
        bg.fillStyle(0);
        bg.fillRect(0, 0, width, height);
        var tipTxt = this.add.text(width / 2, height / 2, i18n.t("blackScene.tips"), {
            fontSize: 12 * dpr + "px",
            fontFamily: Font.DEFULT_FONT
        }).setOrigin(0.5);
    };
    BlackScene.prototype.awake = function () {
        this.scene.wake();
    };
    BlackScene.prototype.sleep = function () {
        this.scene.sleep();
    };
    return BlackScene;
}(BasicScene));
export { BlackScene };
//# sourceMappingURL=black.scene.js.map