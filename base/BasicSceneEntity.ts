import {ITickedObject} from "./ITickedObject";
import {IAnimatedObject} from "./IAnimatedObject";
import {Const} from "../common/const/Const";
import Globals from "../Globals";
import {BasicAvatar} from "./BasicAvatar";
import {IEntityComponent} from "./IEntityComponent";
import Point = Phaser.Point;
import {SceneBasic} from "../modules/Scene/view/SceneBasic";
import {op_client} from "../../protocol/protocols";
import {Log} from "../Log";

export class BasicSceneEntity implements ITickedObject, IAnimatedObject {
  public uid: number;
  public elementTypeId = 0;
  public sceneLayerType: number = Const.SceneConst.SceneLayerMiddle;

  public isValidDisplay = false;

  public data: any;
  public display: any;
  public scene: SceneBasic;
  public camera: Phaser.Camera;
  public isNeedSort = true;
  private mInitilized = false;

  public constructor() {
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

  public get initilized(): boolean {
    return this.mInitilized;
  }

  public get key(): any {
    return this.uid;
  }

  public get gridPos(): Point {
    let temp = Globals.Room45Util.p3top2(this._ox, this._oy, this._oz);
    let point: Point = Globals.Room45Util.pixelToTileCoords(temp.x, temp.y);
    return point;
  }

  public get needSort(): boolean {
    return this.isValidDisplay && this.isNeedSort;
  }

  public moveToTarget(value: op_client.IMoveData): void {
  }

  public moveStopTarget(value: op_client.IMovePosition): void {
  }

  // Position
  public setPosition(x: number, y: number, z: number): void {
    // Log.trace("[x,y,z]", x, y, z);
    this._ox = x >> 0;
    this._oy = y >> 0;
    this._oz = z >> 0;
  }

  public isInScreen(): boolean {
    // let p2 = Globals.Room45Util.p3top2(this._ox, this._oy, this._oz);
    return Globals.Tool.isRectangleOverlap(this.camera.x, this.camera.y,
      this.camera.width, this.camera.height, this._ox - Const.GameConst.DEFAULT_VISIBLE_TEST_RADIUS / 2, this._oy, Const.GameConst.DEFAULT_VISIBLE_TEST_RADIUS, Const.GameConst.DEFAULT_VISIBLE_TEST_RADIUS);
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

  public dispose(): void {
    this.isValidDisplay = false;
    if (this.display) {
      if (this.display.hasOwnProperty("dispose")) this.display["dispose"]();
      this.display = null;
    }
  }

  public onTick(deltaTime: number): void {
    // Log.trace("更新-->", deltaTime);
    this.onPreUpdate(deltaTime);
    this.onUpdating(deltaTime);
    // may remove is the updating.
    if (this.scene) this.onUpdated(deltaTime);
  }

  public onFrame(deltaTime: number): void {
    // Log.trace("渲染-->", deltaTime);
    if (this.isValidDisplay) {
      this.display.visible = true;

      this.onUpdatingDisplay(deltaTime);
    } else {
      this.display.visible = false;
    }
  }

  protected onInitialize(): void {
    if (!this.display) this.display = this.createDisplay();

    this.display.visible = false;
    if (this.display instanceof BasicAvatar) (<BasicAvatar>this.display).initialize();
    if ((this.display as IEntityComponent).onTick !== undefined) (<IEntityComponent>this.display).owner = this;
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
    if ((this.display as IEntityComponent).onTick !== undefined) (<IEntityComponent>this.display).onTick(deltaTime);
  }

  protected checkIsValidDisplayAvatar(): void {
    this.isValidDisplay = this.isInScreen();
  }

  protected onUpdatingDisplay(deltaTime: number): void {

    let p3 = Globals.Room45Util.p2top3(this.ox, this.oy, this.oz);
    // Log.trace(p3.x,p3.y,p3.z);
    this.display.isoX = p3.x;
    this.display.isoY = p3.y;
    this.display.isoZ = p3.z;
    // Log.trace(this.display.isoX,this.display.isoY,this.display.isoZ);
    if ((this.display as IAnimatedObject).onFrame !== undefined) (<IAnimatedObject>this.display).onFrame(deltaTime);
  }
}
