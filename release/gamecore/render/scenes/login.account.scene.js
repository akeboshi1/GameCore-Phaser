var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { BasicScene } from "baseRender";
import { Size, Logger, SceneName } from "structure";
export class LoginAccountScene extends BasicScene {
  constructor() {
    super({ key: SceneName.LOGINACCOUNT_SCENE });
    __publicField(this, "mWorld");
    __publicField(this, "bg");
    __publicField(this, "mCallback");
  }
  preload() {
    let dpr = 2;
    if (this.mWorld) {
      dpr = this.mWorld.uiRatio || 2;
    }
    this.load.image("avatar_placeholder", this.render.url.getRes("dragonbones/avatar.png"));
    this.load.atlas("curtain", this.render.url.getUIRes(dpr, "loading/curtain.png"), this.render.url.getUIRes(dpr, "loading/curtain.json"));
    this.load.atlas("loading", this.render.url.getRes("ui/loading/loading.png"), this.render.url.getRes("ui/loading/loading.json"));
    this.load.script("webfont", "./resources/scripts/webfont/1.6.26/webfont.js");
  }
  init(data) {
    super.init(data);
    this.createFont();
    this.mWorld = data.world;
    this.mCallback = data.callBack;
  }
  create() {
    super.create();
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
    const dpr = this.mWorld.uiRatio;
    this.bg = this.add.sprite(width * 0.5, height * 0.5, "loading").setScale(this.mWorld.uiScale * dpr * 2);
    this.bg.play("loading_anis");
    this.checkSize(new Size(width, height));
    this.scale.on("resize", this.checkSize, this);
    const bgg = this.add.graphics();
    bgg.fillStyle(16763904, 0.8);
    bgg.fillRect(0, 0, 100, 50);
    bgg.setInteractive(new Phaser.Geom.Rectangle(0, 0, 100, 50), Phaser.Geom.Rectangle.Contains);
    bgg.x = 200;
    bgg.y = 300;
    bgg.on("pointerdown", () => {
      if (this.mCallback) {
        this.mCallback.call(this, this);
        this.mCallback = void 0;
      }
    }, this);
  }
  getKey() {
    return this.sys.config.key;
  }
  checkSize(size) {
  }
  createFont() {
    const element = document.createElement("style");
    document.head.appendChild(element);
    const sheet = element.sheet;
    const styles2 = "@font-face { font-family: 'tt0173m_'; src: url('./resources/fonts/en/tt0173m_.ttf') format('truetype');font-display:swap }\n";
    const styles3 = "@font-face { font-family: 'tt0503m_'; src: url('./resources/fonts/en/tt0503m_.ttf') format('truetype'); font-display:swap}\n";
    const styles4 = "@font-face { font-family: 't04B25'; src: url('./resources/fonts/04B.ttf') format('truetype'); font-display:swap}";
    sheet.insertRule(styles2, 0);
    sheet.insertRule(styles3, 0);
    sheet.insertRule(styles4, 0);
  }
}
