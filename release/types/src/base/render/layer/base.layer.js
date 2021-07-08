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
var BaseLayer = /** @class */ (function (_super) {
    __extends_1(BaseLayer, _super);
    function BaseLayer(scene, name, depth) {
        var _this = _super.call(this, scene) || this;
        _this.name = name;
        _this.setDepth(depth);
        return _this;
    }
    BaseLayer.prototype.destroy = function () {
        var _this = this;
        var list = this.list;
        list.forEach(function (gameobject) {
            _this.remove(gameobject, true);
        });
        _super.prototype.destroy.call(this);
    };
    BaseLayer.prototype.sortLayer = function () {
    };
    return BaseLayer;
}(Phaser.GameObjects.Container));
export { BaseLayer };
//# sourceMappingURL=base.layer.js.map