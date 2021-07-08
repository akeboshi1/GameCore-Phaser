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
import { Font, Logger } from "structure";
import { InputField } from "./input.field";
import { Tap } from "./tap";
var InputLabel = /** @class */ (function (_super) {
    __extends_1(InputLabel, _super);
    function InputLabel(scene, config) {
        var _this = _super.call(this, scene) || this;
        _this.mAutoBlur = true;
        var labelConfig = config.label;
        if (!labelConfig) {
            labelConfig = { fontFamily: Font.DEFULT_FONT };
            Object.assign(labelConfig, config);
        }
        var clickW = config.width || 100;
        var clickH = config.height || 100;
        _this.mPlaceholder = config.placeholder;
        _this.mLabel = _this.scene.make.text({
            text: _this.mPlaceholder,
            style: labelConfig
        }, false).setInteractive(new Phaser.Geom.Rectangle(-clickW * 0.5, -clickH * 0.5, clickW, clickH), Phaser.Geom.Rectangle.Contains);
        _this.mOriginX = _this.mLabel.originX;
        _this.mOriginY = _this.mLabel.originY;
        var tap = new Tap(_this.mLabel);
        _this.mLabel.on(ClickEvent.Tap, _this.onShowInputHandler, _this);
        _this.add(_this.mLabel);
        _this.setSize(clickW, clickH);
        _this.mInputConfig = config;
        return _this;
    }
    InputLabel.prototype.setText = function (val) {
        this.mLabel.setText(this.mPlaceholder ? val ? val : this.mPlaceholder : val);
        if (this.mInputText) {
            this.mInputText.text = val;
        }
        return this;
    };
    InputLabel.prototype.setPlaceholder = function (val) {
        this.mPlaceholder = val || this.mPlaceholder;
        this.mInputConfig.placeholder = this.mPlaceholder;
        this.mLabel.setText(this.mPlaceholder);
        return this;
    };
    InputLabel.prototype.setOrigin = function (x, y) {
        if (y === undefined)
            y = x;
        this.mLabel.setOrigin(x, y);
        this.mOriginX = x;
        this.mOriginY = y;
        if (this.mInputText)
            this.mInputText.setOrigin(x, y);
        this.mLabel.input.hitArea = new Phaser.Geom.Rectangle(-this.width * x, -this.height * y, this.width, this.height);
        return this;
    };
    InputLabel.prototype.createBackground = function (padding, radius) {
        if (!this.background) {
            this.background = this.scene.make.graphics(undefined, false);
        }
        this.background.clear();
        this.background.fillStyle(0xFFFFFF);
        this.background.fillRoundedRect(-padding + this.width * this.mLabel.originX, -padding + this.height * this.mLabel.originY, this.width + padding * 2, this.height + padding * 2, radius);
        this.addAt(this.background, 0);
    };
    InputLabel.prototype.setSize = function (w, h) {
        _super.prototype.setSize.call(this, w, h);
        this.mLabel.input.hitArea = new Phaser.Geom.Rectangle(-this.width * this.mLabel.originX, -this.height * this.mLabel.originX, this.width, this.height);
        return this;
    };
    InputLabel.prototype.setAutoBlur = function (val) {
        this.mAutoBlur = val;
        return this;
    };
    InputLabel.prototype.setBlur = function () {
        this.onShowLabel();
    };
    InputLabel.prototype.destroy = function () {
        this.mLabel.destroy();
        this.destroyInput();
        _super.prototype.destroy.call(this);
    };
    InputLabel.prototype.createInputText = function () {
        var _this = this;
        if (this.mInputText) {
            return;
        }
        var obj = {};
        Object.assign(obj, this.mInputConfig);
        obj.placeholder = "";
        this.mInputText = new InputField(this.scene, obj).setOrigin(this.mOriginX, this.mOriginY);
        this.mInputText.on("textchange", this.onTextChangeHandler, this);
        this.mInputText.on("blur", this.onTextBlurHandler, this);
        this.mInputText.on("focus", this.onTextFocusHandler, this);
        this.add(this.mInputText);
        this.mInputText.x = this.mLabel.x;
        this.mInputText.y = this.mLabel.y;
        this.mInputText.node.addEventListener("keypress", function (e) {
            var keycode = e.keyCode || e.which;
            if (keycode === 13) {
                _this.emit("enter", _this.mInputText.text);
                if (_this.mAutoBlur)
                    _this.onShowLabel();
            }
        });
    };
    InputLabel.prototype.onShowInputHandler = function () {
        this.createInputText();
        this.mLabel.visible = false;
        if (this.mInputConfig.placeholder !== this.mLabel.text)
            this.mInputText.setText(this.mLabel.text);
        this.mInputText.setFocus();
    };
    InputLabel.prototype.onPointerDownHandler = function () {
    };
    InputLabel.prototype.onShowLabel = function () {
        if (this.mInputText) {
            if (!this.mInputText.text && this.mInputConfig.placeholder) {
                this.mLabel.setText(this.mInputConfig.placeholder);
            }
            else {
                this.mLabel.setText(this.mInputText.text);
            }
            this.destroyInput();
        }
        this.mLabel.visible = true;
    };
    InputLabel.prototype.destroyInput = function () {
        if (this.mInputText) {
            this.mInputText.off("textchange", this.onTextChangeHandler, this);
            this.mInputText.off("blur", this.onTextBlurHandler, this);
            this.mInputText.off("focus", this.onTextFocusHandler, this);
            this.mInputText.destroy();
            this.mInputText = undefined;
        }
    };
    InputLabel.prototype.onTextChangeHandler = function (input, event) {
        this.emit("textchange");
    };
    InputLabel.prototype.onTextBlurHandler = function () {
        this.emit("blur");
        this.onShowLabel();
    };
    InputLabel.prototype.onTextFocusHandler = function (e) {
        this.emit("focus");
    };
    InputLabel.prototype.onTapHandler = function () {
        Logger.getInstance().log("tap ================");
    };
    Object.defineProperty(InputLabel.prototype, "object", {
        get: function () {
            return this.mInputText || this.mLabel;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InputLabel.prototype, "text", {
        get: function () {
            if (this.mInputText) {
                return this.mInputText.text;
            }
            return this.mLabel.text;
        },
        enumerable: true,
        configurable: true
    });
    return InputLabel;
}(Phaser.GameObjects.Container));
export { InputLabel };
//# sourceMappingURL=input.label.js.map