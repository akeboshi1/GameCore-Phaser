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
import { InputText } from "apowophaserui";
var InputField = /** @class */ (function (_super) {
    __extends_1(InputField, _super);
    function InputField(scene, x, y, width, height, config) {
        var _this = _super.call(this, scene, x, y, width, height, config) || this;
        _this.node.addEventListener("keypress", _this.onKeypressHandler.bind(_this));
        _this.on("focus", _this.onFocusHandler, _this);
        _this.on("blur", _this.onBlurHandler, _this);
        return _this;
    }
    InputField.prototype.destroy = function () {
        if (this.node)
            this.node.removeEventListener("keypress", this.onKeypressHandler.bind(this));
        this.off("focus", this.onFocusHandler, this);
        this.off("blur", this.onBlurHandler, this);
        if (this.scene)
            this.scene.input.off("gameobjectdown", this.onGameobjectDown, this);
        _super.prototype.destroy.call(this);
    };
    InputField.prototype.onKeypressHandler = function (e) {
        var keycode = e.keyCode || e.which;
        if (keycode === 13) {
            this.emit("enter", this.text);
        }
    };
    InputField.prototype.onFocusHandler = function () {
        this.scene.input.on("gameobjectdown", this.onGameobjectDown, this);
    };
    InputField.prototype.onBlurHandler = function () {
        this.scene.input.off("gameobjectdown", this.onGameobjectDown, this);
    };
    InputField.prototype.onGameobjectDown = function () {
        this.setBlur();
    };
    return InputField;
}(InputText));
export { InputField };
//# sourceMappingURL=input.field.js.map