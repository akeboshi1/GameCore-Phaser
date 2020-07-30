import { WorldService } from "../game/world.service";
import { IRoomService } from "../rooms/room";
import { Size } from "../utils/size";
import { Url } from "../utils/resUtil";
import { Logger } from "../utils/log";
import { BasicScene } from "./basic.scene";

export class LoadingScene extends BasicScene {
  private mWorld: WorldService;
  private mRoom: IRoomService;
  private grass: Phaser.GameObjects.Sprite;
  private bg: Phaser.GameObjects.Sprite;
  private mCallback: Function;
  private curtain: Curtain;
  private mRequestCom: boolean = false;
  constructor() {
    super({ key: LoadingScene.name });
  }

  public preload() {
    // atlas可以用于webgl渲染，和canvas渲染，spritesheet只能用于canvas
    // this.load.image("loading_bg", Url.getRes(""))
    let dpr = 2;
    if (this.mWorld) {
      dpr = this.mWorld.uiRatio || 2;
    }
    this.load.atlas("curtain", Url.getUIRes(dpr, "loading/curtain.png"), Url.getUIRes(dpr, "loading/curtain.json"));
    this.load.atlas("loading", Url.getUIRes(dpr, "loading/loading.png"), Url.getUIRes(dpr, "loading/loading.json"));
    this.load.atlas("grass", Url.getUIRes(dpr, "loading/grass.png"), Url.getUIRes(dpr, "loading/grass.json"));
    this.load.script("webfont", "./resources/scripts/webfont/1.6.26/webfont.js");
    // this.load.spritesheet("rabbit00.png", "./resources/rabbit00.png", { frameWidth: 150, frameHeight: 150 });
  }

  public init(data: any) {
    this.createFont();
    this.mWorld = data.world;
    this.mRoom = data.room;
    this.mRequestCom = false;
    this.mCallback = data.callBack;
  }

  public create() {
    try {
      WebFont.load({
        custom: {
          // families: ["Source Han Sans", "tt0173m_", "tt0503m_"]
          families: ["Source Han Sans", "tt0173m_", "tt0503m_"]
        },
      });
    } catch (error) {
      Logger.getInstance().warn("webfont failed to load");
    }

    const width = this.scale.gameSize.width;
    const height = this.scale.gameSize.height;
    const rect = this.add.graphics();
    rect.fillStyle(0);
    rect.fillRect(0, 0, width, height);
    // 手动把json配置中的frames给予anims
    this.anims.create({
      key: "grass_anis",
      frames: this.anims.generateFrameNames("grass", { prefix: "grass_", start: 1, end: 3, zeroPad: 1, suffix: ".png" }),
      frameRate: 5,
      yoyo: true,
      repeat: -1
    });

    this.anims.create({
      key: "loading_anis",
      frames: this.anims.generateFrameNames("loading", { prefix: "loading_", start: 1, end: 3, zeroPad: 1, suffix: ".png" }),
      frameRate: 5,
      repeat: -1
    });

    this.grass = this.add.sprite(0, height, "grass").setOrigin(0.5, 1).setScale(this.mWorld.uiScale);
    // this.lo.setScale(this.mWorld.uiScale);
    this.scale.on("resize", this.checkSize, this);
    this.grass.play("grass_anis");

    this.bg = this.add.sprite(width * 0.5, 0, "loading").setScale(this.mWorld.uiScale);
    this.bg.play("loading_anis");
    this.curtain = new Curtain(this, this.mWorld);
    // this.curtain.open().then(() => {
    // this.bg.x = 0;
    // this.add.tween({
    //   targets: this.bg,
    //   props: { x: width, rotation: -720 },
    //   duration: 2000,
    //   loop: -1
    // });
    // });

    this.checkSize(new Size(width, height));
    if (this.mCallback) {
      this.mCallback.call(this, this);
      this.mCallback = undefined;
    }
  }

  public async show() {
    this.awake();
    if (!this.curtain) {
      return Promise.resolve();
    }
    if (this.bg) this.bg.visible = false;
    if (this.grass) this.grass.visible = false;
    return this.curtain.open();
  }

  public async close() {
    if (!this.curtain) {
      return;
    }
    if (this.bg) this.bg.visible = false;
    if (this.grass) this.grass.visible = false;
    return this.curtain.close();
  }

  public awake(data?: any) {
    this.scale.on("resize", this.checkSize, this);
    this.scene.wake();
  }

  public sleep() {
    if (this.curtain) {
      if (this.bg) this.bg.visible = false;
      if (this.grass) this.grass.visible = false;
      this.curtain.close().then(() => {
        this.scale.off("resize", this.checkSize, this);
        this.scene.sleep();
      });
    } else {
      this.scale.off("resize", this.checkSize, this);
      this.scene.sleep();
    }
  }

  getKey(): string {
    return (this.sys.config as Phaser.Types.Scenes.SettingsConfig).key;
  }

  private checkSize(size: Size) {
    const { width, height } = size;
    if (this.grass) {
      this.grass.x = width * 0.5;
      this.grass.y = height;
    }
    if (this.bg) {
      // this.bg.x = 0; // + this.bg.width * this.bg.originX;
      this.bg.y = (height - 4 * this.mWorld.uiRatio) - this.bg.displayHeight * this.bg.originY;
    }
  }

  private createFont() {
    const element = document.createElement("style");
    document.head.appendChild(element);
    const sheet: CSSStyleSheet = <CSSStyleSheet>element.sheet;
    const styles = "@font-face { font-family: 'Source Han Sans'; src: url('./resources/fonts/otf/SourceHanSansTC-Regular.otf') format('opentype');font-display:swap; }\n";
    const styles2 = "@font-face { font-family: 'tt0173m_'; src: url('./resources/fonts/en/tt0173m_.ttf') format('truetype');font-display:swap }\n";
    const styles3 = "@font-face { font-family: 'tt0503m_'; src: url('./resources/fonts/en/tt0503m_.ttf') format('truetype'); font-display:swap}";
    sheet.insertRule(styles, 0);
    sheet.insertRule(styles2, 0);
    sheet.insertRule(styles3, 0);

  }

}

class Curtain {
  private upDisplay: Phaser.GameObjects.Image;
  private downDisplay: Phaser.GameObjects.Image;
  private upTween: Phaser.Tweens.Tween;
  private downTween: Phaser.Tweens.Tween;
  private readonly key = "curtain";
  constructor(private scene: Phaser.Scene, world: WorldService) {
    this.upDisplay = this.scene.add.image(0, 0, this.key, "up.png").setOrigin(0).setVisible(false).setScale(world.uiScale);
    this.downDisplay = this.scene.add.image(0, 0, this.key, "down.png").setOrigin(0, 1).setVisible(false).setScale(world.uiScale);
  }

  open() {
    this.upDisplay.visible = true;
    this.downDisplay.visible = true;
    return new Promise((resolve, reject) => {
      if (!this.scene.cameras.main) resolve();
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
          this.upDisplay.visible = false;
          this.downDisplay.visible = false;
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
      if (!this.scene.cameras.main) resolve();
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
