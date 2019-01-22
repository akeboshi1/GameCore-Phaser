import {IAnimatedObject} from "../../base/IAnimatedObject";
import {BasicAvatar} from "../../base/BasicAvatar";
import {DisplayLoaderAvatar} from "./DisplayLoaderAvatar";
import Globals from "../../Globals";
import {IObjectPool} from "../../base/pool/interfaces/IObjectPool";

export class BasicElementAvatar extends BasicAvatar implements IAnimatedObject {
    protected hasPlaceHold = true;
    protected mScaleDirty = false;
    protected mAnimationName: string;
    protected mAnimationDirty = false;
    protected mScaleX = 1;

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

    public loadModel(elementInfo: any): void {
        this.mLoaderAvatar.setAnimationConfig(elementInfo.animations);
        this.mLoaderAvatar.loadModel(elementInfo.display, this, this.bodyAvatarPartLoadStartHandler, this.bodyAvatarPartLoadCompleteHandler);
    }

    public onFrame(): void {
        super.onFrame();
        this.mLoaderAvatar.onFrame();
        if (this.mScaleDirty || this.mAnimationDirty) {
          this.mLoaderAvatar.invalidAnimationControlFunc();
        }
        this.mScaleDirty = false;
        this.mAnimationDirty = false;
    }

    protected onInitialize(): void {
        this.mLoaderAvatar = this.avatarPool.alloc() as DisplayLoaderAvatar;
        if (null == this.mLoaderAvatar) {
          this.mLoaderAvatar = new DisplayLoaderAvatar(Globals.game);
        }
        this.mLoaderAvatar.setAnimationControlFunc(this.bodyControlHandler, this);
        this.mLoaderAvatar.visible = false;
        this.addChild(this.mLoaderAvatar);
    }

    protected bodyControlHandler(boneAvatar: DisplayLoaderAvatar): void {
        boneAvatar.playAnimation(this.animationName, this.scaleX);
    }

    protected bodyAvatarPartLoadStartHandler(): void {
        if (this.hasPlaceHold) this.onAddPlaceHoldAvatarPart();
    }

    protected bodyAvatarPartLoadCompleteHandler(): void {
        if (this.hasPlaceHold) this.onRemovePlaceHoldAvatarPart();
        this.mLoaderAvatar.visible = true;
    }

    protected onAddPlaceHoldAvatarPart(): void {
    }

    protected onRemovePlaceHoldAvatarPart(): void {
    }
}
