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
import { ClickEvent, InputText } from "apowophaserui";
import { Font, Logger } from "structure";
import { Tap } from "./tap";
var LabelInput = /** @class */ (function (_super) {
    __extends_1(LabelInput, _super);
    function LabelInput(scene, config) {
        var _this = _super.call(this, scene) || this;
        _this.mAutoBlur = true;
        var labelConfig = {
            fontFamily: Font.DEFULT_FONT
        };
        var clickW = config.width || 100;
        var clickH = config.height || 100;
        _this.mPlaceholder = config.placeholder;
        _this.mLabel = _this.scene.make.text({
            text: _this.mPlaceholder,
            style: Object.assign(labelConfig, config)
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
    LabelInput.prototype.setText = function (val) {
        this.mLabel.setText(this.mPlaceholder ? val ? val : this.mPlaceholder : val);
        if (this.mInputText) {
            this.mInputText.text = val;
        }
        return this;
    };
    LabelInput.prototype.setPlaceholder = function (val) {
        this.mPlaceholder = val || this.mPlaceholder;
        this.mInputConfig.placeholder = this.mPlaceholder;
        this.mLabel.setText(this.mPlaceholder);
        return this;
    };
    LabelInput.prototype.setOrigin = function (x, y) {
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
    LabelInput.prototype.createBackground = function (padding, radius) {
        if (!this.background) {
            this.background = this.scene.make.graphics(undefined, false);
        }
        this.background.clear();
        this.background.fillStyle(0xFFFFFF);
        this.background.fillRoundedRect(-padding + this.width * this.mLabel.originX, -padding + this.height * this.mLabel.originY, this.width + padding * 2, this.height + padding * 2, radius);
        this.addAt(this.background, 0);
    };
    LabelInput.prototype.setSize = function (w, h) {
        _super.prototype.setSize.call(this, w, h);
        this.mLabel.input.hitArea = new Phaser.Geom.Rectangle(-this.width * this.mLabel.originX, -this.height * this.mLabel.originX, this.width, this.height);
        return this;
    };
    LabelInput.prototype.setAutoBlur = function (val) {
        this.mAutoBlur = val;
        return this;
    };
    LabelInput.prototype.setBlur = function () {
        this.onShowLabel();
    };
    LabelInput.prototype.destroy = function () {
        this.mLabel.destroy();
        this.destroyInput();
        _super.prototype.destroy.call(this);
    };
    LabelInput.prototype.createInputText = function () {
        var _this = this;
        if (this.mInputText) {
            return;
        }
        this.mInputText = new InputText(this.scene, Object.assign({}, this.mInputConfig)).setOrigin(this.mOriginX, this.mOriginY);
        this.mInputText.on("textchange", this.onTextChangeHandler, this);
        this.mInputText.on("blur", this.onTextBlurHandler, this);
        this.mInputText.on("focus", this.onTextFocusHandler, this);
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
    LabelInput.prototype.onShowInputHandler = function () {
        this.createInputText();
        this.remove(this.mLabel);
        this.add(this.mInputText);
        if (this.mInputConfig.placeholder !== this.mLabel.text)
            this.mInputText.setText(this.mLabel.text);
        this.mInputText.setFocus();
    };
    LabelInput.prototype.onPointerDownHandler = function () {
    };
    LabelInput.prototype.onShowLabel = function () {
        if (this.mInputText) {
            if (!this.mInputText.text && this.mInputConfig.placeholder) {
                this.mLabel.setText(this.mInputConfig.placeholder);
            }
            else {
                this.mLabel.setText(this.mInputText.text);
            }
            this.destroyInput();
        }
        this.add(this.mLabel);
    };
    LabelInput.prototype.destroyInput = function () {
        if (this.mInputText) {
            this.mInputText.off("textchange", this.onTextChangeHandler, this);
            this.mInputText.off("blur", this.onTextBlurHandler, this);
            this.mInputText.off("focus", this.onTextFocusHandler, this);
            this.mInputText.destroy();
            this.mInputText = undefined;
        }
    };
    LabelInput.prototype.onTextChangeHandler = function (input, event) {
        this.emit("textchange");
    };
    LabelInput.prototype.onTextBlurHandler = function () {
        this.emit("blur");
    };
    LabelInput.prototype.onTextFocusHandler = function (e) {
        this.emit("focus");
    };
    LabelInput.prototype.onTapHandler = function () {
        Logger.getInstance().log("tap ================");
    };
    Object.defineProperty(LabelInput.prototype, "object", {
        get: function () {
            return this.mInputText || this.mLabel;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LabelInput.prototype, "text", {
        get: function () {
            if (this.mInputText) {
                return this.mInputText.text;
            }
            return this.mLabel.text;
        },
        enumerable: true,
        configurable: true
    });
    return LabelInput;
}(Phaser.GameObjects.Container));
export { LabelInput };
//# sourceMappingURL=label.input.js.map