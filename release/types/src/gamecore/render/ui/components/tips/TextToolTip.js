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
import { BBCodeText, NineSlicePatch } from "apowophaserui";
import { Font } from "structure";
var TextToolTips = /** @class */ (function (_super) {
    __extends_1(TextToolTips, _super);
    function TextToolTips(scene, key, frame, dpr, zoom) {
        var _this = _super.call(this, scene) || this;
        var tempframe = scene.textures.getFrame(key, frame);
        var tipsWidth = tempframe.width;
        var tipsHeight = tempframe.height;
        _this.dpr = dpr;
        _this.bg = new NineSlicePatch(_this.scene, 0, 0, tipsWidth, tipsHeight, key, frame, {
            left: 20 * dpr,
            top: 20 * dpr,
            right: 20 * dpr,
            bottom: 20 * dpr
        });
        _this.text = new BBCodeText(_this.scene, 0, 0, "蓝矿石", {
            color: "#333333",
            fontSize: 13 * _this.dpr,
            fontFamily: Font.DEFULT_FONT,
            wrap: {
                width: 90 * _this.dpr,
                mode: "string"
            }
        }).setOrigin(0);
        _this.add([_this.bg, _this.text]);
        _this.setSize(tipsWidth + 20 * dpr, tipsHeight + 20 * dpr);
        return _this;
    }
    TextToolTips.prototype.setSize = function (width, height) {
        _super.prototype.setSize.call(this, width, height);
        this.bg.resize(width, height);
        this.bg.setPosition(0, 0);
        var textWidth = width - 16 * this.dpr;
        var textHeight = height - 16 * this.dpr;
        this.text.setSize(textWidth, textHeight);
        this.text.setWrapWidth(textWidth);
        this.text.setPosition(-textWidth * 0.5, -textHeight * 0.5);
        return this;
    };
    TextToolTips.prototype.setText = function (text) {
        this.text.text = text;
        if (this.text.height > this.height) {
            this.setSize(this.width, this.text.height + 16 * this.dpr);
        }
    };
    TextToolTips.prototype.setDelayText = function (text, delay, compl) {
        var _this = this;
        this.visible = true;
        this.setText(text);
        if (this.timeID)
            clearTimeout(this.timeID);
        this.timeID = setTimeout(function () {
            _this.visible = false;
            if (compl)
                compl.run();
        }, delay);
    };
    return TextToolTips;
}(Phaser.GameObjects.Container));
export { TextToolTips };
//# sourceMappingURL=TextToolTip.js.map