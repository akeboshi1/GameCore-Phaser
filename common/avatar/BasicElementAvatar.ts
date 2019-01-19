import {IAnimatedObject} from "../../base/IAnimatedObject";
import {BasicAvatar} from "../../base/BasicAvatar";
import {DisplayLoaderAvatar} from "./DisplayLoaderAvatar";
import Globals from "../../Globals";
import {ElementInfo} from "../struct/ElementInfo";

export class BasicElementAvatar extends BasicAvatar implements IAnimatedObject {
    protected hasPlaceHold = true;
    protected mBodyAvatar: DisplayLoaderAvatar;
    protected mScaleDirty = false;
    protected mAnimationName: string;
    protected mAnimationDirty = false;
    protected mScaleX = 1;

    constructor(game: Phaser.Game) {
        super(game);
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

    public loadModel(elementInfo: ElementInfo): void {
        this.mBodyAvatar.setAnimationConfig(elementInfo.animations);
        this.mBodyAvatar.loadModel(elementInfo.display, this, this.bodyAvatarPartLoadStartHandler, this.bodyAvatarPartLoadCompleteHandler);
    }

    public onFrame(): void {
        super.onFrame();
        this.mBodyAvatar.onFrame();
        if (this.mScaleDirty || this.mAnimationDirty) {
          this.mBodyAvatar.invalidAnimationControlFunc();
        }
        this.mScaleDirty = false;
        this.mAnimationDirty = false;
    }

    protected onInitialize(): void {
        this.mBodyAvatar = new DisplayLoaderAvatar(Globals.game);
        this.mBodyAvatar.setAnimationControlFunc(this.bodyControlHandler, this);
        this.mBodyAvatar.visible = false;
        this.addChild(this.mBodyAvatar);
    }

    protected bodyControlHandler(boneAvatar: DisplayLoaderAvatar): void {
        boneAvatar.playAnimation(this.animationName, this.scaleX);
    }

    protected bodyAvatarPartLoadStartHandler(): void {
        if (this.hasPlaceHold) this.onAddPlaceHoldAvatarPart();
    }

    protected bodyAvatarPartLoadCompleteHandler(): void {
        if (this.hasPlaceHold) this.onRemovePlaceHoldAvatarPart();
        this.mBodyAvatar.visible = true;
    }

    protected onAddPlaceHoldAvatarPart(): void {
    }

    protected onRemovePlaceHoldAvatarPart(): void {
    }
}
