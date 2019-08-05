export class Room {
  constructor(private mScene: Phaser.Scene) {
  }

  setScene(scene: Phaser.Scene) {
    this.mScene = scene;
  }
}