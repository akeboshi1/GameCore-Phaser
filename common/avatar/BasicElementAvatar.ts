import {IAnimatedObject} from "../../base/IAnimatedObject";
import {BasicAvatar} from "../../base/BasicAvatar";
import {ElementLoaderAvatar} from "./ElementLoaderAvatar";
import Globals from "../../Globals";
import {Const} from "../const/Const";
import {ElementInfo} from "../struct/ElementInfo";

export class BasicElementAvatar extends BasicAvatar implements IAnimatedObject {
    protected hasPlaceHold: boolean = true;
    protected mBodyAvatar: ElementLoaderAvatar;
    protected mScaleDirty: boolean = false;
    protected mAnimationName: string = "";
    protected mAnimationDirty: boolean = false;
    protected mScaleX: number = 1;

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
        this.mBodyAvatar.loadModel(elementInfo.type, this, this.bodyAvatarPartLoadStartHandler, this.bodyAvatarPartLoadCompleteHandler);
    }

    public onTick(deltaTime: number): void {
        super.onTick(deltaTime);
        if (this.mScaleDirty || this.mAnimationDirty) {
            this.mBodyAvatar.invalidAnimationControlFunc();
        }
    }

    public onFrame(deltaTime: number): void {
        super.onFrame(deltaTime);
        this.mBodyAvatar.onFrame(deltaTime);
        this.mScaleDirty = false;
        this.mAnimationDirty = false;
    }

    public dispose(): void {
        super.dispose();
    }

    protected onInitialize(): void {
        this.mBodyAvatar = new ElementLoaderAvatar(Globals.game);
        this.mBodyAvatar.setAnimationControlFunc(this.bodyControlHandler, this);
        this.mBodyAvatar.visible = false;
        this.addChild(this.mBodyAvatar);
    }

    protected bodyControlHandler(boneAvatar: ElementLoaderAvatar): void {
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