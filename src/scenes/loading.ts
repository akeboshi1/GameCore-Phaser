import { WorldService } from "../game/world.service";
import { IRoomService } from "../rooms/room";
import { Size } from "../utils/size";
import { World } from "../game/world";
import { Url } from "../utils/resUtil";
const LOGO_MARGIN = 25;

export class LoadingScene extends Phaser.Scene {
  private mWorld: WorldService;
  private mRoom: IRoomService;
  private lo: Phaser.GameObjects.Sprite;
  private bg: Phaser.GameObjects.Graphics;
  private mRequestCom: boolean = false;
  constructor() {
    super({ key: LoadingScene.name });
  }

  public preload() {
    // atlas可以用于webgl渲染，和canvas渲染，spritesheet只能用于canvas
    this.load.atlas("loading", Url.getRes("loading.png"), Url.getRes("loading.json"));
    // this.load.spritesheet("rabbit00.png", "./resources/rabbit00.png", { frameWidth: 150, frameHeight: 150 });
  }

  public init(data: any) {
    this.mWorld = data.world;
    this.mRoom = data.room;
    this.mRequestCom = false;
  }

  public create() {
    if (this.mRoom) this.mRoom.startLoad();
    const width = this.scale.gameSize.width;
    const height = this.scale.gameSize.height;
    this.bg = this.add.graphics();
    this.bg.fillStyle(0x616161);
    this.bg.fillRect(0, 0, width, height);
    const framesObj: {} = this.textures.get("loading").frames;
    const tmpFrames: any[] = [];
    for (const key in framesObj) {
      if (key === "__BASE") continue;
      const frame = framesObj[key];
      if (!frame) continue;
      tmpFrames.push(key);
    }
    // 手动把json配置中的frames给予anims
    this.anims.create({
      key: "loading_anmis",
      frames: this.anims.generateFrameNumbers("loading", { start: 0, end: 59, frames: tmpFrames }),
      frameRate: 33,
      yoyo: true,
      repeat: -1
    });
    this.lo = this.add.sprite(0, 0, "loading");
    this.scale.on("resize", this.checkSize, this);
    this.lo.play("loading_anmis");
    this.checkSize(new Size(width, height));
  }

  update(time: number, delta: number) {
    // if (this.cameras.main) {
    //   this.cameras.main.emit("renderer", this.cameras.main);
    // }
    if (this.mRoom) {
      if (this.mRoom.world.clock.clockSync && !this.mRequestCom) {
        this.mRequestCom = true;
        this.mRoom.completeLoad();
      }
      // this.mRoom.updateClock(time, delta);
    }
  }

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
    const width: number = size.width;
    const height: number = size.height;
    this.bg.clear();
    this.bg.fillStyle(0x616161);
    this.bg.fillRect(0, 0, width, height);
    if (this.mWorld.game.device.os.desktop) {
      this.lo.x = width - (150 + LOGO_MARGIN) * this.mWorld.uiScale;
      this.lo.y = height - (150 + LOGO_MARGIN) * this.mWorld.uiScale;
    } else {
      this.lo.x = (width - this.lo.width >> 1) + 100;
      this.lo.y = (height - this.lo.height >> 1) + 100;
    }
    // this.lo.scaleX = this.lo.scaleY = this.mWorld.uiScale;
  }

}
