import {IAnimatedObject} from "../../base/IAnimatedObject";
import {Load} from "../../Assets";
import {op_gameconfig} from "pixelpai_proto";
import Globals from "../../Globals";
import {IDisposeObject} from "../../base/object/interfaces/IDisposeObject";
import {IRecycleObject} from "../../base/object/interfaces/IRecycleObject";
import {IDisplayLoaderParam} from "../../interface/IDisplayLoaderParam";

export class DisplayLoaderAvatar extends Phaser.Sprite implements IAnimatedObject, IDisposeObject, IRecycleObject {
  private mLoadThisArg: any;
  private mModelLoaded = false;
  private mLoadCompleteCallback: Function;
  private mLoadErrorCallback: Function;
  private mLoadParam: IDisplayLoaderParam;
  private config: op_gameconfig.IAnimation[];
  private mAnimatonControlFunc: Function;
  private mAnimatonControlFuncDitry: boolean;
  private mAnimatonControlThisObj: any;
  private mIsAnimation = false;

  public constructor(game: Phaser.Game) {
    super(game, 0, 0);
  }

  public get modelLoaded(): boolean {
    return this.mModelLoaded;
  }

  public get isAnimation(): boolean {
    return this.mIsAnimation;
  }

  public get resKey(): string {
    if (this.mLoadParam == null) return null;
    let key: string = Load.Atlas.getKey(this.mLoadParam.display.texturePath + this.mLoadParam.display.dataPath);
    return key;
  }

  public setAnimationConfig(value: op_gameconfig.IAnimation[]): void {
    this.config = value;
  }

  public playAnimation(animationName: string, scaleX?: number): void {
    let config = this.getAnimationConfig(animationName);
    if (config) {
      this.animations.play(animationName);
      this.mIsAnimation = config.frame.length > 1;
    }
    this.scale.x = scaleX || 1;
  }

  public getAnimationConfig(value: string): op_gameconfig.IAnimation {
    if (this.mLoadParam == null) return null;
    let len: number = this.mLoadParam.animations.length;
    if (len === 0) return null;

    for (let i = 0; i < len; i++) {
      if (this.mLoadParam.animations[i].name === value) {
        return this.mLoadParam.animations[i];
      }
    }
    return null;
  }

  public setAnimationControlFunc(value: Function, thisObj: any): void {
    this.mAnimatonControlFunc = value;
    this.mAnimatonControlThisObj = thisObj;
    this.mAnimatonControlFuncDitry = true;
  }

  public invalidAnimationControlFunc(): void {
    this.mAnimatonControlFuncDitry = true;
  }

  public loadModel(value: IDisplayLoaderParam, thisArg?: any, onLoadStart?: Function, onLoadComplete?: Function, onLoadError?: Function) {
    if (value.animations && value.animations.length > 0 && value.display && value.display.dataPath && value.display.texturePath) {

        this.closeLoadModel();

        this.mLoadParam = value;

        if (onLoadStart != null) {
            onLoadStart.apply(thisArg);
        }

        this.mLoadCompleteCallback = onLoadComplete;
        this.mLoadErrorCallback = onLoadError;
        this.mLoadThisArg = thisArg;
        this.onUpdateModelURL();
    }
  }

  public onFrame(): void {
    if (this.modelLoaded) {
      if (this.mAnimatonControlFuncDitry) {
        if (this.mAnimatonControlFunc != null) {
          this.mAnimatonControlFunc.call(this.mAnimatonControlThisObj, this);
        }
        this.mAnimatonControlFuncDitry = false;
      }
    }
  }

  public onClear(): void {
    this.closeLoadModel();
    this.loadTexture(null);
  }

  public onDispose(): void {
    this.closeLoadModel();
    this.config = null;
    this.mLoadCompleteCallback = null;
    this.mLoadErrorCallback = null;
    this.mAnimatonControlFunc = null;
    this.mLoadThisArg = null;
    this.mAnimatonControlThisObj = null;
    this.destroy(true);
  }

  protected onCompleteLoadModel(): void {
    let key: string = this.resKey;
    this.loadTexture(key);

    let iAnimation: op_gameconfig.IAnimation;
    let animation: Phaser.Animation;
    for (let i = 0; i < this.mLoadParam.animations.length; i++) {
      iAnimation = this.mLoadParam.animations[i];
      animation = this.animations.getAnimation(iAnimation.name);
      if (null == animation) {
        this.animations.add(iAnimation.name, iAnimation.frame, iAnimation.frameRate, iAnimation.loop);
      }
    }
  }

  protected closeLoadModel() {
    this.mModelLoaded = false;
  }

  protected onUpdateModelURL() {
    let key: string = this.resKey;
    if (Globals.game.cache.checkImageKey(key)) {
      this.modelLoadCompleteHandler();
    } else {
      Globals.game.load.onLoadComplete.addOnce(this.modelLoadCompleteHandler, this);
      this.game.load.atlas(key, Load.Url.getRes(this.mLoadParam.display.texturePath), Load.Url.getRes(this.mLoadParam.display.dataPath));
      this.game.load.start();
    }
  }

  protected modelLoadCompleteHandler() {
    this.mModelLoaded = true;

    this.onCompleteLoadModel();

    if (this.mAnimatonControlFunc != null) {
      this.mAnimatonControlFunc.call(this.mAnimatonControlThisObj, this);
    }

    if (this.mLoadCompleteCallback != null) {
      let cb: Function = this.mLoadCompleteCallback;
      this.mLoadCompleteCallback = null;
      cb.apply(this.mLoadThisArg);
      this.mLoadThisArg = null;
    }
  }

  public onRecycle(): void {
  }
}
