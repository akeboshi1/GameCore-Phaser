import {IAnimatedObject} from "../../../base/IAnimatedObject";
import {Const} from "../../../common/const/Const";
import Globals from "../../../Globals";
import {ITickedObject} from "../../../base/ITickedObject";
import {DrawArea} from "../../../common/struct/DrawArea";
import {ITerrainLayer} from "../view/ITerrainLayer";
import {IRecycleObject} from "../../../base/object/interfaces/IRecycleObject";
import {BasicAvatar} from "../../../base/BasicAvatar";
import {IObjectPool} from "../../../base/pool/interfaces/IObjectPool";

export class BasicTerrainItem extends Phaser.Group implements IAnimatedObject, ITickedObject, IRecycleObject {
  public data: any;
  public itemWidth = 0;
  public itemHeight = 0;
  public camera: Phaser.Camera;
  public walkableArea: DrawArea;
  public collisionArea: DrawArea;
  public mouseOverArea: DrawArea;
  protected mOwner: ITerrainLayer;
  protected mTerrainItemIsLoadInited = false;
  protected mTerrainItemIsLoading = false;
  protected mTerrainItemDisplayObjectCreated = false;
  protected mTerrainItemOutCameraTime = 0;
  protected mTerrainItemIsInCamera = false;
  protected terrainIsoDisplayObject: BasicAvatar;
  protected baseLoc: Phaser.Point;
  protected mTerrainItemDisplayObjectHadCreated = false;

  protected get terrainAvatarPool(): IObjectPool {
    return null;
  }

  public constructor(game: Phaser.Game, owner: ITerrainLayer) {
    super(game);
    this.mOwner = owner;
    this.inputEnableChildren = false;
    this.ignoreChildInput = true;
  }

  protected _ox = 0;

  public get ox(): number {
    return this._ox;
  }

  protected _oy = 0;

  public get oy(): number {
    return this._oy;
  }

  private _oz = 0;

  public get oz(): number {
    return this._oz;
  }

  public get hadCreated(): boolean {
    if (this.mTerrainItemDisplayObjectCreated && this.mTerrainItemDisplayObjectHadCreated === false) {
      this.mTerrainItemDisplayObjectHadCreated = true;
      return true;
    }
    return false;
  }

  public setMouseOverArea(hWidth: number, hHeight: number): void {
    if (this.mouseOverArea === undefined) {
      this.mouseOverArea = new DrawArea("1,1&1,1", 0xFF0000);
      this.mouseOverArea.draw(hWidth, hHeight);
    }
  }

  public triggerMouseOver(value: boolean): void {
    if (value === true) {
      this.mouseOverArea.show();
    } else {
      this.mouseOverArea.hide();
    }
  }

  // Position
  public setPosition(x: number, y: number, z: number): void {
    this._ox = x >> 0;
    this._oy = y >> 0;
    this._oz = z >> 0;
  }

  public onFrame() {
    if (this.mTerrainItemIsInCamera && this.data) {
      this.mTerrainItemOutCameraTime = 0;

      if (!this.mTerrainItemDisplayObjectCreated) {
        this.onTerrainItemCreate();
        this.mTerrainItemDisplayObjectCreated = true;
      } else {
        if (!this.mTerrainItemIsLoadInited) {
          if (this.mOwner.isValidLoad()) {
            this.onTerrainItemLoad();

            this.mTerrainItemIsLoadInited = true;
            this.mTerrainItemIsLoading = true;
          }
        }
      }
      let p3 = Globals.Room45Util.p2top3(this.ox + (this.baseLoc ? this.baseLoc.x : 0), this.oy + (this.baseLoc ? this.baseLoc.y : 0), this.oz);
      if (this.terrainIsoDisplayObject) {
        this.terrainIsoDisplayObject.isoX = p3.x;
        this.terrainIsoDisplayObject.isoY = p3.y;
        this.terrainIsoDisplayObject.isoZ = p3.z;
      }
      this.visible = true;
    } else {
      this.visible = false;
    }
  }

  public onTick(deltaTime: number): void {
    this.mTerrainItemIsInCamera = Globals.Tool.isRectangleOverlap(this.camera.x, this.camera.y,
      this.camera.width, this.camera.height, this.ox - this.itemWidth / 2, this.oy, this.itemWidth, this.itemHeight);
    if (!this.mTerrainItemIsInCamera) {
      this.mTerrainItemOutCameraTime += deltaTime;
      if (this.mTerrainItemOutCameraTime > Const.GameConst.OUT_OF_CAMERA_RELEASE_WAITE_TIME) {
        this.mTerrainItemOutCameraTime = 0;

        this.releaseTerrainItem();

        this.mTerrainItemDisplayObjectCreated = false;
        this.mTerrainItemIsLoading = false;
      }
    }
  }

  public onClear(): void {
    if (this.terrainIsoDisplayObject) {
      this.terrainIsoDisplayObject.onClear();
    }
    this.releaseTerrainItem();
    this.data = null;
  }

  public onDispose() {
    if (this.terrainIsoDisplayObject) {
      this.terrainIsoDisplayObject.onDispose();
    }
    this.releaseTerrainItem();
    this.data = null;
  }

  protected releaseTerrainItem(): void {
    if (this.mTerrainItemDisplayObjectCreated) {
      this.mTerrainItemDisplayObjectCreated = false;

      this.remove(this.terrainIsoDisplayObject);
      this.terrainAvatarPool.free(this.terrainIsoDisplayObject);
      this.terrainIsoDisplayObject = null;

      if (this.mTerrainItemIsLoading) {
        this.mTerrainItemIsLoading = false;
        this.mOwner.decreaseLoadCount();
      }

      this.mTerrainItemIsLoadInited = false;
      this.mTerrainItemOutCameraTime = 0;

      this.visible = false;
    }
  }

  protected onTerrainItemCreate() {
    this.add(this.terrainIsoDisplayObject);
  }

  protected onTerrainItemLoad() {
    this.mOwner.increaseLoadCount();
  }

  protected onTerrainItemLoadComplete() {
    this.mOwner.decreaseLoadCount();
    this.mTerrainItemIsLoading = false;
  }



  public onRecycle(): void {
  }
}
