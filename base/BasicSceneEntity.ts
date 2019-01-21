import {ITickedObject} from "./ITickedObject";
import {IAnimatedObject} from "./IAnimatedObject";
import {Const} from "../common/const/Const";
import Globals from "../Globals";
import {BasicAvatar} from "./BasicAvatar";
import {IEntityComponent} from "./IEntityComponent";
import {SceneBasic} from "../modules/Scene/view/SceneBasic";
import {op_client} from "../../protocol/protocols";
import {IQuadTreeNode} from "./ds/IQuadTreeNode";
import {DrawArea} from "../common/struct/DrawArea";
import {IDisposeObject} from "./object/interfaces/IDisposeObject";
import {IObjectPool} from "./pool/interfaces/IObjectPool";
import {RecycleObject} from "./object/base/RecycleObject";

export class BasicSceneEntity extends RecycleObject implements ITickedObject, IAnimatedObject, IQuadTreeNode {
  public uid: number;
  public elementTypeId = 0;
  public sceneLayerType: number = Const.SceneConst.SceneLayerMiddle;
  public isValidDisplay = false;
  public data: any;
  public display: any;
  public scene: SceneBasic;
  public camera: Phaser.Camera;
  public walkableArea: DrawArea;
  public collisionArea: DrawArea;

  public positionDirty = false;
  protected baseLoc: Phaser.Point;
  protected isNeedSort = true;

  private mInitilized = false;

  public constructor(value?: IObjectPool) {
    super(value);
  }

  public get needSort(): boolean {
    return this.isNeedSort;
  }

  protected _ox = 0;

  public get ox(): number {
    return this._ox;
  }

  public set ox(x: number) {
    this._ox = x;
  }

  protected _oy = 0;

  public get oy(): number {
    return this._oy;
  }

  public set oy(y: number) {
    this._oy = y;
  }

  private _oz = 0;

  public get oz(): number {
    return this._oz;
  }

  public get initilized(): boolean {
    return this.mInitilized;
  }

  public get key(): any {
    return this.uid;
  }

  public get sortX(): number {
    return this.ox + (this.collisionArea.width >> 1);
  }

  public get sortY(): number {
    return this.oy + (this.collisionArea.height >> 1);
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

  public moveToTarget(value: op_client.IMoveData): void {
  }

  public moveStopTarget(value: op_client.IMovePosition): void {
  }

  public setPosition(x: number, y: number, z?: number, silent: boolean = false): void {
    // Log.trace("[x,y,z]", x, y, z);
    this._ox = x;
    this._oy = y;
    this._oz = z || 0;
    if (this.collisionArea) {
      this.collisionArea.setPosition(x, y, z);
    }
    if (!silent) {
      this.positionDirty = true;
    }
  }

  public isInScreen(): boolean {
    return Globals.Tool.isRectangleOverlap(this.camera.x, this.camera.y,
      this.camera.width, this.camera.height, this.ox, this.oy, Const.GameConst.DEFAULT_VISIBLE_TEST_RADIUS, Const.GameConst.DEFAULT_VISIBLE_TEST_RADIUS);
  }

  public initPosition(): void {
    this.setPosition(this.data.x, this.data.y, this.data.z);
  }

  public initialize(): void {
    if (!this.mInitilized) {
      this.onInitialize();
      this.mInitilized = true;
      this.onInitializeCompleted();
    }
  }

  public updateByData(data: any = null): void {
    if (!this.mInitilized) return;

    this.data = data;

    this.onUpdateByData();
  }

  public onDispose(): void {
    if (!this.initilized) {
      return;
    }
    this.mInitilized = false;
    this.isValidDisplay = false;
    if ((this.display as IDisposeObject).onDispose !== undefined) (<IDisposeObject>this.display).onDispose();
  }

  public onClear(): void {
    if (!this.initilized) {
      return;
    }
    this.mInitilized = false;
    this.isValidDisplay = false;
    this.displayPool.free(this.display);
    this.display = null;
  }

  protected get displayPool(): IObjectPool {
    return null;
  }

  public onTick(deltaTime: number): void {
    // Log.trace("更新-->", deltaTime);
    this.onPreUpdate(deltaTime);
    this.onUpdating(deltaTime);
    // may remove is the updating.
    if (this.scene) {
      this.onUpdated(deltaTime);
    }
  }

  public onFrame(): void {
    if (this.isValidDisplay) {
      this.onUpdatingDisplay();
    }
  }

  protected onInitialize(): void {
    if (!this.display) this.display = this.createDisplay();

    if (this.display instanceof BasicAvatar) (<BasicAvatar>this.display).initialize();
    if ((this.display as IEntityComponent).setOwner !== undefined) (<IEntityComponent>this.display).setOwner(this);
  }

  protected onInitializeCompleted(): void {
  }

  protected createDisplay(): any {
    let d: BasicAvatar = new BasicAvatar(Globals.game);
    return d;
  }

  protected onUpdateByData(): void {
  }

  protected onPreUpdate(deltaTime: number): void {
  }

  protected onUpdating(deltaTime: number): void {
  }

  protected onUpdated(deltaTime: number): void {
    this.checkIsValidDisplayAvatar();
  }

  protected checkIsValidDisplayAvatar(): void {
    this.isValidDisplay = this.isInScreen();
  }

  protected onUpdatingDisplay(): void {
    let p3 = Globals.Room45Util.p2top3(this.ox + (this.baseLoc ? this.baseLoc.x : 0), this.oy + (this.baseLoc ? this.baseLoc.y : 0), this.oz);

    this.display.isoX = p3.x;
    this.display.isoY = p3.y;
    this.display.isoZ = p3.z;

    if ((this.display as IAnimatedObject).onFrame !== undefined) (<IAnimatedObject>this.display).onFrame();
  }
}
