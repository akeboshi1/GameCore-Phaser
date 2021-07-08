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
import { BBCodeText } from "apowophaserui";
import { SoundButton } from "./soundButton";
import { Font } from "structure";
import { DynamicImage } from "baseRender";
var PropItem = /** @class */ (function (_super) {
    __extends_1(PropItem, _super);
    function PropItem(scene, render, key, bgframe, dpr, style) {
        var _this = _super.call(this, scene, 0, 0) || this;
        _this.render = render;
        _this.dpr = dpr;
        _this.key = key;
        _this.bgframe = bgframe;
        _this.bg = _this.scene.make.image({ key: key, frame: bgframe });
        _this.itemIcon = new DynamicImage(scene, 0, 0);
        _this.itemIcon.setTexture(key, bgframe);
        style = style || { color: "#000000", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT };
        _this.itemCount = new BBCodeText(_this.scene, 0, 15 * dpr, "", style).setOrigin(0.5);
        _this.add([_this.bg, _this.itemIcon, _this.itemCount]);
        _this.setSize(_this.bg.width, _this.bg.height);
        _this.itemCount.y = _this.height * 0.5 + 8 * dpr;
        return _this;
    }
    PropItem.prototype.setHandler = function (handler) {
        this.send = handler;
    };
    PropItem.prototype.setItemData = function (data) {
        this.itemData = data;
        this.itemCount.text = data.count + "";
        var url = this.render.url.getOsdRes(data.texturePath);
        var zoom = this.getWorldTransformMatrix().scaleX;
        this.itemIcon.scale = this.dpr / zoom;
        this.itemIcon.load(url);
    };
    PropItem.prototype.setTextPosition = function (x, y) {
        this.itemCount.x = x;
        this.itemCount.y = y;
    };
    return PropItem;
}(SoundButton));
export { PropItem };
//# sourceMappingURL=prop.item.js.map