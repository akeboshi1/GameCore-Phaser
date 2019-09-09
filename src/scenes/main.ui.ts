import { Logger } from "../utils/log";

export class MainUIScene extends Phaser.Scene {
  private bg: Phaser.GameObjects.Sprite;
  private btn: Phaser.GameObjects.Sprite;
  private joyStickCon: Phaser.GameObjects.Container;
  private bgRadius: number;
  private fps: Phaser.GameObjects.Text;
  constructor() {
    super({ key: MainUIScene.name });
  }

  public preload() {
    this.load.atlas("joystick", "resources/button.png", "resources/button.json");
  }

  public init(data: any) {
  }

  public create() {
    this.fps = this.add.text(0, 0, "");
    this.bg = this.add.sprite(0, 0, "joystick", "1.png");
    this.bgRadius = this.bg.width >> 1;
    this.btn = this.add.sprite(this.bg.x, this.bg.y, "joystick", "2.png");
    this.btn.setInteractive();
    this.joyStickCon = this.add.container(500, 500);
    this.joyStickCon.add(this.bg);
    this.joyStickCon.add(this.btn);
    this.input.setDraggable(this.btn);
    this.btn.on("drag", this.dragUpdate, this);
    this.btn.on("dragend", this.dragStop, this);
  }

  public update() {
    this.fps.setText(this.game.loop.actualFps.toFixed());
  }

  getKey(): string {
    return (this.sys.config as Phaser.Types.Scenes.SettingsConfig).key;
  }

  private dragUpdate(pointer, dragX, dragY) {
    let d = Math.sqrt(dragX * dragX + dragY * dragY);
    if (d > this.bgRadius) { d = this.bgRadius; }
    const r = Math.atan2(dragY, dragX);
    this.btn.x = Math.cos(r) * d + this.bg.x;
    this.btn.y = Math.sin(r) * d + this.bg.y;
  }

  private dragStop(pointer) {
    this.btn.x = this.bg.x;
    this.btn.y = this.bg.y;
    Logger.log("dragEnd");
  }

}
