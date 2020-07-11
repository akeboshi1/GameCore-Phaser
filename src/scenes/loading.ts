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
    if (this.mRoom) this.mRoom.startLoad();
    const width = this.scale.gameSize.width;
    const height = this.scale.gameSize.height;
    this.bg = this.add.image(width / 2, height / 2, "loading_bg");
    this.bg.scale = this.mWorld.uiScale;
    this.lo = this.add.sprite(0, 0, "loading");
    // this.lo.setScale(this.mWorld.uiScale);
    this.scale.on("resize", this.checkSize, this);
    // 手动把json配置中的frames给予anims
    const frames = this.anims.generateFrameNames("loading", { prefix: "loading_", start: 1, end: 59, zeroPad: 3, suffix: ".png" });
    try {
      this.anims.create({
        key: "loading_anmis",
        frames,
        frameRate: 16,
        yoyo: false,
        repeat: -1
      });
      this.lo.play("loading_anmis");
    } catch (error) {
      Logger.getInstance().warn("anims", error);
    }
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
