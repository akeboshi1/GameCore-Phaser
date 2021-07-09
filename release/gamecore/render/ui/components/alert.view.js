var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Button, BBCodeText, ClickEvent } from "apowophaserui";
import { Font, i18n } from "structure";
import { UiUtils } from "utils";
import { MainUIScene } from "../../scenes/main.ui.scene";
import { BaseBatchPanel } from "./base.batch.panel";
export class AlertView extends BaseBatchPanel {
  constructor(scene, uiManager) {
    super(scene, uiManager.render);
    this.uiManager = uiManager;
    __publicField(this, "skinName", "AlertView");
    __publicField(this, "mOkBtn");
    __publicField(this, "mCancelBtn");
    __publicField(this, "mContent");
    __publicField(this, "mTitleLabel");
    __publicField(this, "mOkText");
    __publicField(this, "mBackGround");
    this.key = this.skinName;
    this.disInteractive();
  }
  show(config) {
    this.mShowData = config;
    super.show(config);
    if (this.mInitialized) {
      const { ox, oy } = config;
      this.x = ox || this.scene.cameras.main.width / 2;
      this.y = oy || this.scene.cameras.main.height / 2;
      this.mBackGround.clear();
      this.mBackGround.fillStyle(16777215, 0);
      this.mBackGround.fillRect(-this.x, -this.y, this.cameraWidth, this.cameraHeight);
      this.mBackGround.setInteractive(new Phaser.Geom.Rectangle(-this.x, -this.y, this.cameraWidth, this.cameraHeight), Phaser.Geom.Rectangle.Contains);
      this.mContent.setText(config.text);
      if (config.title) {
        this.mTitleLabel.setText(config.title);
      }
      const btns = config.btns;
      if (btns === Buttons.Cancel) {
        this.remove(this.mOkBtn);
        this.mCancelBtn.x = 0;
      } else if (btns === Buttons.Ok) {
        this.remove(this.mCancelBtn);
        this.mOkBtn.x = 0;
      }
    }
  }
  preload() {
    this.addAtlas(this.key, "pica_alert/pica_alert.png", "pica_alert/pica_alert.json");
    super.preload();
  }
  setOKText(val) {
    this.mOkText = val;
    if (this.mOkBtn) {
      this.mOkBtn.setText(val);
    }
    return this;
  }
  init() {
    const zoom = this.mWorld.uiScale || UiUtils.baseScale;
    this.mBackGround = this.scene.make.graphics(void 0, false);
    this.add(this.mBackGround);
    const bg = this.scene.make.image({
      key: this.key,
      frame: "bg.png"
    }, false);
    bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    const title = this.scene.make.image({
      key: this.key,
      frame: "title.png"
    }, false);
    title.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    title.y = -bg.height / 2;
    this.mTitleLabel = this.scene.make.text({
      text: i18n.t("common.tips"),
      style: {
        fontFamily: Font.DEFULT_FONT,
        fontSize: 12 * this.dpr * zoom + "px",
        color: "#905B06"
      }
    }, false).setOrigin(0.5);
    this.mTitleLabel.y = title.y;
    this.mContent = new BBCodeText(this.scene, 0, -11 * this.dpr, "", {
      fontSize: 12 * this.dpr * zoom + "px",
      fontFamily: Font.DEFULT_FONT,
      color: "#0",
      wrap: {
        mode: "char",
        width: 218 * this.dpr
      }
    });
    this.mContent.setOrigin(0.5, 0.5);
    this.mOkBtn = new Button(this.scene, this.key, "yellow_btn.png", void 0, this.mOkText || i18n.t("common.confirm"));
    this.mOkBtn.setTextStyle({
      color: "#905B06",
      fontFamily: Font.DEFULT_FONT,
      fontSize: 13 * this.dpr * zoom
    });
    this.mOkBtn.x = (bg.width - this.mOkBtn.displayWidth) / 2 - 38 * this.dpr;
    this.mOkBtn.y = (bg.height - this.mOkBtn.displayHeight) / 2 - 16 * this.dpr;
    this.mOkBtn.on(ClickEvent.Tap, this.onOkHandler, this);
    this.mCancelBtn = new Button(this.scene, this.key, "red_btn.png", void 0, i18n.t("common.cancel"));
    this.mCancelBtn.setTextStyle({
      fontFamily: Font.DEFULT_FONT,
      fontSize: 13 * this.dpr * zoom
    });
    this.mCancelBtn.x = -(bg.width - this.mCancelBtn.displayWidth) / 2 + 38 * this.dpr;
    this.mCancelBtn.y = this.mOkBtn.y;
    this.mCancelBtn.on(ClickEvent.Tap, this.onCancelHandler, this);
    this.add([bg, title, this.mTitleLabel, this.mTitleLabel, this.mContent, this.mOkBtn, this.mCancelBtn]);
    super.init();
    this.mScene.layerManager.addToLayer(MainUIScene.LAYER_TOOLTIPS, this);
  }
  onOkHandler() {
    if (!this.mShowData) {
      return;
    }
    const callback = this.mShowData.callback;
    if (callback) {
      callback.call(this.mShowData.content);
    }
    this.closePanel();
  }
  onCancelHandler() {
    const callback = this.mShowData.cancelback;
    if (callback) {
      callback.call(this.mShowData.content);
    }
    this.closePanel();
  }
  closePanel() {
    this.uiManager.hideBatchPanel(this);
    if (this.parentContainer) {
      this.parentContainer.remove(this);
    }
    if (!this.mShowData || this.mShowData.once !== false) {
      this.destroy();
      this.mShowData = void 0;
    }
  }
}
export var Buttons;
(function(Buttons2) {
  Buttons2[Buttons2["Ok"] = 0] = "Ok";
  Buttons2[Buttons2["Cancel"] = 1] = "Cancel";
  Buttons2[Buttons2["OKAndCancel"] = 2] = "OKAndCancel";
})(Buttons || (Buttons = {}));
