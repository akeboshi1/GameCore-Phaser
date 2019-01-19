import {Const} from "../../../common/const/Const";
import {BasicElementAvatar} from "../../../common/avatar/BasicElementAvatar";
import Globals from "../../../Globals";
import {op_gameconfig} from "../../../../protocol/protocols";
import SceneEntity from "../view/SceneEntity";
import {TerrainInfo} from "../../../common/struct/TerrainInfo";
import {BasicTerrainAvatar} from "../../../common/avatar/BasicTerrainAvatar";
import {BasicAvatar} from "../../../base/BasicAvatar";
import {IObjectPool} from "../../../base/pool/interfaces/IObjectPool";

export class TerrainElement  extends SceneEntity {

  protected mAnimationDirty = false;
  protected mScaleX = 1;
  protected myAnimationName: string;

  public constructor(value?: IObjectPool) {
    super(value);
    this.sceneLayerType = Const.SceneConst.SceneLayerTerrain;
  }

  public get terrainInfo(): TerrainInfo {
    return this.data;
  }

  public setAnimation(value: string): void {
    // Log.trace("角度-->"+value);
    this.myAnimationName = value;

    this.invalidAnimation();
  }

  public setScaleX(value: number): void {
    // Log.trace("角度-->"+value);
    this.mScaleX = value;

    this.invalidAnimation();
  }

  public loadModel() {
    (<BasicTerrainAvatar>this.display).loadModel();
  }

  protected invalidAnimation(): void {
    this.mAnimationDirty = true;
  }

  protected get displayPool(): IObjectPool {
    let op = Globals.ObjectPoolManager.getObjectPool("BasicTerrainAvatar");
    return op;
  }

  protected createDisplay() {
    let terrain = this.displayPool.alloc() as BasicTerrainAvatar;
    if (null == terrain) {
      terrain = new BasicTerrainAvatar(Globals.game);
    }
    return terrain;
  }

  protected onUpdating(deltaTime: number): void {
    if (this.mAnimationDirty) {
      this.onAvatarAnimationChanged();
      this.mAnimationDirty = false;
    }

    super.onUpdating(deltaTime);
  }

  public isInScreen(): boolean {
    let _ox = this.ox + (this.baseLoc ? this.baseLoc.x : 0) - Globals.Room45Util.tileWidth;
    let _oy = this.oy + (this.baseLoc ? this.baseLoc.y : 0) - Globals.Room45Util.tileHeight;
    return Globals.Tool.isRectangleOverlap(this.camera.x, this.camera.y,
      this.camera.width, this.camera.height, _ox, _oy, Globals.Room45Util.tileWidth * 3, Globals.Room45Util.tileHeight * 3);
  }

  protected onInitialize() {
    super.onInitialize();
    if (this.display instanceof BasicAvatar) (<BasicAvatar>this.display).setData(this.terrainInfo);
    this.initBaseLoc();
    this.setPosition(this.terrainInfo.x, this.terrainInfo.y, this.terrainInfo.z, true);
    this.loadModel();
    this.setAnimation(this.terrainInfo.animationName);
  }

  public setPosition(x: number, y: number, z?: number, silent: boolean = false): void {
    let p2: Phaser.Point = Globals.Room45Util.tileToPixelCoords(x, y);
    super.setPosition(p2.x, p2.y, z, silent);
  }

  public get quadH(): number {
    return this.collisionArea.height * 3;
  }

  public get quadW(): number {
    return this.collisionArea.width * 3;
  }

  public get quadX(): number {
    return this.collisionArea.ox - this.collisionArea.width;
  }

  public get quadY(): number {
    return this.collisionArea.oy - this.collisionArea.height;
  }

  public get sortX(): number {
    return this.ox;
  }

  public get sortY(): number {
    return this.oy;
  }

  protected onAvatarAnimationChanged(): void {
    (<BasicElementAvatar>this.display).animationName = this.myAnimationName;
    (<BasicElementAvatar>this.display).scaleX = this.mScaleX;
  }

  protected initBaseLoc(): void {
    // 图片坐标
    let config: op_gameconfig.IAnimation = this.terrainInfo.config;
    if (config === null) return;
    let tmp: Array<string> = config.baseLoc.split(",");
    this.baseLoc = new Phaser.Point(+(tmp[0]), +(tmp[1]));
  }
}
