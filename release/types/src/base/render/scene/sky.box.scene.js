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
import { PlayCamera } from "../cameras";
import { BasicScene } from "./basic.scene";
var SkyBoxScene = /** @class */ (function (_super) {
    __extends_1(SkyBoxScene, _super);
    function SkyBoxScene() {
        return _super.call(this, {}) || this;
    }
    SkyBoxScene.prototype.init = function (data) {
        _super.prototype.init.call(this, data);
        if (data) {
            this.skyBoxManager = data;
        }
    };
    SkyBoxScene.prototype.preload = function () {
    };
    SkyBoxScene.prototype.create = function () {
        // super.create();
        var oldCamera = this.cameras.main;
        this.cameras.addExisting(new PlayCamera(0, 0, this.sys.scale.width, this.sys.scale.height, this.skyBoxManager.scaleRatio), true);
        this.cameras.remove(oldCamera);
        // this.scene.sendToBack();
        this.skyBoxManager.startPlay(this);
    };
    SkyBoxScene.prototype.update = function (time, delta) {
        this.skyBoxManager.check(time, delta);
    };
    return SkyBoxScene;
}(BasicScene));
export { SkyBoxScene };
//# sourceMappingURL=sky.box.scene.js.map