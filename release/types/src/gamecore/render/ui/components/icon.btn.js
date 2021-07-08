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
 * 多帧资源按钮
 */
var IconBtn = /** @class */ (function (_super) {
    __extends_1(IconBtn, _super);
    // // 按钮打开模块的name，用于打开和关闭此模块及模块更新时，主界面按钮的更新（显示和隐藏）
    // private medName: string;
    function IconBtn(scene, render, data) {
        var _this = _super.call(this, scene) || this;
        _this.mScene = scene;
        _this.mRender = render;
        _this.mBtnBg = scene.make.image(undefined, false);
        _this.mBgResKey = data.bgResKey;
        _this.mBgTexture = data.bgTextures;
        _this.mData = data;
        if (!_this.mScene.textures.exists(_this.mBgResKey) && data.pngUrl && data.jsonUrl) {
            _this.mScene.load.atlas(data.key, render.url.getRes(data.pngUrl), render.url.getRes(data.jsonUrl));
            _this.mScene.load.once(Phaser.Loader.Events.COMPLETE, _this.loadComplete, _this);
            _this.mScene.load.start();
            return _this;
        }
        _this.loadComplete();
        return _this;
    }
    // public setMedName(name: string) {
    //     this.medName = name;
    // }
    IconBtn.prototype.getKey = function () {
        return this.mData.key;
    };
    IconBtn.prototype.setPos = function (x, y) {
        if (!this.mBasePos) {
            this.mBasePos = new Pos();
        }
        this.mBasePos.x = x;
        this.mBasePos.y = y;
    };
    /**
     * 获取按钮的初始化时的位置，用于tween时，按钮来回切换位置用
     */
    IconBtn.prototype.getPos = function () {
        return this.mBasePos;
    };
    IconBtn.prototype.setBtnData = function (value) {
        this.mBtnData = value;
    };
    IconBtn.prototype.getBtnData = function () {
        return this.mBtnData;
    };
    IconBtn.prototype.setClick = function (func) {
        this.monClick = func;
    };
    IconBtn.prototype.destroy = function () {
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
    IconBtn.prototype.loadComplete = function () {
        this.mBtnBg.setTexture(this.mBgResKey, this.mBgTexture[0]);
        this.mBtnBg.scaleX = this.mBtnBg.scaleY = this.mData.scale;
        this.addAt(this.mBtnBg, 0);
        if (this.mData.iconResKey && this.mData.iconTexture && this.mData.iconTexture.length > 0) {
            this.mBtnIcon = this.mScene.make.image(undefined, false);
            this.mBtnIcon.setTexture(this.mData.iconResKey, this.mData.iconTexture);
            this.add(this.mBtnIcon);
        }
        this.setSize(this.mBtnBg.width, this.mBtnBg.height);
        this.setInteractive();
        this.on("pointerup", this.upHandler, this);
        this.on("pointerdown", this.downHandler, this);
        this.on("pointerover", this.overHandler, this);
        this.on("pointerout", this.outHandler, this);
    };
    IconBtn.prototype.overHandler = function (pointer) {
        if (this.mBgTexture.length < 2) {
            return;
        }
        this.mBtnBg.setTexture(this.mBgResKey, this.mBgTexture[1]);
    };
    IconBtn.prototype.outHandler = function (pointer) {
        if (this.mBgTexture.length < 2) {
            return;
        }
        this.mBtnBg.setTexture(this.mBgResKey, this.mBgTexture[0]);
    };
    IconBtn.prototype.upHandler = function () {
        if (this.monClick) {
            this.monClick();
        }
        if (this.mData && this.mData.callBack) {
            this.mData.callBack.apply(this);
        }
        this.emit("click", this);
        if (this.mBgTexture.length < 3) {
            return;
        }
        this.mBtnBg.setTexture(this.mBgResKey, this.mBgTexture[2]);
    };
    IconBtn.prototype.downHandler = function () {
        // this.scaleHandler();
        if (this.mBgTexture.length < 4) {
            return;
        }
        this.mBtnBg.setTexture(this.mBgResKey, this.mBgTexture[3]);
    };
    IconBtn.prototype.scaleHandler = function () {
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
    return IconBtn;
}(Phaser.GameObjects.Container));
export { IconBtn };
//# sourceMappingURL=icon.btn.js.map