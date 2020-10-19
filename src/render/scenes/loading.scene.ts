import { Font, Url } from "../../utils";
import { Logger } from "../../utils/log";
import { BasicScene } from "./basic.scene";
import verion from "../../../version";

export class LoadingScene extends BasicScene {
  private bg: Phaser.GameObjects.Sprite;
  private mask: Phaser.GameObjects.Graphics;
  private debug: Phaser.GameObjects.Text;
  private mCallback: Function;
  private curtain: Curtain;
  private progressText: Phaser.GameObjects.Text;
  private mRequestCom: boolean = false;
  private tipsText: string;
  private dpr: number;

  constructor() {
    super({ key: LoadingScene.name });
  }

  public preload() {
    // atlas可以用于webgl渲染，和canvas渲染，spritesheet只能用于canvas
    // this.load.image("loading_bg", Url.getRes(""))
    this.load.image("avatar_placeholder", Url.getRes("dragonbones/avatar.png"));
    this.load.atlas("curtain", Url.getUIRes(this.dpr, "loading/curtain.png"), Url.getUIRes(this.dpr, "loading/curtain.json"));
    this.load.atlas("loading", Url.getRes("ui/loading/loading.png"), Url.getRes("ui/loading/loading.json"));
    // this.load.atlas("grass", Url.getUIRes(dpr, "loading/grass.png"), Url.getUIRes(dpr, "loading/grass.json"));
    this.load.script("webfont", "./resources/scripts/webfont/1.6.26/webfont.js");
    // this.load.spritesheet("rabbit00.png", "./resources/rabbit00.png", { frameWidth: 150, frameHeight: 150 });
  }

  public init(data: any) {
    this.createFont();
    this.dpr = data.dpr;
    this.mRequestCom = false;
    this.mCallback = data.callBack;
    this.tipsText = data.text;
  }

  public create() {
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

    this.mask = this.add.graphics(undefined);
    this.mask.fillStyle(0);
    this.mask.fillRect(0, 0, width, height);

    this.bg = this.add.sprite(width * 0.5, height * 0.5, "loading").setScale(this.dpr * 2);
    this.bg.play("loading_anis");

    this.progressText = this.add.text(this.bg.x, this.bg.y + this.bg.displayHeight * 0.5, this.tipsText, {
      fontSize: 12 * this.dpr,
      fontFamily: Font.DEFULT_FONT
    }
    ).setOrigin(0.5);

    this.debug = this.add.text(width - 4 * this.dpr, height - 4 * this.dpr, `v${verion} ${this.getDebug()}`, {
      fontSize: 12 * this.dpr,
      fontFamily: Font.DEFULT_FONT
    }).setOrigin(1);

    if (this.mCallback) {
      this.mCallback.call(this, this);
      this.mCallback = undefined;
    }
    // this.scale.on("resize", this.checkSize, this);

  }

  public async show() {
    this.awake();
    if (!this.curtain) {
      return Promise.resolve();
    }
    this.displayVisible(false);
    return this.curtain.open();
  }

  public async close() {
    if (!this.curtain) {
      return;
    }
    this.displayVisible(false);
    return this.curtain.close();
  }

  public awake(data?: any) {
    if (!this.scene || !this.scene.settings) {
      return;
    }
    this.displayVisible(true);
    // this.scale.on("resize", this.checkSize, this);
    this.scene.wake();
    this.scene.bringToTop(LoadingScene.name);
    if (!data) {
      return;
    }
    this.tipsText = data.text;
    if (data.text && this.progressText) {
      if (this.progressText.active) this.progressText.setText(data.text);
    }
  }

  public sleep() {
    if (this.progressText)  {
      if (this.progressText.active) this.progressText.setText("");
    }
    if (!this.scene || !this.scene.settings) {
      return;
    }
    if (!this.scene.settings.active) {
      return;
    }
    if (this.curtain) {
      this.displayVisible(false);
      this.curtain.close().then(() => {
        // this.displayVisible(true);
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
    // const styles = "@font-face { font-family: 'Source Han Sans'; src: url('./resources/fonts/otf/SourceHanSansTC-Regular.otf') format('opentype');font-display:swap; }\n";
    const styles2 = "@font-face { font-family: 'tt0173m_'; src: url('./resources/fonts/en/tt0173m_.ttf') format('truetype');font-display:swap }\n";
    const styles3 = "@font-face { font-family: 'tt0503m_'; src: url('./resources/fonts/en/tt0503m_.ttf') format('truetype'); font-display:swap}\n";
    const styles4 = "@font-face { font-family: 't04B25'; src: url('./resources/fonts/04B.ttf') format('truetype'); font-display:swap}";
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
  constructor(private scene: Phaser.Scene, uiScale: number) {
    this.upDisplay = this.scene.add.image(0, 0, this.key, "up.png").setOrigin(0).setVisible(false).setScale(uiScale);
    this.downDisplay = this.scene.add.image(0, 0, this.key, "down.png").setOrigin(0, 1).setVisible(false).setScale(uiScale);
  }

  open() {
    this.upDisplay.visible = true;
    this.downDisplay.visible = true;
    return new Promise((resolve, reject) => {
      if (!this.scene.cameras.main) {
        resolve();
        return;
      }
      const height = this.scene.cameras.main.height;
      this.upDisplay.y = -this.upDisplay.displayHeight;
      this.downDisplay.y = height + this.downDisplay.displayHeight;
      this.upTween = this.scene.add.tween({
        targets: this.upDisplay,
        props: { y: 0 },
        duration: 1000
      });
      this.downTween = this.scene.add.tween({
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
    return new Promise((resolve, reject) => {
      if (!this.scene.cameras.main) {
        resolve();
        return;
      }
      const height = this.scene.cameras.main.height;
      this.upDisplay.y = 0;
      this.downDisplay.y = height;
      this.upTween = this.scene.add.tween({
        targets: this.upDisplay,
        props: { y: -this.upDisplay.displayHeight },
        duration: 1000
      });
      this.downTween = this.scene.add.tween({
        targets: this.downDisplay,
        props: { y: height + this.downDisplay.displayHeight },
        duration: 1000,
        onComplete: () => {
          this.downDisplay.visible = false;
          this.upDisplay.visible = false;
          this.clearTween();
          resolve();
        }
      });
    });
  }

  destroy() {
    this.destroy();
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
