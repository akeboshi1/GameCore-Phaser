import { Font, Logger, UiUtils, Url } from "utils";
import { BaseLayer, BasicScene } from "baseRender";
import version from "../../../version";
import { ModuleName, SceneName } from "../../structure";
import { UiManager } from "../ui";
import { MainUIScene } from "./main.ui.scene";

export class LoadingScene extends BasicScene {
  private bg: Phaser.GameObjects.Sprite;
  private mask: Phaser.GameObjects.Graphics;
  private debug: Phaser.GameObjects.Text;
  private mCallback: Function;
  private curtain: Curtain;
  private progressText: Phaser.GameObjects.Text;
  private tipsText: string;
  private dpr: number;
  private progressData: any;
  private mRequestCom: boolean;
  private mTxtList: any[] = [];
  private mErrorList: any[] = [];
  constructor() {
    super({ key: SceneName.LOADING_SCENE });
  }

  public preload() {
    // atlas可以用于webgl渲染，和canvas渲染，spritesheet只能用于canvas
    this.load.image("avatar_placeholder", Url.getRes("dragonbones/avatar.png"));
    this.load.atlas("curtain", Url.getUIRes(this.dpr, "loading/curtain.png"), Url.getUIRes(this.dpr, "loading/curtain.json"));
    this.load.atlas("loading", Url.getRes("ui/loading/loading.png"), Url.getRes("ui/loading/loading.json"));
    // this.load.script("webfont", Url.getRes("scripts/webfont/1.6.26/webfont.js"));
    this.load.script("webfont", `${Url.RES_PATH}scripts/webfont/1.6.26/webfont.js`);
    this.load.atlas(ModuleName.MASK_LOADING_NAME, Url.getUIRes(this.dpr, "mask_loading/mask_loading.png"), Url.getUIRes(this.dpr, "mask_loading/mask_loading.json"));
    this.load.atlas(ModuleName.ALERTVIEW_NAME, Url.getUIRes(this.dpr, "pica_alert/pica_alert.png"), Url.getUIRes(this.dpr, "pica_alert/pica_alert.json"));
  }

  public init(data: any) {
    super.init(data);
    this.createFont();
    this.dpr = data.dpr || UiUtils.baseDpr;
    this.mRequestCom = false;
    this.progressData = data.data;
    this.mCallback = data.callBack;
    this.tipsText = data.text || "";
  }

  public create() {
    super.create();
    const uimanager: UiManager = this.render.uiManager;
    uimanager.setScene(this);
    try {
      WebFont.load({
        custom: {
          // families: ["Source Han Sans", "tt0173m_", "tt0503m_"]
          families: ["Source Han Sans", "tt0173m_", "tt0503m_", "t04B25"]
        },
      });
    } catch (error) {
      Logger.getInstance().warn("webfont failed to load");
    }

    const width = this.scale.gameSize.width;
    const height = this.scale.gameSize.height;
    // 手动把json配置中的frames给予anims

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

    const dpr = this.render.uiRatio;
    this.bg = this.add.sprite(width * 0.5, height * 0.5, "loading").setScale(this.render.uiScale * dpr * 2);
    this.bg.play("loading_anis");

    this.progressText = this.add.text(this.bg.x, this.bg.y + this.bg.displayHeight * 0.5, this.tipsText, {
      fontSize: 12 * dpr,
      fontFamily: Font.DEFULT_FONT
    }
    ).setOrigin(0.5);

    this.debug = this.add.text(width - 4 * dpr, height - 4 * dpr, `v${version} ${this.getDebug()}`, {
      fontSize: 12 * dpr,
      fontFamily: Font.DEFULT_FONT
    }).setOrigin(1);

    this.layerManager.addLayer(this, BaseLayer, MainUIScene.LAYER_UI, 1);
    this.layerManager.addLayer(this, BaseLayer, MainUIScene.LAYER_DIALOG, 2);
    this.layerManager.addLayer(this, BaseLayer, MainUIScene.LAYER_TOOLTIPS, 3);
    this.layerManager.addLayer(this, BaseLayer, MainUIScene.LAYER_MASK, 4);
    for (const tmpData in this.progressData) {
      this.loadProgress(this.progressData[tmpData]);
    }
  }

  getProgress(): string {
    return "test";
  }

  public updateProgress(text: any) {
    if (!text || text.length < 0) return;
    // 更新load状态
    this.tipsText = text;
    if (text && this.progressText) {
      if (this.progressText.active) this.progressText.setText(text);
    }
  }

  public loadProgress(text: any) {
    const len = this.mTxtList.length;
    const dpr = this.render.uiRatio;
    const mainTxt = this.add.text(this.bg.x - this.scale.gameSize.width / 2, this.scale.gameSize.height - 10 * dpr * (len + 1), "", {
      fontSize: 12 * dpr,
      fontFamily: Font.DEFULT_FONT
    }).setOrigin(0, .5);
    mainTxt.setText(text);
    this.mTxtList.unshift(mainTxt);
  }

  public showErrorMsg(msg: string) {
    const width = this.scale.gameSize.width;
    const height = this.scale.gameSize.height;
    const len = this.mErrorList.length;
    const dpr = this.render.uiRatio;
    const errorTxt = this.add.text(width - 4 * dpr, 15 * dpr * len, "", {
      fontSize: 12 * dpr,
      fontFamily: Font.DEFULT_FONT
    }).setOrigin(1);
    errorTxt.setText(msg);
    this.mErrorList.unshift(msg);
  }

  public wake(data?: any) {
    if (!this.scene || !this.scene.settings) {
      return;
    }
    if (this.curtain) {
      this.displayVisible(true);
      this.curtain.open().then(() => {
        // this.displayVisible(true);
        this.scene.wake();
      }).catch((error) => {
        Logger.getInstance().debug(error);
      });
      // this.scale.on("resize", this.checkSize, this);
      this.scene.bringToTop(SceneName.LOADING_SCENE);
      super.wake(data);
    }
    if (!data) {
      return;
    }
    // 更新load状态
    this.tipsText = data.text;
    Logger.getInstance().debug("loadState:----", data.text);
    if (data.text && this.progressText) {
      if (this.progressText.active) this.progressText.setText(data.text);
    }
  }

  public sleep() {
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
      if (this.progressText.active) this.progressText.setText("");
    }
    if (!this.scene || !this.scene.settings) {
      return;
    }
    // if (!this.scene.settings.active) {
    //   return;
    // }
    if (this.curtain) {
      this.displayVisible(false);
      this.curtain.close().then(() => {
        // this.displayVisible(true);
        // this.render.hideLoading();
        this.scene.sleep();
      });
    } else {
      this.displayVisible(true);
      this.scene.sleep();
    }
  }

  appendProgress(text: string) {
    if (this.progressText) {
      // let str = this.progressText.text;
      // str += `${text}\n`;
      this.progressText.setText(text);
    }
  }

  getKey(): string {
    return (this.sys.config as Phaser.Types.Scenes.SettingsConfig).key;
  }

  private getDebug() {
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
    } else if ((audioConfig && audioConfig.noAudio) || (!deviceAudio.webAudio && !deviceAudio.audioData)) {
      audioType = "No Audio";
    } else {
      audioType = "HTML5 Audio";
    }
    return `(${renderType} | ${audioType})`;
  }

  private displayVisible(val: boolean) {
    if (this.bg) {
      this.bg.visible = val;
      this.debug.visible = val;
      this.mask.visible = val;
    }
  }

  private createFont() {
    const element = document.createElement("style");
    document.head.appendChild(element);
    const sheet: CSSStyleSheet = <CSSStyleSheet>element.sheet;
    const font = ["en/tt0173m_.ttf", "en/tt0503m_.ttf", "04B.ttf"];
    // const styles = "@font-face { font-family: 'Source Han Sans'; src: url('./resources/fonts/otf/SourceHanSansTC-Regular.otf') format('opentype');font-display:swap; }\n";
    const styles2 = `@font-face { font-family: 'tt0173m_'; src: url('${Url.getRes("fonts/en/tt0173m_.ttf")}') format('truetype');font-display:swap }\n`;
    const styles3 = `@font-face { font-family: 'tt0503m_'; src: url('${Url.getRes("fonts/en/tt0503m_.ttf")}') format('truetype'); font-display:swap}\n`;
    const styles4 = `@font-face { font-family: 't04B25'; src: url('${Url.getRes("fonts/04B.ttf")}') format('truetype'); font-display:swap}`;
    // sheet.insertRule(styles, 0);
    sheet.insertRule(styles2, 0);
    sheet.insertRule(styles3, 0);
    sheet.insertRule(styles4, 0);
  }
}

class Curtain {
  private upDisplay: Phaser.GameObjects.Image;
  private downDisplay: Phaser.GameObjects.Image;
  private upTween: Phaser.Tweens.Tween;
  private downTween: Phaser.Tweens.Tween;
  private readonly key = "curtain";
  constructor(private scene: Phaser.Scene, private dpr: number) {
    this.upDisplay = this.scene.add.image(0, 0, this.key, "up.png").setOrigin(0).setVisible(false).setScale(this.dpr);
    this.downDisplay = this.scene.add.image(0, 0, this.key, "down.png").setOrigin(0, 1).setVisible(false).setScale(this.dpr);
  }

  open() {
    this.upDisplay.visible = true;
    this.downDisplay.visible = true;
    return new Promise<void>((resolve, reject) => {
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
        duration: 1000
      });
      this.downTween = this.scene.tweens.add({
        targets: this.downDisplay,
        props: { y: height },
        duration: 1000,
        onComplete: () => {
          // this.upDisplay.visible = false;
          // this.downDisplay.visible = false;
          this.clearTween();
          resolve();
        }
      });
    });
  }

  close() {
    this.downDisplay.visible = true;
    this.upDisplay.visible = true;
    return new Promise<void>((resolve, reject) => {
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
        duration: 1000
      });
      this.downTween = this.scene.tweens.add({
        targets: this.downDisplay,
        props: { y: height + this.downDisplay.displayHeight },
        duration: 1000,
        onComplete: () => {
          // this.downDisplay.visible = false;
          // this.upDisplay.visible = false;
          this.clearTween();
          resolve();
        }
      });
    });
  }

  destroy() {
  }

  private clearTween() {
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
