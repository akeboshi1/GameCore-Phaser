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
import { PropItem } from "./prop.item";
var MaterialItem = /** @class */ (function (_super) {
    __extends_1(MaterialItem, _super);
    function MaterialItem(scene, render, key, bgframe, selectframe, dpr, style) {
        var _this = _super.call(this, scene, render, key, bgframe, dpr, style) || this;
        _this.mselect = false;
        _this.selectframe = selectframe;
        return _this;
    }
    MaterialItem.prototype.setItemData = function (data, needvalue) {
        if (needvalue === void 0) { needvalue = true; }
        _super.prototype.setItemData.call(this, data);
        this.itemCount.text = needvalue ? this.getCountText(data.count, data.neededCount) : data.count;
    };
    Object.defineProperty(MaterialItem.prototype, "select", {
        get: function () {
            return this.mselect;
        },
        set: function (value) {
            this.bg.setFrame(value ? this.selectframe : this.bgframe);
            this.mselect = value;
        },
        enumerable: true,
        configurable: true
    });
    MaterialItem.prototype.getCountText = function (count, needcount) {
        var color = (count >= needcount ? "#000000" : "#ff0000");
        var text = "[stroke=" + color + "][color=" + color + "]" + count + "[/color][/stroke]/" + needcount;
        return text;
    };
    return MaterialItem;
}(PropItem));
export { MaterialItem };
//# sourceMappingURL=material.item.js.map