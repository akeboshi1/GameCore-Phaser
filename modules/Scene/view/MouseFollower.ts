import {IAnimatedObject} from "../../../base/IAnimatedObject";
import {IDisposeObject} from "../../../base/object/interfaces/IDisposeObject";
import {DisplayLoaderAvatar} from "../../../common/avatar/DisplayLoaderAvatar";
import {IMouseFollow} from "../../../interface/IMouseFollow";
import Globals from "../../../Globals";
import {op_gameconfig} from "../../../../protocol/protocols";

export class MouseFollower implements IAnimatedObject, IDisposeObject {
  protected display: DisplayLoaderAvatar;
  protected mInitilized = false;
  protected mData: IMouseFollow;
  protected baseLoc: Phaser.Point;
  protected mousePointer: Phaser.Pointer;
  protected parent: Phaser.Group;
  public constructor(value: Phaser.Group) {
    this.parent = value;
  }

  public onClear(): void {
    if (this.parent) {
      this.parent.remove(this.display);
    }
  }

  public onDispose(): void {
    if (this.display) {
      this.display.onDispose();
    }
    this.mousePointer = null;
    this.display = null;
  }

  public initialize(): void {
    if (!this.mInitilized) {
      this.onInitialize();
      this.mInitilized = true;
    }
  }

  protected onInitialize(): void {
    this.mousePointer = Globals.game.input.activePointer;
    this.display = new DisplayLoaderAvatar(Globals.game);
    this.display.setAnimationControlFunc(this.bodyControlHandler, this);
  }

  public setData(value: IMouseFollow): void {
    if (value.animation && value.display) {
      this.mData = value;
      this.setBaseLoc();
      this.display.setReferenceArea(value.animation.collisionArea, new Phaser.Point(value.animation.originPoint[0], value.animation.originPoint[1]));
      this.display.setAnimationConfig([value.animation]);
      this.display.loadModel(value.display);
      if (this.parent) {
        this.parent.add(this.display);
      }
    } else {
      this.onClear();
    }
  }

  protected setBaseLoc(): void {
    let config: op_gameconfig.IAnimation = this.mData.animation;
    if (config === null) return;
    let tmp: Array<string> = config.baseLoc.split(",");
    // 图片坐标
    if (this.baseLoc === undefined) {
      this.baseLoc = new Phaser.Point(+(tmp[0]), +(tmp[1]));
    } else {
      this.baseLoc.set(+(tmp[0]), +(tmp[1]));
    }
  }

  protected bodyControlHandler(boneAvatar: DisplayLoaderAvatar): void {
    boneAvatar.playAnimation(this.mData.animation.name);
  }

  public onFrame(): void {
    if (!this.mInitilized) return;
    this.display.visible = this.mousePointer.withinGame;
    this.display.x = Globals.game.camera.x + this.mousePointer.x + (this.baseLoc ? this.baseLoc.x : 0);
    this.display.y = Globals.game.camera.y + this.mousePointer.y + (this.baseLoc ? this.baseLoc.y : 0);
    this.display.onFrame();
  }
}
