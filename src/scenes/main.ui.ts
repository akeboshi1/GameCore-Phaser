export class MainUIScene extends Phaser.Scene {
  private fps: Phaser.GameObjects.Text;
  constructor() {
    super({ key: MainUIScene.name });
  }

  public preload() { }

  public create() {
    this.fps = this.add.text(0, 0, "");
  }

  public update() {
    this.fps.setText(this.game.loop.actualFps.toFixed());
  }
}
