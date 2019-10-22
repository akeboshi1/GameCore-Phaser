import { WorldService } from "../game/world.service";
import { IRoomService } from "../rooms/room";
import { Size } from "../utils/size";
import { World } from "../game/world";
const LOGO_MARGIN = 25;

export class LoadingScene extends Phaser.Scene {
  private mWorld: WorldService;
  private mRoom: IRoomService;
  private mCallBack: Function;
  private mStartBack: Function;
  private lo: Phaser.GameObjects.Sprite;
  private bg: Phaser.GameObjects.Graphics;
  constructor() {
    super({ key: LoadingScene.name });
  }

  public preload() {
    this.load.spritesheet("rabbit00.png", "./resources/rabbit00.png", { frameWidth: 150, frameHeight: 150 });
  }

  public init(data: any) {
    this.mWorld = data.world;
    this.mRoom = data.room;
    this.mStartBack = data.startBack;
    this.mCallBack = data.callBack;
  }

  public create() {
    if (this.mStartBack) this.mStartBack();
    const width = this.scale.gameSize.width;
    const height = this.scale.gameSize.height;
    this.bg = this.add.graphics();
    this.bg.fillStyle(0x616161);
    this.bg.fillRect(0, 0, width, height);
    this.anims.create({
      key: "loading_rabbit00",
      frames: this.anims.generateFrameNumbers("rabbit00.png", { start: 0, end: 59 }),
      frameRate: 33,
      yoyo: true,
      repeat: -1
    });
    const x: number = width - 150 - LOGO_MARGIN;
    const y: number = height - 150 - LOGO_MARGIN;
    this.lo = this.add.sprite(x, y, "rabbit00.png");
    this.lo.anims.play("loading_rabbit00");
    this.lo.scaleX = this.lo.scaleY = this.mWorld.uiScale;
    this.scale.on("orientationchange", this.checkOriention, this);
    this.scale.on("resize", this.checkSize, this);
    this.mWorld.emitter.on(World.SCALE_CHANGE, this.scaleChange, this);
  }

  update(time: number, delta: number) {
    // if (this.cameras.main) {
    //   this.cameras.main.emit("renderer", this.cameras.main);
    // }
    if (this.mRoom) {
      if (this.mRoom.clockSyncComplete && this.mCallBack) this.mCallBack();
      this.mRoom.updateClock(time, delta);
    }
  }

  public awake() {
    this.scene.wake();
  }

  public sleep() {
    this.scene.sleep();
  }

  getKey(): string {
    return (this.sys.config as Phaser.Types.Scenes.SettingsConfig).key;
  }

  private scaleChange() {
    this.lo.scaleX = this.lo.scaleY = this.mWorld.uiScale;
  }

  private checkOriention(orientation) {
    if (orientation === Phaser.Scale.PORTRAIT) {

    } else if (orientation === Phaser.Scale.LANDSCAPE) {

    }
    this.checkSize(this.mWorld.getSize());
  }

  private checkSize(size: Size) {
    const width: number = size.width;
    const height: number = size.height;
    this.bg.clear();
    this.bg.fillStyle(0x616161);
    this.bg.fillRect(0, 0, width, height);
    this.lo.x = width - 150 - LOGO_MARGIN;
    this.lo.y = height - 150 - LOGO_MARGIN;
    this.lo.scaleX = this.lo.scaleY = this.mWorld.uiScale;
  }

}
