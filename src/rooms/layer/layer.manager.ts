import { IRoomManager } from "../room.manager";
import { Room } from "../room";
import { ElementDisplay } from "../display/element.display";

export class LayerManager {

  //================ 背景层
  /**
   * 背景层1(用于鼠标点击移动)
   */
  protected mGroundClickLayer: Phaser.GameObjects.Container;

  /**
    * 背景层2
    */
  protected mUGroundLayer2: Phaser.GameObjects.Container;

  //================舞台层

  /**
   * 舞台地皮层（地块）
   */
  protected mGroundLayer: Phaser.GameObjects.Container;

  /**
   * 舞台地表层（包括角色，物件 ，特效等）
   */
  protected mSurfaceLayer: Phaser.GameObjects.Container;

  /**
   * 舞台大气层
   */
  protected mAtmosphere: Phaser.GameObjects.Container;

  //===============前景层
  /**
   * 对话层
   */
  protected mdialogLayer: Phaser.GameObjects.Container;

  /**
   * tips层
   */
  protected mTipLayer: Phaser.GameObjects.Container;

  //===============UI层

  /**
   * ui层(该层不跟随相机移动)
   */
  protected mUILayer: Phaser.GameObjects.Container;

  private _scene: Phaser.Scene;
  constructor(private roomManager: IRoomManager, scene: Phaser.Scene) {

    this._scene = scene;
    //==========背景层
    this.mGroundClickLayer = this._scene.add.container(0, 0);
    // this.totalLayerList.push(this.mGroundClickLayer);

    this.mUGroundLayer2 = this._scene.add.container(0, 0);

    //==========舞台层
    this.mGroundLayer = this._scene.add.container(0, 0);

    this.mSurfaceLayer = this._scene.add.container(0, 0);

    this.mAtmosphere = this._scene.add.container(0, 0);

    //==========前景层
    this.mdialogLayer = this._scene.add.container(0, 0);

    this.mTipLayer = this._scene.add.container(0, 0)
    //==========UI层
    this.mUILayer = this._scene.add.container(0, 0).setScrollFactor(0);
  }

  public addGround(ele: ElementDisplay) {
    this.mGroundLayer.add(ele);
  }

  public addSurface(ele: ElementDisplay) {
    this.mSurfaceLayer.add(ele);
  }


  private _clearLayer() {
   
  }

  public changeScene() {
    this._clearLayer();
  }

  public dispose() {
    this._clearLayer();
  }

}