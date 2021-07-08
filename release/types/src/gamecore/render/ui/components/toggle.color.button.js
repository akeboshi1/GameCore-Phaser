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
import { ClickEvent } from "apowophaserui";
import { Font } from "structure";
import { ButtonEventDispatcher } from "./button.event.dispatch";
var ToggleColorButton = /** @class */ (function (_super) {
    __extends_1(ToggleColorButton, _super);
    function ToggleColorButton(scene, width, height, dpr, text, style) {
        var _this = _super.call(this, scene, dpr) || this;
        _this.normalColor = "#FFFFFF";
        _this.changeColor = "#0099cc";
        _this.mIsOn = false;
        _this.setSize(width, height);
        style = style || {
            fontSize: 15 * dpr + "px",
            fontFamily: Font.DEFULT_FONT,
            color: "#ffffff"
        };
        _this.mText = _this.scene.make.text({
            text: text,
            style: style
        }, false).setOrigin(0.5, 0.5);
        _this.add(_this.mText);
        _this.enable = true;
        return _this;
    }
    ToggleColorButton.prototype.setText = function (val) {
        this.mText.text = val;
    };
    ToggleColorButton.prototype.setFontSize = function (size) {
        this.mText.setFontSize(size);
    };
    ToggleColorButton.prototype.setFontStyle = function (val) {
        this.mText.setFontStyle(val);
    };
    ToggleColorButton.prototype.setStyle = function (style) {
        this.mText.setStyle(style);
    };
    ToggleColorButton.prototype.setNormalColor = function (color) {
        this.normalColor = color;
    };
    ToggleColorButton.prototype.setChangeColor = function (color) {
        this.changeColor = color;
    };
    Object.defineProperty(ToggleColorButton.prototype, "isOn", {
        get: function () {
            return this.mIsOn;
        },
        set: function (value) {
            this.mIsOn = value;
            if (this.mIsOn)
                this.changeDown();
            else
                this.changeNormal();
        },
        enumerable: true,
        configurable: true
    });
    ToggleColorButton.prototype.changeDown = function () {
        this.mText.setFill(this.changeColor);
    };
    ToggleColorButton.prototype.changeNormal = function () {
        this.mText.setFill(this.normalColor);
    };
    Object.defineProperty(ToggleColorButton.prototype, "text", {
        get: function () {
            return this.mText;
        },
        enumerable: true,
        configurable: true
    });
    ToggleColorButton.prototype.EventStateChange = function (state) {
        switch (state) {
            case ClickEvent.Up:
                this.changeNormal();
                break;
            case ClickEvent.Down:
                this.changeDown();
                break;
            case ClickEvent.Tap:
                this.isOn = true;
                this.changeDown();
                break;
            case ClickEvent.Out:
                if (this.isOn) {
                    this.changeDown();
                }
                else {
                    this.changeNormal();
                }
                break;
        }
    };
    return ToggleColorButton;
}(ButtonEventDispatcher));
export { ToggleColorButton };
//# sourceMappingURL=toggle.color.button.js.map