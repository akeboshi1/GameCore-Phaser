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
import { Size, SceneName } from "structure";
var GamePauseScene = /** @class */ (function (_super) {
    __extends_1(GamePauseScene, _super);
    function GamePauseScene() {
        return _super.call(this, { key: SceneName.GAMEPAUSE_SCENE }) || this;
    }
    GamePauseScene.prototype.preload = function () {
        // this.load.image("gamepause.png", Url.getRes("gamepause.png"));
    };
    GamePauseScene.prototype.create = function () {
        _super.prototype.create.call(this);
        var width = this.scale.gameSize.width;
        var height = this.scale.gameSize.height;
        this.bg = this.add.graphics();
        this.bg.fillStyle(0, .8);
        this.bg.fillRect(0, 0, width, height);
        // this.pauseImg = this.add.image(width >> 1, height >> 1, "gamepause.png");
        this.tipTF = this.add.text(width - 240 >> 1, height - 50, "点击任意位置开始游戏", { font: "30px Tahoma" });
        this.scale.on("resize", this.checkSize, this);
        this.checkSize(new Size(width, height));
        this.input.on("pointerdown", this.downHandler, this);
    };
    GamePauseScene.prototype.awake = function () {
        this.scale.on("resize", this.checkSize, this);
        this.input.on("pointerdown", this.downHandler, this);
        this.scene.wake();
    };
    GamePauseScene.prototype.sleep = function () {
        this.scale.off("resize", this.checkSize, this);
        this.input.off("pointerdown", this.downHandler, this);
        this.scene.sleep();
    };
    GamePauseScene.prototype.getKey = function () {
        return this.sys.config.key;
    };
    GamePauseScene.prototype.downHandler = function () {
        this.render.onFocus();
    };
    GamePauseScene.prototype.checkSize = function (size) {
        var width = size.width;
        var height = size.height;
        this.bg.clear();
        this.bg.fillStyle(0, .8);
        this.bg.fillRect(0, 0, width, height);
        // this.pauseImg.scaleX = this.pauseImg.scaleY = this.render.uiScale * .7;
        // this.pauseImg.x = width >> 1;
        // this.pauseImg.y = height >> 1;
        this.tipTF.scaleX = this.tipTF.scaleY = this.render.uiScale;
        this.tipTF.x = width - 280 * this.render.uiScale >> 1;
        this.tipTF.y = height - 50 * this.render.uiScale;
    };
    return GamePauseScene;
}(BasicScene));
export { GamePauseScene };
//# sourceMappingURL=game.pause.scene.js.map