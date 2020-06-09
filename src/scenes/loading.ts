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
    if (this.game.device.os.desktop === false) {
      this.load.image("loading_bg", Url.getUIRes(dpr, "loading/loading_bg.jpeg"));
    }
    this.load.atlas("loading", Url.getUIRes(dpr, "loading/loading.png"), Url.getUIRes(dpr, "loading/loading.json"));
    this.load.script("webfont", "./resources/scripts/webfont/1.6.26/webfont.js");
    // this.load.spritesheet("rabbit00.png", "./resources/rabbit00.png", { frameWidth: 150, frameHeight: 150 });
  }

  public init(data: any) {
    const element = document.createElement("style");
    document.head.appendChild(element);
    const sheet: CSSStyleSheet = <CSSStyleSheet> element.sheet;

    const styles = "@font-face { font-family: 'Source Han Sans'; src: url('./resources/fonts/otf/SourceHanSansTC-Regular.otf') format('opentype'); }\n";
    sheet.insertRule(styles, 0);

    this.mWorld = data.world;
    this.mRoom = data.room;
    this.mRequestCom = false;

    this.mCallback = data.callBack;
  }

  public create() {
    try {
      WebFont.load({
        custom: {
          families: [ "Source Han Sans" ]
        },
      });
    } catch (error) {
      Logger.getInstance().warn("webfont failed to load");
    }
    if (this.mRoom) this.mRoom.startLoad();
    const width = this.scale.gameSize.width;
    const height = this.scale.gameSize.height;
    // this.bg = this.add.graphics();
    // this.bg.fillStyle(0x616161);
    // this.bg.fillRect(0, 0, width, height);
    // const framesObj: {} = this.textures.get("loading").frames;
    // const tmpFrames: any[] = [];
    // for (const key in framesObj) {
    //   if (key === "__BASE") continue;
    //   const frame = framesObj[key];
    //   if (!frame) continue;
    //   tmpFrames.push(key);
    // }
    // 手动把json配置中的frames给予anims
    this.anims.create({
      key: "loading_anmis",
      // frames: this.anims.generateFrameNumbers("loading", { start: 0, end: 59, frames: tmpFrames }),
      frames: this.anims.generateFrameNames("loading", { prefix: "loading_", start: 1, end: 59, zeroPad: 3, suffix: ".png" }),
      frameRate: 16,
      yoyo: false,
      repeat: -1
    });
    this.bg = this.add.image(width / 2, height / 2, "loading_bg");
    this.bg.scale = this.mWorld.uiScale;
    this.lo = this.add.sprite(0, 0, "loading");
    // this.lo.setScale(this.mWorld.uiScale);
    this.scale.on("resize", this.checkSize, this);
    this.lo.play("loading_anmis");

    this.checkSize(new Size(width, height));
    if (this.mCallback) {
      this.mCallback.call(this, this);
      this.mCallback = undefined;
    }
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

  public awake() {
    this.scale.on("resize", this.checkSize, this);
    this.scene.wake();
  }

  public sleep() {
    this.scale.off("resize", this.checkSize, this);
    this.scene.sleep();
  }

  getKey(): string {
    return (this.sys.config as Phaser.Types.Scenes.SettingsConfig).key;
  }

  private checkSize(size: Size) {
    const { width, height } = size;
    this.lo.x = width / 2;
    this.lo.y = height / 2;
  }

}
