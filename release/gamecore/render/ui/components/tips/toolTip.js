var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Tool } from "utils";
const _ToolTip = class extends Phaser.GameObjects.Container {
  constructor(mScene, resStr, resJson, resUrl, uiScale) {
    super(mScene);
    this.mScene = mScene;
    this.resStr = resStr;
    this.resJson = resJson;
    this.resUrl = resUrl;
    this.uiScale = uiScale;
    __publicField(this, "mWidth", 0);
    __publicField(this, "mHeight", 0);
    __publicField(this, "mBaseMidHeight", 0);
    __publicField(this, "topImage");
    __publicField(this, "midImage");
    __publicField(this, "botImage");
    __publicField(this, "mText");
    this.preLoad();
  }
  setToolTipData(value) {
    if (!this.mText)
      return;
    const str = Tool.formatChineseString(value, this.mText.style.fontSize, this.mWidth - 20);
    this.mText.setText(str);
    this.refreshTip();
  }
  destroy() {
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
    super.destroy();
  }
  preLoad() {
    this.scene.load.atlas(this.resStr, this.resUrl, this.resJson);
    this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadComplete, this);
    this.scene.load.start();
  }
  init() {
    this.topImage = this.scene.make.image(void 0, false);
    this.topImage.setOrigin(0, 0);
    this.topImage.setTexture(this.resStr, _ToolTip.TOP);
    this.midImage = this.scene.make.image(void 0, false);
    this.midImage.setOrigin(0, 0);
    this.midImage.setTexture(this.resStr, _ToolTip.MID);
    this.botImage = this.scene.make.image(void 0, false);
    this.botImage.setOrigin(0, 0);
    this.botImage.setTexture(this.resStr, _ToolTip.BOT);
    this.mText = this.scene.make.text(void 0, false);
    this.mText.setFontFamily("YaHei");
    this.mText.setFontStyle("bold");
    this.mText.setFontSize(14);
    this.mText.style.align = "center";
    this.mText.lineSpacing = 15;
    this.mWidth = this.topImage.width;
    this.mBaseMidHeight = this.midImage.height;
    this.mText.style.fixedWidth = this.mWidth - 20;
    this.mText.style.setWordWrapWidth(this.mWidth - 20, true);
    this.add(this.topImage);
    this.add(this.midImage);
    this.add(this.botImage);
    this.add(this.mText);
  }
  refreshTip() {
    this.midImage.scaleY = (this.mText.height + 20) / this.mBaseMidHeight;
    this.mHeight = this.topImage.height + this.midImage.height * this.midImage.scaleY + this.botImage.height;
    this.topImage.y = -this.topImage.height >> 1;
    this.midImage.y = this.topImage.y + this.topImage.height;
    this.botImage.y = this.midImage.y + this.midImage.height * this.midImage.scaleY;
    this.mText.x = this.mWidth - this.mText.style.fixedWidth >> 1;
    this.mText.y = this.mHeight - this.mText.height - 10 >> 1;
    this.setSize(this.mWidth, this.mHeight);
  }
  onLoadComplete() {
    this.init();
  }
};
export let ToolTip = _ToolTip;
__publicField(ToolTip, "TOP", "tip_top.png");
__publicField(ToolTip, "MID", "tip_mid.png");
__publicField(ToolTip, "BOT", "tip_bot.png");
