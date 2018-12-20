import {IAnimatedObject} from "../../../base/IAnimatedObject";
import {Const} from "../../../common/const/Const";
import {TerrainSceneLayer} from "../view/TerrainSceneLayer";
import Globals from "../../../Globals";
import {GameConfig} from "../../../GameConfig";
import {IDisposeObject} from "../../../base/IDisposeObject";
import {ITickedObject} from "../../../base/ITickedObject";
import {IQuadTreeNode} from "../../../base/ds/IQuadTreeNode";
import {DrawArea} from "../../../common/struct/DrawArea";
import IsoSprite = Phaser.Plugin.Isometric.IsoSprite;

export class BasicTerrainItem extends Phaser.Group implements IAnimatedObject, IDisposeObject, ITickedObject, IQuadTreeNode {
  public data: any;
  public ox = 0;
  public oy = 0;
  public oz = 0;
  public itemWidth = 0;
  public itemHeight = 0;
  public camera: Phaser.Camera;
  public walkableArea: DrawArea;
  public collisionArea: DrawArea;
  protected mOwner: TerrainSceneLayer;
  protected mTerrainItemIsLoadInited = false;
  protected mTerrainItemIsLoading = false;
  protected mTerrainItemDisplayObjectCreated = false;
  protected mTerrainItemOutCameraTime = 0;
  protected mTerrainItemIsInCamera = false;
  protected terrainIsoDisplayObject: IsoSprite;
  protected baseLoc: Phaser.Point;
  protected mTerrainItemDisplayObjectHadCreated = false;

  public constructor(game: Phaser.Game, owner: TerrainSceneLayer) {
    super(game);
    this.mOwner = owner;
  }

  public get hadCreated(): boolean {
    if (this.mTerrainItemDisplayObjectCreated && !this.mTerrainItemDisplayObjectHadCreated) {
       this.mTerrainItemDisplayObjectHadCreated  = true;
       return true;
    }
    return false;
  }

  public get display(): any {
    return this.terrainIsoDisplayObject;
  }

  public get quadH(): number {
    return this.collisionArea.height;
  }

  public get quadW(): number {
    return this.collisionArea.width;
  }

  public get quadX(): number {
    return this.collisionArea.ox;
  }

  public get quadY(): number {
    return this.collisionArea.oy;
  }

  public setWalkableArea(value: string, orgin: Phaser.Point, hWidth: number, hHeight: number): void {
    if (this.walkableArea === undefined) {
      this.walkableArea = new DrawArea(value, 0x00FF00, orgin);
    }
    this.walkableArea.draw(hWidth, hHeight);
  }

  public setCollisionArea(value: string, orgin: Phaser.Point, hWidth: number, hHeight: number): void {
    if (this.collisionArea === undefined) {
      this.collisionArea = new DrawArea(value, 0xFF0000, orgin);
    }
    this.collisionArea.draw(hWidth, hHeight);
  }

  public onFrame(deltaTime: number) {
    this.mTerrainItemIsInCamera = Globals.Tool.isRectangleOverlap(this.camera.x, this.camera.y,
      this.camera.width, this.camera.height, this.ox - this.itemWidth / 2, this.oy, this.itemWidth, this.itemHeight);
    if (this.mTerrainItemIsInCamera || GameConfig.isEditor) {
      this.mTerrainItemOutCameraTime = 0;

      if (!this.mTerrainItemDisplayObjectCreated) {
        this.onTerrainItemCreate();
        let p3 = Globals.Room45Util.p2top3(this.ox + (this.baseLoc ? this.baseLoc.x : 0), this.oy + (this.baseLoc ? this.baseLoc.y : 0), this.oz);
        if (this.terrainIsoDisplayObject) {
          this.terrainIsoDisplayObject.isoX = p3.x;
          this.terrainIsoDisplayObject.isoY = p3.y;
          this.terrainIsoDisplayObject.isoZ = p3.z;
        }
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
      this.visible = true;
    } else {
      this.mTerrainItemOutCameraTime += deltaTime;
      if (this.mTerrainItemOutCameraTime > Const.GameConst.OUT_OF_CAMERA_RELEASE_WAITE_TIME) {
        this.mTerrainItemOutCameraTime = 0;

        this.releaseTerrainItem();

        this.mTerrainItemDisplayObjectCreated = false;
        this.mTerrainItemIsLoading = false;
      }

      this.visible = false;
    }
  }

  public onTick(deltaTime: number): void {
  }

  public releaseTerrainItem() {
    if (this.mTerrainItemDisplayObjectCreated) {
      this.mTerrainItemDisplayObjectCreated = false;

      this.remove(this.terrainIsoDisplayObject);
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

  public onDispose() {
    this.releaseTerrainItem();
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
}
