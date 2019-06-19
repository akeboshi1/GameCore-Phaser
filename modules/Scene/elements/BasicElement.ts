import Globals from "../../../Globals";
import {ElementInfo} from "../../../common/struct/ElementInfo";
import {BasicElementAvatar} from "../../../common/avatar/BasicElementAvatar";
import SceneEntity from "../view/SceneEntity";
import {IAnimatedObject} from "../../../base/IAnimatedObject";
import {op_gameconfig, op_client} from "pixelpai_proto";
import {Const} from "../../../common/const/Const";

export default class BasicElement extends SceneEntity {
  protected mAnimationDirty = false;
  protected mScaleX = 1;
  protected myAnimationName: string;
  protected loadSignal: Phaser.Signal = new Phaser.Signal;
  public display: BasicElementAvatar;

  protected mWidth = 0;
  protected mHeight = 0;

  public get elementInfo(): any {
    return this.data;
  }

  public setAnimation(value: string): void {
    // Log.trace("角度-->"+value);
    this.myAnimationName = value;

    this.invalidAnimation();
  }

  public get scaleX(): number {
    return this.mScaleX;
  }

  public setScaleX(value: number|boolean): void {
    // Log.trace("角度-->"+value);
    if (typeof value === "boolean") {
      this.mScaleX = value ? -1 : 1;
    } else {
      this.mScaleX = value;
    }

    this.invalidAnimation();
  }

  public loadModel(value: ElementInfo) {
    this.display.loadModel(value);
  }

  public isInScreen(): boolean {
    let _ox = this.ox + (this.baseLoc ? this.baseLoc.x * this.mScaleX : 0);
    let _oy = this.oy + (this.baseLoc ? this.baseLoc.y : 0);
    return Globals.Tool.isRectangleOverlap(this.camera.x, this.camera.y,
      this.camera.width, this.camera.height, _ox, _oy, Const.GameConst.DEFAULT_VISIBLE_TEST_RADIUS, Const.GameConst.DEFAULT_VISIBLE_TEST_RADIUS);
  }

  protected invalidAnimation(): void {
    this.mAnimationDirty = true;
  }

  protected createDisplay() {
    let element = new BasicElementAvatar(Globals.game);
    return element;
  }

  public addLoadBack(callback: Function, context?: any): void {
    if (this.loadSignal) {
      this.loadSignal.add(callback, context);
    }
  }

  public checkPixel(pointer: Phaser.Pointer): boolean {
    return this.display.Loader.input.checkPointerDown(pointer);
  }

  public set selected(value: boolean) {
    this.display.Loader.tint = value ? 0x7878ff : 16777215;
  }

  public addBubble(text: string, bubble: op_client.IChat_Setting) {
    super.addBubble(text, bubble, 1);
  }

  protected onDisplayLoadCompleted(): void {
    this.mWidth = this.display.Loader.width;
    this.mHeight = this.display.Loader.height;
    if (this.loadSignal) {
      this.loadSignal.dispatch(this);
    }
  }

  public get quadW(): number {
    return this.mWidth;
  }

  public get quadH(): number {
    return this.mHeight;
  }

  protected onUpdating(deltaTime: number): void {
    if (this.mAnimationDirty) {
      this.onAvatarAnimationChanged();
      this.mAnimationDirty = false;
    }
    super.onUpdating(deltaTime);
  }

  protected onInitialize() {
    super.onInitialize();
    this.initBaseLoc();
    this.setAngleIndex(this.elementInfo.dir);
    this.setPosition(this.elementInfo.x, this.elementInfo.y, this.elementInfo.z);
    this.setAnimation(this.elementInfo.animationName);
    this.setScaleX(this.elementInfo.scaleX);
    this.onAvatarAnimationChanged();
    this.loadModel(this.elementInfo);
  }

  protected onUpdatingDisplay(): void {
    let p3 = Globals.Scene45Util.p2top3(this.ox + (this.baseLoc ? this.baseLoc.x * this.mScaleX : 0), this.oy + (this.baseLoc ? this.baseLoc.y : 0));

    this.display.isoX = p3.x;
    this.display.isoY = p3.y;
    this.display.isoZ = 0;

    if ((this.display as IAnimatedObject).onFrame !== undefined) (<IAnimatedObject>this.display).onFrame();
  }

  protected onAvatarAnimationChanged(): void {
    (<BasicElementAvatar>this.display).animationName = this.myAnimationName;
    (<BasicElementAvatar>this.display).scaleX = this.mScaleX;
  }

  public initPosition(): void {
    this.initBaseLoc();
    this.setPosition(this.data.x, this.data.y, this.data.z);
  }

  protected initBaseLoc(): void {
    // 图片坐标
    let config: op_gameconfig.IAnimation = this.elementInfo.config;
    if (config === null) return;
    let tmp: Array<string> = config.baseLoc.split(",");
    this.baseLoc = new Phaser.Point(+(tmp[0]), +(tmp[1]));
  }

  public onDispose(): void {
    if (this.loadSignal) {
      this.loadSignal.dispose();
      this.loadSignal = null;
    }
    super.onDispose();
  }
}
