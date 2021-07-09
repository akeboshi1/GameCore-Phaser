export class BaseLayer extends Phaser.GameObjects.Container {
  constructor(scene, name, depth) {
    super(scene);
    this.name = name;
    this.setDepth(depth);
  }
  destroy() {
    const list = this.list;
    list.forEach((gameobject) => {
      this.remove(gameobject, true);
    });
    super.destroy();
  }
  sortLayer() {
  }
}
