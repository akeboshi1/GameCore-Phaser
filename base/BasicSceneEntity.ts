import {ITickedObject} from "./ITickedObject";
import {IAnimatedObject} from "./IAnimatedObject";
import {Const} from "../common/const/Const";
import Globals from "../Globals";
import {BasicAvatar} from "./BasicAvatar";
import {IEntityComponent} from "./IEntityComponent";
import {SceneBasic} from "../modules/Scene/view/SceneBasic";
import {op_client} from "pixelpai_proto";
import {IQuadTreeNode} from "./ds/IQuadTreeNode";
import {IDisposeObject} from "./object/interfaces/IDisposeObject";

export class BasicSceneEntity implements ITickedObject, IAnimatedObject, IQuadTreeNode {
  public uid: any;
  public elementTypeId = 0;
  public sceneLayerType: number = Const.SceneConst.SceneLayerMiddle;
  public isValidDisplay = true;
  public data: any;
  public display: any;
  public scene: SceneBasic;
  public camera: Phaser.Camera;

  public positionDirty = false;
  public baseLoc: Phaser.Point;
  protected isNeedSort = true;
  public zFighting: number = 0;

  private mInitilized = false;

  public constructor() {
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
      let p3 = Globals.Scene45Util.p2top3(this.ox, this.oy);
      return Math.round(p3.x);
  }

  public get sortY(): number {
      let p3 = Globals.Scene45Util.p2top3(this.ox, this.oy);
      return Math.round(p3.y);
  }

  public get quadW(): number {
    return 0;
  }

  public get quadH(): number {
    return 0;
  }

  public get quadX(): number {
    return this.ox + (this.baseLoc ? this.baseLoc.x : 0);
  }

  public get quadY(): number {
    return this.oy + (this.baseLoc ? this.baseLoc.y : 0);
  }

  protected onDisplayLoadCompleted(): void {
  }

  public moveToTarget(value: op_client.IMoveData): void {
  }

  public moveStopTarget(value: op_client.IMovePosition): void {
  }

  public initPosition(): void {
    this.setPosition(this.data.x, this.data.y, this.data.z);
  }

  public setPosition(x: number, y: number, z?: number): void {
    // Log.trace("[x,y,z]", x, y, z);
    this._ox = x || 0;
    this._oy = y || 0;
    this._oz = z || 0;
  }

  public isInScreen(): boolean {
    return Globals.Tool.isRectangleOverlap(this.camera.x, this.camera.y,
      this.camera.width, this.camera.height, this.ox, this.oy, Const.GameConst.DEFAULT_VISIBLE_TEST_RADIUS, Const.GameConst.DEFAULT_VISIBLE_TEST_RADIUS);
  }

  public initialize(): void {
    if (!this.mInitilized) {
      this.mInitilized = true;
      this.onInitialize();
      this.onInitializeCompleted();
    }
  }

  public drawDirty = false;
  public drawBit(value: Phaser.BitmapData, offset: Phaser.Point): void {
  }

  public updateByData(data: any = null): void {
    if (!this.mInitilized) return;

    this.data = data;

    this.onUpdateByData();
  }

  public onDispose(): void {
    if (this.initilized) {
        if (this.display) {
            if ((this.display as IDisposeObject).onDispose !== undefined) (<IDisposeObject>this.display).onDispose();
            this.display = null;
        }
        this.scene = null;
        this.camera = null;
    }
  }

  public onClear(): void {
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
    // this.isValidDisplay = this.isInScreen();
  }

  public updateDisplay(): void {
    this.onUpdatingDisplay();
  }

  protected _rect: Phaser.Rectangle;
  public getRect(): Phaser.Rectangle {
    if (this._rect === undefined) {
      this._rect = new Phaser.Rectangle();
    }
    let _ox = this.ox + (this.baseLoc ? this.baseLoc.x : 0);
    let _oy = this.oy + (this.baseLoc ? this.baseLoc.y : 0);
    this._rect.setTo(_ox, _oy, Const.GameConst.DEFAULT_VISIBLE_TEST_RADIUS, Const.GameConst.DEFAULT_VISIBLE_TEST_RADIUS);
    return this._rect;
  }

  protected s_rect: Phaser.Rectangle;
  public getScreenRect(): Phaser.Rectangle {
    if (this.s_rect === undefined) {
      this.s_rect = new Phaser.Rectangle();
    }
    let _ox = this.ox + (this.baseLoc ? this.baseLoc.x : 0);
    let _oy = this.oy + (this.baseLoc ? this.baseLoc.y : 0);
    this.s_rect.setTo(_ox, _oy, Const.GameConst.DEFAULT_VISIBLE_TEST_RADIUS, Const.GameConst.DEFAULT_VISIBLE_TEST_RADIUS);
    return this.s_rect;
  }

  protected onUpdatingDisplay(): void {
    let _ox = this.ox + (this.baseLoc ? this.baseLoc.x : 0);
    let _oy = this.oy + (this.baseLoc ? this.baseLoc.y : 0);
    let p3 = Globals.Scene45Util.p2top3(_ox, _oy);

    this.display.isoX = p3.x;
    this.display.isoY = p3.y;
    this.display.isoZ = 0;

    if ((this.display as IAnimatedObject).onFrame !== undefined) (<IAnimatedObject>this.display).onFrame();
  }
}
