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
var ToggleButton = /** @class */ (function (_super) {
    __extends_1(ToggleButton, _super);
    function ToggleButton(scene, width, height, key, frame, down, dpr, text) {
        var _this = _super.call(this, scene, dpr) || this;
        _this.normalColor = "#FFFFFF";
        _this.changeColor = "#0099cc";
        _this.mIsOn = false;
        _this.mBackground = _this.scene.make.image({ key: key, frame: frame });
        _this.mText = _this.scene.make.text({
            text: text,
            style: {
                fontSize: 15 * dpr + "px",
                fontFamily: Font.DEFULT_FONT,
                color: "#ffffff"
            }
        }, false).setOrigin(0.5, 0.5);
        _this.add([_this.mBackground, _this.mText]);
        _this.mNormal = frame;
        _this.mDown = down;
        _this.width = width > _this.mBackground.width ? width : _this.mBackground.width;
        _this.height = height > _this.mBackground.height ? height : _this.mBackground.height;
        _this.enable = true;
        return _this;
    }
    ToggleButton.prototype.setText = function (val) {
        this.mText.text = val;
    };
    ToggleButton.prototype.setFontSize = function (size) {
        this.mText.setFontSize(size);
    };
    ToggleButton.prototype.setFontStyle = function (val) {
        this.mText.setFontStyle(val);
    };
    ToggleButton.prototype.setStyle = function (style) {
        this.mText.setStyle(style);
    };
    ToggleButton.prototype.setNormalColor = function (color) {
        this.normalColor = color;
        this.isOn = this.mIsOn;
    };
    ToggleButton.prototype.setChangeColor = function (color) {
        this.changeColor = color;
        this.isOn = this.mIsOn;
    };
    ToggleButton.prototype.setNormalFrame = function (normal, down) {
        if (normal)
            this.mNormal = normal;
        if (down)
            this.mDown = down;
        this.isOn = this.mIsOn;
    };
    Object.defineProperty(ToggleButton.prototype, "isOn", {
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
    ToggleButton.prototype.changeDown = function () {
        this.mText.setFill(this.changeColor);
        this.mBackground.setFrame(this.mDown);
    };
    ToggleButton.prototype.changeNormal = function () {
        this.mText.setFill(this.normalColor);
        this.mBackground.setFrame(this.mNormal);
    };
    Object.defineProperty(ToggleButton.prototype, "text", {
        get: function () {
            return this.mText;
        },
        enumerable: true,
        configurable: true
    });
    ToggleButton.prototype.EventStateChange = function (state) {
        switch (state) {
            case ClickEvent.Up:
                this.changeNormal();
                break;
            case ClickEvent.Down:
                this.changeDown();
                break;
            case ClickEvent.Tap:
                this.isOn = true;
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
    return ToggleButton;
}(ButtonEventDispatcher));
export { ToggleButton };
//# sourceMappingURL=toggle.button.js.map