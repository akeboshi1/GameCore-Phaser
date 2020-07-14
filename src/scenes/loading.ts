import { WorldService } from "../game/world.service";
import { IRoomService } from "../rooms/room";
import { Size } from "../utils/size";
import { Url } from "../utils/resUtil";
import { Logger } from "../utils/log";
import { BasicScene } from "./basic.scene";

export class LoadingScene extends BasicScene {
  private mWorld: WorldService;
  private mRoom: IRoomService;
  private lo: Phaser.GameObjects.Sprite;
  private bg: Phaser.GameObjects.Image;
  private mCallback: Function;
  private curtain: Curtain;
  private mRequestCom: boolean = false;
  private graphicsMask: Phaser.GameObjects.Graphics;
  private maskRadius: number = 10;
  private tweenStart: Phaser.Tweens.Tween;
  private awakeCallBack: Function;
  private sleepCallBack: Function;
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
    if (this.game.device.os.desktop === false) {
      this.load.image("loading_bg", Url.getUIRes(dpr, "loading/loading_bg.jpeg"));
    }
    this.load.atlas("curtain", Url.getUIRes(dpr, "loading/curtain.png"), Url.getUIRes(dpr, "loading/curtain.json"));
    this.load.atlas("loading", Url.getUIRes(dpr, "loading/loading.png"), Url.getUIRes(dpr, "loading/loading.json"));
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

    // const rect = this.add.graphics();
    // rect.fillStyle(0xFF9900);
    // rect.fillRect(0, 0, 1080, 1920);
    // if (this.mRoom) this.mRoom.startLoad();
    const width = this.scale.gameSize.width;
    const height = this.scale.gameSize.height;
    // 手动把json配置中的frames给予anims
    this.anims.create({
      key: "loading_anmis",
      // frames: this.anims.generateFrameNumbers("loading", { start: 0, end: 59, frames: tmpFrames }),
      frames: this.anims.generateFrameNames("loading", { prefix: "loading_", start: 1, end: 3, zeroPad: 1, suffix: ".png" }),
      frameRate: 4,
      yoyo: true,
      repeat: -1
    });

    this.lo = this.add.sprite(0, height, "loading").setOrigin(0.5, 1).setScale(this.mWorld.uiScale);
    // this.lo.setScale(this.mWorld.uiScale);
    this.scale.on("resize", this.checkSize, this);
    this.lo.play("loading_anmis");

    this.bg = this.add.image(0, 0, "loading", "bear.png");

    this.curtain = new Curtain(this, this.mWorld);
    // this.curtain.open().then(() => {
    this.bg.x = 0;
    this.add.tween({
      targets: this.bg,
      props: { x: width, rotation: -720 },
      duration: 2000,
      loop: -1
    });
    // });

    this.checkSize(new Size(width, height));
    if (this.mCallback) {
      this.mCallback.call(this, this);
      this.mCallback = undefined;
    }
    this.tweenStart = this.tweens.add({
      targets: this.graphicsMask,
      duration: 1000,
      ease: "Linear",
      props: {
        rotation: 360,
      },
      onUpdate: (tween, targets, element) => {
        this.updateTween(true);
      }
    });
    // this.mLoadingManager.startup();
  }

  // update() {
  // if (this.mRoom) {
  //   if (this.mRoom.world.clock.clockSync && !this.mRequestCom) {
  //     this.mRequestCom = true;
  //     this.mRoom.completeLoad();
  //   }
  // }
  // }

  public async show() {
    this.awake();
    // return new Promise((resolve, reject) => {
    if (!this.curtain) {
      return Promise.resolve();
    }
    this.bg.visible = false;
    this.lo.visible = false;
    await this.curtain.open();
    return Promise.resolve();
    // });
  }

  public async close() {
    if (!this.curtain) {
      return;
    }
    this.bg.visible = false;
    this.lo.visible = false;
    await this.curtain.close();
    return Promise.resolve();
  }

  public awake(data?: any) {
      this.scale.on("resize", this.checkSize, this);
      this.scene.wake();
  }

  public sleep() {
    this.bg.visible = false;
    this.lo.visible = false;
    if (this.curtain) {
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

  private updateTween(show: boolean) {
    if (this.graphicsMask) {
      const pad: number = show ? 100 : -100;
      this.graphicsMask.clear();
      this.maskRadius += pad;
      this.graphicsMask.fillStyle(0xffcc00);
      this.graphicsMask.fillCircle(0, 0, this.maskRadius);
      if ((this.maskRadius <= 0 && !show) || (this.maskRadius > this.scale.gameSize.width + 20 && show)) {
        if (this.tweenStart) {
          this.tweenStart.stop();
          this.tweenStart.remove();
          this.tweenStart = null;
        }
        if (this.sleepCallBack) {
          this.sleepCallBack();
        }
      }
    }
  }

  private checkSize(size: Size) {
    const { width, height } = size;
    this.lo.x = width * 0.5;
    this.lo.y = height;

    this.bg.x = 0; // + this.bg.width * this.bg.originX;
    this.bg.y = (height - 4 * this.mWorld.uiRatio) - this.bg.height * this.bg.originY ;
  }

  private createFont() {
    const element = document.createElement("style");
    document.head.appendChild(element);
    const sheet: CSSStyleSheet = <CSSStyleSheet>element.sheet;
   // const styles = "@font-face { font-family: 'Source Han Sans'; src: url('./resources/fonts/otf/SourceHanSansTC-Regular.otf') format('opentype');font-display:swap; }\n";
    const styles2 = "@font-face { font-family: 'tt0173m_'; src: url('./resources/fonts/en/tt0173m_.ttf') format('truetype');font-display:swap }\n";
    const styles3 = "@font-face { font-family: 'tt0503m_'; src: url('./resources/fonts/en/tt0503m_.ttf') format('truetype'); font-display:swap}";
   // sheet.insertRule(styles, 0);
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
      const height = this.scene.cameras.main.height;
      if (!this.scene.cameras.main) resolve();
      this.upDisplay.y = -this.upDisplay.displayHeight;
      this.downDisplay.y = height + this.downDisplay.displayHeight;
      this.upTween = this.scene.add.tween({
        targets: this.upDisplay,
        props: { y: 0 },
        duration: 1000
      });
      this.downTween = this.scene.add.tween({
        targets: this.downDisplay,
        props: {y: height },
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
        props: {y: height + this.downDisplay.displayHeight },
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
