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
import { Pos } from "structure";
/**
 * 切换状态按钮(点击后状态改变的按钮，需要多帧资源)
 */
var IconSelectBtn = /** @class */ (function (_super) {
    __extends_1(IconSelectBtn, _super);
    function IconSelectBtn(scene, render, bgResKey, bgTexture, scale) {
        if (scale === void 0) { scale = 28 / 43; }
        var _this = _super.call(this, scene) || this;
        _this.mScene = scene;
        _this.mRender = render;
        _this.mBtnBg = scene.make.image(undefined, false);
        _this.mBgTexture = bgTexture;
        _this.mBgResKey = bgResKey;
        _this.mBtnBg.setTexture(bgResKey, bgTexture[0]);
        _this.mBtnBg.scaleX = _this.mBtnBg.scaleY = scale;
        _this.addAt(_this.mBtnBg, 0);
        _this.setSize(_this.mBtnBg.width, _this.mBtnBg.height);
        _this.setInteractive();
        _this.on("pointerup", _this.upHandler, _this);
        _this.on("pointerdown", _this.downHandler, _this);
        _this.on("pointerover", _this.overHandler, _this);
        _this.on("pointerout", _this.outHandler, _this);
        return _this;
    }
    IconSelectBtn.prototype.setPos = function (x, y) {
        if (!this.mBasePos) {
            this.mBasePos = new Pos();
        }
        this.mBasePos.x = x;
        this.mBasePos.y = y;
    };
    /**
     * 获取按钮的初始化时的位置，用于tween时，按钮来回切换位置用
     */
    IconSelectBtn.prototype.getPos = function () {
        return this.mBasePos;
    };
    IconSelectBtn.prototype.setBtnData = function (value) {
        this.mBtnData = value;
    };
    IconSelectBtn.prototype.getBtnData = function () {
        return this.mBtnData;
    };
    IconSelectBtn.prototype.setClick = function (func) {
        this.monClick = func;
    };
    IconSelectBtn.prototype.setBgRes = function (index) {
        this.mBtnBg.setTexture(this.mBgResKey, this.mBgTexture[index] || 0);
    };
    IconSelectBtn.prototype.destroy = function () {
        if (this.mBtnBg) {
            this.mBtnBg.destroy(true);
        }
        if (this.mBtnIcon) {
            this.mBtnIcon.destroy(true);
        }
        this.monClick = null;
        this.mBtnBg = null;
        this.mBtnIcon = null;
        this.mBtnData = null;
        this.mScene = null;
        _super.prototype.destroy.call(this);
    };
    IconSelectBtn.prototype.overHandler = function (pointer) {
    };
    IconSelectBtn.prototype.outHandler = function (pointer) {
    };
    IconSelectBtn.prototype.upHandler = function () {
        if (this.monClick) {
            this.monClick();
        }
    };
    IconSelectBtn.prototype.downHandler = function () {
        this.scaleHandler();
    };
    IconSelectBtn.prototype.scaleHandler = function () {
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
    return IconSelectBtn;
}(Phaser.GameObjects.Container));
export { IconSelectBtn };
//# sourceMappingURL=icon.select.btn.js.map