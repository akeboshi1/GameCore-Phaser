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
import { Tool } from "utils";
var ToolTip = /** @class */ (function (_super) {
    __extends_1(ToolTip, _super);
    function ToolTip(mScene, resStr, resJson, resUrl, uiScale) {
        var _this = _super.call(this, mScene) || this;
        _this.mScene = mScene;
        _this.resStr = resStr;
        _this.resJson = resJson;
        _this.resUrl = resUrl;
        _this.uiScale = uiScale;
        _this.mWidth = 0;
        _this.mHeight = 0;
        _this.mBaseMidHeight = 0;
        _this.preLoad();
        return _this;
    }
    ToolTip.prototype.setToolTipData = function (value) {
        if (!this.mText)
            return;
        var str = Tool.formatChineseString(value, this.mText.style.fontSize, this.mWidth - 20);
        this.mText.setText(str);
        this.refreshTip();
    };
    ToolTip.prototype.destroy = function () {
        if (this.topImage)
            this.topImage.destroy(true);
        if (this.midImage)
            this.midImage.destroy(true);
        if (this.botImage)
            this.botImage.destroy(true);
        if (this.mText)
            this.mText.destroy(true);
        this.mWidth = 0;
        this.mHeight = 0;
        this.removeAll();
        _super.prototype.destroy.call(this);
    };
    ToolTip.prototype.preLoad = function () {
        this.scene.load.atlas(this.resStr, this.resUrl, this.resJson);
        this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadComplete, this);
        this.scene.load.start();
    };
    ToolTip.prototype.init = function () {
        this.topImage = this.scene.make.image(undefined, false);
        this.topImage.setOrigin(0, 0);
        this.topImage.setTexture(this.resStr, ToolTip.TOP);
        this.midImage = this.scene.make.image(undefined, false);
        this.midImage.setOrigin(0, 0);
        this.midImage.setTexture(this.resStr, ToolTip.MID);
        this.botImage = this.scene.make.image(undefined, false);
        this.botImage.setOrigin(0, 0);
        this.botImage.setTexture(this.resStr, ToolTip.BOT);
        this.mText = this.scene.make.text(undefined, false);
        this.mText.setFontFamily("YaHei");
        this.mText.setFontStyle("bold");
        this.mText.setFontSize(14);
        this.mText.style.align = "center";
        this.mText.lineSpacing = 15;
        this.mWidth = this.topImage.width;
        this.mBaseMidHeight = this.midImage.height;
        this.mText.style.fixedWidth = this.mWidth - 20;
        this.mText.style.setWordWrapWidth(this.mWidth - 20, true);
        // this.mText.style.setMaxLines(10);
        this.add(this.topImage);
        this.add(this.midImage);
        this.add(this.botImage);
        this.add(this.mText);
    };
    ToolTip.prototype.refreshTip = function () {
        this.midImage.scaleY = (this.mText.height + 20) / this.mBaseMidHeight;
        this.mHeight = this.topImage.height + this.midImage.height * this.midImage.scaleY + this.botImage.height;
        this.topImage.y = -this.topImage.height >> 1;
        this.midImage.y = this.topImage.y + this.topImage.height;
        this.botImage.y = this.midImage.y + this.midImage.height * this.midImage.scaleY;
        this.mText.x = this.mWidth - this.mText.style.fixedWidth >> 1;
        this.mText.y = this.mHeight - this.mText.height - 10 >> 1;
        this.setSize(this.mWidth, this.mHeight);
    };
    ToolTip.prototype.onLoadComplete = function () {
        this.init();
    };
    ToolTip.TOP = "tip_top.png";
    ToolTip.MID = "tip_mid.png";
    ToolTip.BOT = "tip_bot.png";
    return ToolTip;
}(Phaser.GameObjects.Container));
export { ToolTip };
//# sourceMappingURL=toolTip.js.map