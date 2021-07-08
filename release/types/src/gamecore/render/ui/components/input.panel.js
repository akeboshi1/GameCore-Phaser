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
var InputPanel = /** @class */ (function (_super) {
    __extends_1(InputPanel, _super);
    function InputPanel(scene, render, text) {
        var _this = _super.call(this) || this;
        _this.render = render;
        _this.scene = scene;
        var width = scene.cameras.main.width;
        var height = scene.cameras.main.height;
        _this.mBackground = scene.add.graphics();
        _this.mBackground.fillStyle(0x0, 0.6);
        _this.mBackground.fillRect(0, 0, width, height).setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        _this.mInput = new InputText(scene, 6 * render.uiRatio, 6 * render.uiRatio, width - 12 * render.uiRatio, 40 * render.uiRatio, {
            fontSize: 20 * render.uiRatio + "px",
            color: "#0",
            text: text,
            backgroundColor: "#FFFFFF",
            borderColor: "#FF9900"
        }).setOrigin(0, 0);
        _this.mInput.node.addEventListener("keypress", function (e) {
            var keycode = e.keyCode || e.which;
            if (keycode === 13) {
                _this.onCloseHandler();
            }
        });
        _this.mInput.x = 6 * render.uiRatio;
        _this.scene.input.on("pointerdown", _this.onFoucesHandler, _this);
        if (_this.render.game.device.os.iOS) {
            _this.mInput.on("click", _this.onFoucesHandler, _this);
        }
        else {
            _this.mInput.on("focus", _this.onFoucesHandler, _this);
        }
        _this.mInput.setFocus();
        return _this;
    }
    InputPanel.prototype.onCloseHandler = function () {
        this.emit("close", this.mInput.text);
        this.mBackground.destroy();
        this.mInput.destroy();
        this.destroy();
        this.scene.input.off("pointerdown", this.onFoucesHandler, this);
        this.scene = undefined;
    };
    InputPanel.prototype.onFoucesHandler = function () {
        this.mInput.node.focus();
    };
    return InputPanel;
}(Phaser.Events.EventEmitter));
export { InputPanel };
//# sourceMappingURL=input.panel.js.map