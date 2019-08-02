export class PlayerDisplay extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene) {
    super(scene);
    this.init();
  }

  protected init() {
    const armatureDisplay = this.scene.add.armature("Armature", "bones_human01");
    armatureDisplay.animation.play("idle");

    armatureDisplay.x = this.scene.cameras.main.centerX;
    armatureDisplay.y = this.scene.cameras.main.centerY + 200;
  }
}