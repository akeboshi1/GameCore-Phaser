import { RoomManager } from "../rooms/room.manager";

export enum LayerType {
  GroundClickLayer,
  UGroundLayer,
  GroundLayer,
  SurfaceLayer,
  Atmosphere,
  DialogLayer,
  TipLayer,
  UILayer
}
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

  protected totalLayerList: Map<LayerType, Phaser.GameObjects.Container>;
  private _scene: Phaser.Scene;
  constructor(private roomManager: RoomManager) {

    this.totalLayerList = new Map();
    this._scene = roomManager.scene;
    //==========背景层
    this.mGroundClickLayer = this._scene.add.container(0, 0);
    this.totalLayerList.set(LayerType.GroundClickLayer, this.mGroundClickLayer);
    // this.totalLayerList.push(this.mGroundClickLayer);

    this.mUGroundLayer2 = this._scene.add.container(0, 0);
    this.totalLayerList.set(LayerType.UGroundLayer, this.mUGroundLayer2);

    //==========舞台层
    this.mGroundLayer = this._scene.add.container(0, 0);
    this.totalLayerList.set(LayerType.GroundLayer, this.mGroundLayer);

    this.mSurfaceLayer = this._scene.add.container(0, 0);
    this.totalLayerList.set(LayerType.SurfaceLayer, this.mSurfaceLayer);

    this.mAtmosphere = this._scene.add.container(0, 0);
    this.totalLayerList.set(LayerType.Atmosphere, this.mAtmosphere);

    //==========前景层
    this.mdialogLayer = this._scene.add.container(0, 0);
    this.totalLayerList.set(LayerType.DialogLayer, this.mdialogLayer);

    this.mTipLayer = this._scene.add.container(0, 0)
    this.totalLayerList.set(LayerType.TipLayer, this.mTipLayer);
    //==========UI层
    this.mUILayer = this._scene.add.container(0, 0).setScrollFactor(0);
    this.totalLayerList.set(LayerType.UILayer, this.mUILayer);
  }

  public getLayerByType(type: LayerType): any {
    if (this.totalLayerList) {
      return this.totalLayerList.get(type) || null;
    }
    return null;
  }

  public addToLayerByType(element: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[], type: LayerType) {
    let layer: Phaser.GameObjects.Container = this.totalLayerList.get(type);
    if (layer) {
      layer.add(element);
    }
  }

  public sortLayerByType(type: LayerType) {
    let layer: Phaser.GameObjects.Container = this.totalLayerList.get(type);
    if (layer) {
      layer.sort("depth");
    }
  }

  public removeFromLayerByType(element: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[], type: LayerType, destroyBoo?: boolean) {
    let layer: Phaser.GameObjects.Container = this.totalLayerList.get(type);
    if (layer) {
      layer.remove(element, destroyBoo);
    }
  }

  private _clearLayer() {
    
    let len: number = Array.from(this.totalLayerList).length;
    let layer: Phaser.GameObjects.Container;
    let childLen: number = 0;
    let child: any;
    for (let i: number = 0; i < len; i++) {
      layer = this.totalLayerList[i];
      if (!layer) {
        continue;
      }
      childLen = layer.list.length;
      for (let j: number = 0; j < childLen; j++) {
        child = layer.list[j];
        //todo child.dispose();
      }
      layer.removeAllListeners();
      layer.removeAll(true);
    }
  }

  public changeScene() {
    this._clearLayer();
  }

  public dispose() {
    this._clearLayer();
    this.totalLayerList.clear();
    this.totalLayerList = null;
  }

}