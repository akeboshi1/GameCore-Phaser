var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { UiUtils } from "utils";
import { BaseLayer, BasicScene } from "baseRender";
import { MainUIScene } from "./main.ui.scene";
import { Font, Logger, SceneName } from "structure";
export class LoadingScene extends BasicScene {
  constructor() {
    super({ key: SceneName.LOADING_SCENE });
    __publicField(this, "bg");
    __publicField(this, "mask");
    __publicField(this, "debug");
    __publicField(this, "mCallback");
    __publicField(this, "curtain");
    __publicField(this, "progressText");
    __publicField(this, "tipsText");
    __publicField(this, "dpr");
    __publicField(this, "progressData");
    __publicField(this, "mRequestCom");
    __publicField(this, "mTxtList", []);
    __publicField(this, "mErrorList", []);
    __publicField(this, "mGameVersion");
  }
  preload() {
  }
  init(data) {
    super.init(data);
    this.createFont();
    this.dpr = data.dpr || UiUtils.baseDpr;
    this.mRequestCom = false;
    this.progressData = data.data;
    this.mCallback = data.callBack;
    this.mGameVersion = data.version || "beta";
    this.tipsText = data.text || "";
  }
  create() {
    try {
      WebFont.load({
        custom: {
          families: ["Source Han Sans", "tt0173m_", "tt0503m_", "t04B25"]
        }
      });
    } catch (error) {
      Logger.getInstance().warn("webfont failed to load");
    }
    const width = this.scale.gameSize.width;
    const height = this.scale.gameSize.height;
    this.anims.create({
      key: "loading_anis",
      frames: this.anims.generateFrameNames("loading", { prefix: "loading_", start: 1, end: 3, zeroPad: 1, suffix: ".png" }),
      frameRate: 5,
      repeat: -1
    });
    this.curtain = new Curtain(this, this.dpr);
    this.mask = this.add.graphics({ x: 0, y: 0 });
    this.mask.fillStyle(0);
    this.mask.fillRect(0, 0, width, height);
    this.mask.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    const dpr = this.render.uiRatio;
    this.bg = this.add.sprite(width * 0.5, height * 0.5, "loading").setScale(this.render.uiScale * dpr * 2);
    this.bg.play("loading_anis");
    this.progressText = this.add.text(this.bg.x, this.bg.y + this.bg.displayHeight * 0.5, this.tipsText, {
      fontSize: 12 * dpr + "px",
      fontFamily: Font.DEFULT_FONT
    }).setOrigin(0.5);
    this.debug = this.add.text(width - 4 * dpr, height - 4 * dpr, `v${this.mGameVersion} ${this.getDebug()}`, {
      fontSize: 12 * dpr + "px",
      fontFamily: Font.DEFULT_FONT
    }).setOrigin(1);
    this.layerManager.addLayer(this, BaseLayer, MainUIScene.LAYER_UI, 1);
    this.layerManager.addLayer(this, BaseLayer, MainUIScene.LAYER_DIALOG, 2);
    this.layerManager.addLayer(this, BaseLayer, MainUIScene.LAYER_TOOLTIPS, 3);
    this.layerManager.addLayer(this, BaseLayer, MainUIScene.LAYER_MASK, 4);
    for (const tmpData in this.progressData) {
      this.loadProgress(this.progressData[tmpData]);
    }
    super.create();
    const uimanager = this.render.uiManager;
    uimanager.setScene(this);
  }
  getProgress() {
    return "test";
  }
  updateProgress(text) {
    if (!text || text.length < 0)
      return;
    this.tipsText = text;
    if (text && this.progressText) {
      if (this.progressText.active)
        this.progressText.setText(text);
    }
  }
  loadProgress(text) {
    const len = this.mTxtList.length;
    const dpr = this.render.uiRatio;
    const mainTxt = this.add.text(this.bg.x - this.scale.gameSize.width / 2, this.scale.gameSize.height - 10 * dpr * (len + 1), "", {
      fontSize: 12 * dpr + "px",
      fontFamily: Font.DEFULT_FONT
    }).setOrigin(0, 0.5);
    mainTxt.setText(text);
    this.mTxtList.unshift(mainTxt);
  }
  showErrorMsg(msg) {
    const width = this.scale.gameSize.width;
    const len = this.mErrorList.length;
    const dpr = this.render.uiRatio;
    const errorTxt = this.add.text(width - 4 * dpr, 15 * dpr * len, "", {
      fontSize: 12 * dpr + "px",
      fontFamily: Font.DEFULT_FONT
    }).setOrigin(1);
    errorTxt.setText(msg);
    this.mErrorList.unshift(errorTxt);
  }
  wake(data) {
    if (!this.scene || !this.scene.settings) {
      return;
    }
    if (this.curtain) {
      this.displayVisible(true);
      this.curtain.open().then(() => {
        this.scene.wake();
      }).catch((error) => {
        Logger.getInstance().debug(error);
      });
      this.scene.bringToTop(SceneName.LOADING_SCENE);
      super.wake(data);
    }
    if (!data) {
      return;
    }
    this.tipsText = data.text;
    Logger.getInstance().debug("loadState:----", data.text);
    if (data.text && this.progressText) {
      if (this.progressText.active)
        this.progressText.setText(data.text);
    }
  }
  sleep() {
    this.mTxtList.forEach((text) => {
      text.destroy();
    });
    this.mErrorList.forEach((text) => {
      text.destroy();
    });
    this.mErrorList.length = 0;
    this.mErrorList = [];
    this.mTxtList.length = 0;
    this.mTxtList = [];
    if (this.progressText) {
      if (this.progressText.active)
        this.progressText.setText("");
    }
    if (!this.scene || !this.scene.settings) {
      return;
    }
    if (this.curtain) {
      this.displayVisible(false);
      this.curtain.close().then(() => {
        this.scene.sleep();
      });
    } else {
      this.displayVisible(true);
      this.scene.sleep();
    }
  }
  appendProgress(text) {
    if (this.progressText) {
      this.progressText.setText(text);
    }
  }
  getKey() {
    return this.sys.config.key;
  }
  getDebug() {
    let renderType = "WebGL";
    const config = this.game.config;
    if (config.renderType === Phaser.CANVAS) {
      renderType = "Canvas";
    } else if (config.renderType === Phaser.HEADLESS) {
      renderType = "Headless";
    }
    const audioConfig = config.audio;
    const deviceAudio = this.game.device.audio;
    let audioType;
    if (deviceAudio.webAudio && !(audioConfig && audioConfig.disableWebAudio)) {
      audioType = "Web Audio";
    } else if (audioConfig && audioConfig.noAudio || !deviceAudio.webAudio && !deviceAudio.audioData) {
      audioType = "No Audio";
    } else {
      audioType = "HTML5 Audio";
    }
    return `(${renderType} | ${audioType})`;
  }
  displayVisible(val) {
    if (this.bg) {
      this.bg.visible = val;
      this.debug.visible = val;
      this.mask.visible = val;
    }
  }
  createFont() {
    const element = document.createElement("style");
    document.head.appendChild(element);
    const sheet = element.sheet;
    const font = ["en/tt0173m_.ttf", "en/tt0503m_.ttf", "04B.ttf"];
    const styles2 = `@font-face { font-family: 'tt0173m_'; src: url('${this.render.url.getRes("fonts/en/tt0173m_.ttf")}') format('truetype');font-display:swap }
`;
    const styles3 = `@font-face { font-family: 'tt0503m_'; src: url('${this.render.url.getRes("fonts/en/tt0503m_.ttf")}') format('truetype'); font-display:swap}
`;
    const styles4 = `@font-face { font-family: 't04B25'; src: url('${this.render.url.getRes("fonts/04B.ttf")}') format('truetype'); font-display:swap}`;
    sheet.insertRule(styles2, 0);
    sheet.insertRule(styles3, 0);
    sheet.insertRule(styles4, 0);
  }
}
class Curtain {
  constructor(scene, dpr) {
    this.scene = scene;
    this.dpr = dpr;
    __publicField(this, "upDisplay");
    __publicField(this, "downDisplay");
    __publicField(this, "upTween");
    __publicField(this, "downTween");
    __publicField(this, "key", "curtain");
    this.upDisplay = this.scene.add.image(0, 0, this.key, "up.png").setOrigin(0).setVisible(false).setScale(this.dpr);
    this.downDisplay = this.scene.add.image(0, 0, this.key, "down.png").setOrigin(0, 1).setVisible(false).setScale(this.dpr);
  }
  open() {
    this.upDisplay.visible = true;
    this.downDisplay.visible = true;
    return new Promise((resolve, reject) => {
      if (!this.scene.cameras.main) {
        resolve();
        return;
      }
      if (this.upTween || this.downTween) {
        reject();
        return;
      }
      const height = this.scene.cameras.main.height;
      this.upDisplay.y = -this.upDisplay.displayHeight;
      this.downDisplay.y = height + this.downDisplay.displayHeight;
      this.upTween = this.scene.tweens.add({
        targets: this.upDisplay,
        props: { y: 0 },
        duration: 1e3
      });
      this.downTween = this.scene.tweens.add({
        targets: this.downDisplay,
        props: { y: height },
        duration: 1e3,
        onComplete: () => {
          this.clearTween();
          resolve();
        }
      });
    });
  }
  close() {
    this.downDisplay.visible = true;
    this.upDisplay.visible = true;
    return new Promise((resolve, reject) => {
      if (!this.scene.cameras.main) {
        resolve(null);
        return;
      }
      const height = this.scene.cameras.main.height;
      this.upDisplay.y = 0;
      this.downDisplay.y = height;
      this.clearTween();
      this.upTween = this.scene.tweens.add({
        targets: this.upDisplay,
        props: { y: -this.upDisplay.displayHeight },
        duration: 1e3
      });
      this.downTween = this.scene.tweens.add({
        targets: this.downDisplay,
        props: { y: height + this.downDisplay.displayHeight },
        duration: 1e3,
        onComplete: () => {
          this.clearTween();
          resolve();
        }
      });
    });
  }
  destroy() {
  }
  clearTween() {
    if (this.upTween) {
      this.upTween.stop();
      this.upTween = null;
    }
    if (this.downTween) {
      this.downTween.stop();
      this.downTween = null;
    }
  }
}
