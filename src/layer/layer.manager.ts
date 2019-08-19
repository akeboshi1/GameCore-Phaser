export class LayerManager {
  
  /**
   * 场景交互层
   */
  protected mSceneLayer: Phaser.GameObjects.Container;
  
  /**
   * 场景元素层（包括角色，物件）
   */
  protected mElementLayer: Phaser.GameObjects.Container;

  /**
   * ui层
   */
  protected mUILayer: Phaser.GameObjects.Container;

  /**
   * 对话层
   */
  protected mdialogLayer: Phaser.GameObjects.Container;

  /**
   * tips层
   */
  protected mTipLayer: Phaser.GameObjects.Container;
  constructor(private mScene: Phaser.Scene) {
    this.mSceneLayer = this.mScene.add.container(0, 0);

    this.mElementLayer = this.mScene.add.container(0, 0);

    this.mUILayer = this.mScene.add.container(0, 0);

    this.mdialogLayer = this.mScene.add.container(0, 0);

    this.mTipLayer = this.mScene.add.container(0, 0);
  }
}