import { RoomManager } from "../rooms/room.manager";

export enum LAYERTYPE {
  UGROUND1LAYER,
  UGROUND2LAYER,
  GROUNDLAYER,
  SURFACELAYER,
  ATMOSPHERE,
  DIALOGLAYER,
  TIPLAYER,
  UILAYER
}
export class LayerManager {

  //================ 背景层
  /**
   * 背景层1
   */
  protected mUGroundLayer1: Phaser.GameObjects.Container;

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

  protected totalLayerList: Phaser.GameObjects.Container[];
  private _scene: Phaser.Scene;
  constructor(private roomManager: RoomManager) {

    this.totalLayerList = [];
    this._scene = roomManager.scene;
    //==========背景层
    this.mUGroundLayer1 = this._scene.add.container(0, 0);
    this.totalLayerList.push(this.mUGroundLayer1);

    this.mUGroundLayer2 = this._scene.add.container(0, 0);
    this.totalLayerList.push(this.mUGroundLayer2);

    //==========舞台层
    this.mGroundLayer = this._scene.add.container(0, 0);
    this.totalLayerList.push(this.mGroundLayer);

    this.mSurfaceLayer = this._scene.add.container(0, 0);
    this.totalLayerList.push(this.mSurfaceLayer);

    this.mAtmosphere = this._scene.add.container(0, 0);
    this.totalLayerList.push(this.mAtmosphere);

    //==========前景层
    this.mdialogLayer = this._scene.add.container(0, 0);
    this.totalLayerList.push(this.mdialogLayer);

    this.mTipLayer = this._scene.add.container(0, 0)
    this.totalLayerList.push(this.mTipLayer);

    //==========UI层
    this.mUILayer = this._scene.add.container(0, 0).setScrollFactor(0);
    this.totalLayerList.push(this.mUILayer);
  }

  public getLayerByType(type: number): any {
    return this.totalLayerList[type] || null;
  }

  public addToLayerByType(element: any, type: number) {
    let layer: Phaser.GameObjects.Container = this.totalLayerList[type];
    layer.add(element);
  }

  public sortLayerByType(type: number) {
    let layer: Phaser.GameObjects.Container = this.totalLayerList[type];
    if (layer) {
      layer.sort("depth");
    }
  }

  public removeFromLayerByType(element: any, type: number, destroyBoo?: boolean) {
    let layer: Phaser.GameObjects.Container = this.totalLayerList[type];
    if (layer) {
      layer.remove(element, destroyBoo);
    }
  }

  private _clearLayer() {
    let len: number = this.totalLayerList.length;
    let layer: Phaser.GameObjects.Container;
    let childLen: number = 0;
    let child: any;
    for (let i: number = 0; i < len; i++) {
      layer = this.totalLayerList[i];
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
    this.totalLayerList.length = 0;
    this.totalLayerList = null;
  }

}