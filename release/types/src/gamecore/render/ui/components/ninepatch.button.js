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
import { NineSlicePatch } from "apowophaserui";
var NinePatchButton = /** @class */ (function (_super) {
    __extends_1(NinePatchButton, _super);
    function NinePatchButton(scene, x, y, width, height, key, frame, text, config, data) {
        var _this = _super.call(this, scene, x, y) || this;
        _this.mScene = scene;
        _this.mKey = key;
        _this.mFrame = frame ? frame : "__BASE";
        _this.initFrame();
        _this.setSize(width, height);
        _this.mNingBg = new NineSlicePatch(_this.scene, 0, 0, width, height, key, _this.mFrame_nrmal, config);
        _this.add(_this.mNingBg);
        if (data) {
            _this.btnData = data;
        }
        _this.mLabel = _this.scene.make.text(undefined, false)
            .setOrigin(0.5, 0.5)
            .setSize(_this.width, _this.height)
            .setAlign("center")
            .setText(text);
        _this.add(_this.mLabel);
        // this.setSize(this.mNingBg.width, this.mNingBg.height);
        _this.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        _this.on("pointerdown", _this.onPointerDown, _this);
        _this.on("pointerup", _this.onPointerUp, _this);
        return _this;
        // this.on("pointerout", this.changeNormal, this);
        // this.on("pointerover", this.changeOver, this);
    }
    Object.defineProperty(NinePatchButton.prototype, "enable", {
        set: function (value) {
            if (value) {
                this.mNingBg.clearTint();
                this.mLabel.clearTint();
                this.setInteractive();
            }
            else {
                this.mNingBg.setTintFill(0x666666);
                this.mLabel.setTintFill(0x777777);
                this.removeInteractive();
            }
        },
        enumerable: true,
        configurable: true
    });
    NinePatchButton.prototype.getBtnData = function () {
        return this.btnData;
    };
    NinePatchButton.prototype.setText = function (text) {
        this.mLabel.setText(text);
    };
    NinePatchButton.prototype.getText = function () {
        return this.mLabel.text;
    };
    NinePatchButton.prototype.setTextStyle = function (style) {
        this.mLabel.setStyle(style);
    };
    NinePatchButton.prototype.setFontStyle = function (val) {
        this.mLabel.setFontStyle(val);
    };
    NinePatchButton.prototype.setTextOffset = function (x, y) {
        this.mLabel.setPosition(x, y);
    };
    NinePatchButton.prototype.setFrame = function (frame) {
        this.mNingBg.setFrame(String(frame));
        return this;
    };
    NinePatchButton.prototype.destroy = function (fromScene) {
        if (this.mLabel)
            this.mLabel.destroy();
        _super.prototype.destroy.call(this, fromScene);
    };
    NinePatchButton.prototype.setFrameNormal = function (normal, down, over) {
        this.mFrame_nrmal = normal;
        this.mFrame_down = (down ? down : normal);
        this.mFrame_over = (over ? over : normal);
        this.changeNormal();
        return this;
    };
    // public setState(val: string) {
    // }
    NinePatchButton.prototype.changeNormal = function () {
        this.setFrame(this.mFrame_nrmal);
    };
    NinePatchButton.prototype.changeDown = function () {
        // this.scale = 0.9;
        this.setFrame(this.mFrame_down);
    };
    NinePatchButton.prototype.changeOver = function () {
        // this.setTexture()
        this.setFrame(this.mFrame_over);
    };
    NinePatchButton.prototype.isExists = function (frame) {
        var originTexture = this.scene.textures.get(this.mKey);
        if (originTexture && originTexture.has(frame))
            return true;
        return false;
    };
    NinePatchButton.prototype.onPointerDown = function (pointer) {
        this.changeDown();
    };
    NinePatchButton.prototype.onPointerUp = function (pointer) {
        this.changeNormal();
        this.emit("click", pointer, this);
    };
    Object.defineProperty(NinePatchButton.prototype, "label", {
        get: function () {
            return this.mLabel;
        },
        enumerable: true,
        configurable: true
    });
    NinePatchButton.prototype.scaleHandler = function () {
        this.mScene.tweens.add({
            targets: this,
            duration: 50,
            ease: "Linear",
            props: {
                scaleX: { value: .5 },
                scaleY: { value: .5 },
            },
            yoyo: true,
            repeat: 0,
        });
        this.scaleX = this.scaleY = 1;
    };
    NinePatchButton.prototype.initFrame = function () {
        var frame = this.mFrame ? this.mFrame : this.mKey;
        this.mFrame_nrmal = frame + "_normal";
        var down = frame + "_down";
        if (!this.isExists(down)) {
            down = frame + "_normal";
        }
        this.mFrame_down = down;
        var over = frame + "_over";
        if (!this.isExists(over)) {
            over = frame + "_normal";
        }
        this.mFrame_over = over;
    };
    return NinePatchButton;
}(Phaser.GameObjects.Container));
export { NinePatchButton };
//# sourceMappingURL=ninepatch.button.js.map