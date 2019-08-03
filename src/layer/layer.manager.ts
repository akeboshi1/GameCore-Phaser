export class LayerManager {
  protected mSceneLayer: Phaser.GameObjects.Container;
  protected mUILayer: Phaser.GameObjects.Container;
  protected mdialogLayer: Phaser.GameObjects.Container;
  protected mTipLayer: Phaser.GameObjects.Container;
  constructor(private mScene: Phaser.Scene) { }
  
  public init() {
    this.mSceneLayer = this.mScene.add.container(0, 0);
  
    this.mUILayer = this.mScene.add.container(0, 0);

    this.mdialogLayer = this.mScene.add.container(0, 0);

    this.mTipLayer = this.mScene.add.container(0, 0);
  }
}