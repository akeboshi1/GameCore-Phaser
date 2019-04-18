import {IAnimatedObject} from "../../base/IAnimatedObject";
import {BasicAvatar} from "../../base/BasicAvatar";
import {DisplayLoaderAvatar} from "./DisplayLoaderAvatar";
import Globals from "../../Globals";
import {IObjectPool} from "../../base/pool/interfaces/IObjectPool";
import {IRecycleObject} from "../../base/object/interfaces/IRecycleObject";
import {BonesLoaderAvatar} from "./BonesLoaderAvatar";
import {ReferenceArea} from "../struct/ReferenceArea";
import {IDisplayLoaderParam} from "../../interface/IDisplayLoaderParam";

export class BasicElementAvatar extends BasicAvatar implements IAnimatedObject {
    protected hasPlaceHold = true;
    protected mScaleDirty = false;
    protected mAnimationName: string;
    protected mAnimationDirty = false;
    protected mScaleX = 1;
    protected mLoaderAvatar: DisplayLoaderAvatar;

    constructor(game: Phaser.Game) {
        super(game);
    }

  protected get avatarPool(): IObjectPool {
    let op = Globals.ObjectPoolManager.getObjectPool("DisplayLoaderAvatar");
    return op;
  }

    public get scaleX(): number {
        return this.mScaleX;
    }

    public set scaleX(value: number) {
        this.mScaleX = value;
        this.mScaleDirty = true;
    }

    public get animationName(): string {
        return this.mAnimationName;
    }

    public set animationName(value: string) {
        this.mAnimationName = value;
        this.mAnimationDirty = true;
    }

    public get Loader(): DisplayLoaderAvatar {
        return this.mLoaderAvatar as DisplayLoaderAvatar;
    }

    public loadModel(elementInfo: IDisplayLoaderParam): void {
        this.Loader.setAnimationConfig(elementInfo.animations);
        this.Loader.loadModel(elementInfo, this, this.bodyAvatarPartLoadStartHandler, this.bodyAvatarPartLoadCompleteHandler);
    }

    public onFrame(): void {
        super.onFrame();
        this.Loader.onFrame();
        if (this.mScaleDirty || this.mAnimationDirty) {
          this.Loader.invalidAnimationControlFunc();
        }
        this.mScaleDirty = false;
        this.mAnimationDirty = false;
    }

    protected onInitialize(): void {
        this.mLoaderAvatar = this.avatarPool.alloc() as DisplayLoaderAvatar;
        if (null == this.mLoaderAvatar) {
          this.mLoaderAvatar = new DisplayLoaderAvatar(Globals.game);
        }
        this.Loader.setAnimationControlFunc(this.bodyControlHandler, this);
        this.Loader.visible = false;
        this.addChild(this.Loader);
    }

    protected bodyControlHandler(boneAvatar: DisplayLoaderAvatar): void {
        boneAvatar.playAnimation(this.animationName, this.scaleX);
    }

    protected bodyAvatarPartLoadStartHandler(): void {
        if (this.hasPlaceHold) this.onAddPlaceHoldAvatarPart();
    }

    protected bodyAvatarPartLoadCompleteHandler(): void {
        if (this.hasPlaceHold) this.onRemovePlaceHoldAvatarPart();
        if (this.Loader) {
            this.Loader.visible = true;
        }
        if (this.getOwner()) {
            this.getOwner().onDisplayLoadCompleted();
        }
    }

    public onDispose(): void {
        if (this.mLoaderAvatar) {
            this.removeChild(this.mLoaderAvatar);
            this.mLoaderAvatar.onRecycle();
            this.mLoaderAvatar = null;
        }
        super.onDispose();
    }

    protected onAddPlaceHoldAvatarPart(): void {
    }

    protected onRemovePlaceHoldAvatarPart(): void {
    }
}
