import { IRoomManager } from "../room.manager";
import { ElementDisplay } from "../display/element.display";
import { Geom } from "phaser";

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

    //==========UI层
    this.mUILayer = this._scene.add.container(0, 0).setScrollFactor(0);
  }

  public addToGround(ele: ElementDisplay | ElementDisplay[]) {
    this.mGroundLayer.add(ele);
  }

  public addToSurface(ele: ElementDisplay | ElementDisplay[]) {
    this.mSurfaceLayer.add(ele);
  }

  public resize(width: number, height: number) {
    // todo 
  }

  public addMouseListen(callBack?: Function) {
    this.mGroundClickLayer.setInteractive(new Geom.Rectangle(0, 0, window.innerWidth, window.innerHeight), Phaser.Geom.Rectangle.Contains);
    if (callBack) callBack(this.mGroundClickLayer)//callBack.apply(null, this.mGroundClickLayer);
  }

  private _clearLayer() {
     this.clearLayer(this.mGroundClickLayer);
     this.clearLayer(this.mGroundLayer);
     this.clearLayer(this.mSurfaceLayer);
     this.clearLayer(this.mUGroundLayer2);
     this.clearLayer(this.mUILayer);
     this.clearLayer(this.mAtmosphere);
  }

  private clearLayer(container: Phaser.GameObjects.Container, destroy: boolean = false) {
    let list: Phaser.GameObjects.GameObject[] = container.list;
    if (list) {
      let len: number = list.length;
      let child: Phaser.GameObjects.GameObject;
      for (let i: number = 0; i < len; i++) {
        child = list[i];
        child.destroy(destroy);
      }
    }
    container.destroy(destroy);
  }

  public changeScene() {
    this._clearLayer();
  }

  public dispose() {
    this._clearLayer();
  }

}