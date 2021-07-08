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
import { StringUtils } from "utils";
import { LayerManager } from "../layer";
var BasicScene = /** @class */ (function (_super) {
    __extends_1(BasicScene, _super);
    function BasicScene(config) {
        var _this = _super.call(this, config) || this;
        _this.initialize = false;
        _this.hasChangeScene = false;
        _this.hasDestroy = false;
        _this.layerManager = new LayerManager();
        return _this;
    }
    BasicScene.prototype.init = function (data) {
        if (data) {
            this.render = data.render;
        }
    };
    BasicScene.prototype.preload = function () {
        var str = StringUtils.format("正在加载资源 {0}", ["0%"]);
        if (this.render)
            this.render.showLoading({ "text": str });
    };
    BasicScene.prototype.setScale = function (zoom) {
        if (this.layerManager)
            this.layerManager.setScale(zoom);
    };
    BasicScene.prototype.updateProgress = function (data) {
    };
    BasicScene.prototype.loadProgress = function (data) {
    };
    BasicScene.prototype.create = function () {
        this.initialize = true;
        this.render.emitter.emit("sceneCreated");
        this.events.on("shutdown", this.destroy, this);
    };
    BasicScene.prototype.destroy = function () {
        this.events.off("shutdown", this.destroy, this);
        this.hasDestroy = true;
        this.initialize = false;
        this.hasChangeScene = false;
    };
    BasicScene.prototype.sceneInitialize = function () {
        return this.initialize;
    };
    BasicScene.prototype.sceneDestroy = function () {
        return this.hasDestroy;
    };
    Object.defineProperty(BasicScene.prototype, "sceneChange", {
        get: function () {
            return this.hasChangeScene;
        },
        set: function (boo) {
            this.hasChangeScene = boo;
        },
        enumerable: true,
        configurable: true
    });
    BasicScene.prototype.setViewPort = function (x, y, width, height) {
        this.cameras.main.setViewport(x, y, width, height);
    };
    BasicScene.prototype.wake = function (data) {
        this.scene.wake(undefined, data);
    };
    BasicScene.prototype.sleep = function () {
        this.scene.sleep();
    };
    BasicScene.prototype.stop = function () {
        this.scene.stop();
    };
    return BasicScene;
}(Phaser.Scene));
export { BasicScene };
//# sourceMappingURL=basic.scene.js.map