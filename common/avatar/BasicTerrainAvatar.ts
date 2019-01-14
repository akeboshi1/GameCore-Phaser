import {IAnimatedObject} from "../../base/IAnimatedObject";
import {BasicAvatar} from "../../base/BasicAvatar";
import Globals from "../../Globals";
import {TerrainInfo} from "../struct/TerrainInfo";
import {DisplayLoaderAvatar} from "./DisplayLoaderAvatar";

export class BasicTerrainAvatar extends BasicAvatar implements IAnimatedObject {
  protected hasPlaceHold = true;
  protected mBodyAvatar: DisplayLoaderAvatar;
  protected mAnimationName: string;
  protected mAnimationDirty = false;
  private callBack: Function;
  private callThisObj: any;

  constructor(game: Phaser.Game) {
    super(game);
  }

  public get animationName(): string {
    return this.mAnimationName;
  }

  public set animationName(value: string) {
    this.mAnimationName = value;
    this.mAnimationDirty = true;
  }

  public get terrainInfo(): TerrainInfo {
    return this.myData;
  }

  public loadModel(callBack?: Function, thisObj?: any): void {
    this.mBodyAvatar.setAnimationConfig(this.terrainInfo.animations);
    this.callBack = callBack;
    this.callThisObj = thisObj;
    this.mBodyAvatar.loadModel(this.terrainInfo.display, this, this.bodyAvatarPartLoadStartHandler, this.bodyAvatarPartLoadCompleteHandler);
  }

  public onFrame(deltaTime: number): void {
    super.onFrame(deltaTime);
    this.mBodyAvatar.onFrame(deltaTime);
    if (this.mAnimationDirty) {
      this.mBodyAvatar.invalidAnimationControlFunc();
      this.mAnimationDirty = false;
    }
  }

  protected onInitialize(): void {
    this.mBodyAvatar = new DisplayLoaderAvatar(Globals.game);
    this.mBodyAvatar.setAnimationControlFunc(this.bodyControlHandler, this);
    this.mBodyAvatar.visible = false;
    this.addChild(this.mBodyAvatar);
  }

  protected bodyControlHandler(boneAvatar: DisplayLoaderAvatar): void {
    boneAvatar.playAnimation(this.animationName);
  }

  protected bodyAvatarPartLoadStartHandler(): void {
    if (this.hasPlaceHold) this.onAddPlaceHoldAvatarPart();
  }

  protected bodyAvatarPartLoadCompleteHandler(): void {
    if (this.hasPlaceHold) this.onRemovePlaceHoldAvatarPart();
    if (this.callBack) {
      let cb: Function = this.callBack;
      this.callBack = null;
      cb.apply(this.callThisObj);
      this.callThisObj = null;
    }
    this.mBodyAvatar.visible = true;
  }

  protected onAddPlaceHoldAvatarPart(): void {
  }

  protected onRemovePlaceHoldAvatarPart(): void {
  }

  public onDispose(): void {
    if (this.mBodyAvatar) {
      this.mBodyAvatar.destroy(true);
    }
    super.onDispose();
  }
}
