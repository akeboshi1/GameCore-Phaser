import {IAnimatedObject} from "../../../base/IAnimatedObject";
import {IDisposeObject} from "../../../base/IDisposeObject";
import {DisplayLoaderAvatar} from "../../../common/avatar/DisplayLoaderAvatar";
import {IMouseFollow} from "../../../interface/IMouseFollow";
import Globals from "../../../Globals";
import {op_gameconfig} from "../../../../protocol/protocols";

export class MouseFollower implements IAnimatedObject, IDisposeObject {
  protected display: DisplayLoaderAvatar;
  protected mInitilized = false;
  protected mData: IMouseFollow;
  protected baseLoc: Phaser.Point;
  private mousePointer: Phaser.Pointer;
  private parent: Phaser.Group;
  public constructor(value: Phaser.Group) {
    this.parent = value;
  }

  public setParent(value: Phaser.Group): void {
    this.parent = value;
    if (this.display && value) {
      this.parent.add(this.display);
    }
  }

  public onClear(): void {
    if (this.display) {
      this.display.onClear();
    }
  }

  public onDispose(): void {
    if (this.display) {
      this.display.onDispose();
    }
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
    this.display.visible = false;
    if (this.parent) {
      this.parent.add(this.display);
    }
  }

  public setData(value: IMouseFollow): void {
    if (value.animation && value.display) {
      this.mData = value;
      this.setBaseLoc();
      this.display.setAnimationConfig([value.animation]);
      this.display.loadModel(value.display, this, this.bodyAvatarPartLoadStartHandler, this.bodyAvatarPartLoadCompleteHandler);
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

  protected bodyAvatarPartLoadStartHandler(): void {
  }

  protected bodyAvatarPartLoadCompleteHandler(): void {
    this.display.visible = true;
  }

  protected bodyControlHandler(boneAvatar: DisplayLoaderAvatar): void {
    boneAvatar.playAnimation(this.mData.animation.name);
  }

  public onFrame(): void {
    if (this.mousePointer == null || this.mousePointer === undefined) return;
    this.display.x = this.mousePointer.x + (this.baseLoc ? this.baseLoc.x : 0);
    this.display.y = this.mousePointer.y + (this.baseLoc ? this.baseLoc.y : 0);
  }
}
