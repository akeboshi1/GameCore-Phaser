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
import { Font } from "structure";
var TextButton = /** @class */ (function (_super) {
    __extends_1(TextButton, _super);
    function TextButton(scene, dpr, scale, text, x, y) {
        if (scale === void 0) { scale = 1; }
        var _this = _super.call(this, scene, x, y) || this;
        _this.normalColor = "#FFFFFF";
        _this.changeColor = "#0099cc";
        _this.mText = _this.scene.make.text({
            text: text,
            style: {
                fontSize: 15 * dpr + "px",
                fontFamily: Font.DEFULT_FONT
            }
        }, false).setOrigin(0.5, 0.5);
        _this.add(_this.mText);
        return _this;
        // this.on("pointerup", this.onPointerUpHandler, this);
    }
    TextButton.prototype.setText = function (val) {
        this.mText.text = val;
    };
    TextButton.prototype.setFontSize = function (size) {
        this.mText.setFontSize(size);
    };
    TextButton.prototype.setFontStyle = function (val) {
        this.mText.setFontStyle(val);
    };
    TextButton.prototype.setStyle = function (style) {
        this.mText.setStyle(style);
    };
    TextButton.prototype.setNormalColor = function (color) {
        this.normalColor = color;
    };
    TextButton.prototype.setChangeColor = function (color) {
        this.changeColor = color;
    };
    TextButton.prototype.changeDown = function () {
        this.mText.setFill(this.changeColor);
    };
    TextButton.prototype.changeNormal = function () {
        this.mText.setFill(this.normalColor);
    };
    TextButton.prototype.onPointerUpHandler = function (pointer) {
        this.emit("click", pointer, this);
    };
    Object.defineProperty(TextButton.prototype, "text", {
        get: function () {
            return this.mText;
        },
        enumerable: true,
        configurable: true
    });
    return TextButton;
}(Phaser.GameObjects.Container));
export { TextButton };
//# sourceMappingURL=TextButton.js.map