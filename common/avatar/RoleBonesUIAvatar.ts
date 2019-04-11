import {BonesLoaderAvatar} from "./BonesLoaderAvatar";
import {Const} from "../const/Const";
import Globals from "../../Globals";
import {IObjectPool} from "../../base/pool/interfaces/IObjectPool";
import {op_gameconfig} from "pixelpai_proto";
import {BasicUIAvatar} from "../../base/BasicUIAvatar";

export class RoleBonesUIAvatar extends BasicUIAvatar {
    protected hasPlaceHold = true;

    protected mAngleIndex = 3;
    protected mAngleIndexDirty = false;
    protected mAnimationName: string = Const.ModelStateType.BONES_STAND;
    protected mAnimationDirty = false;

    public constructor(game: Phaser.Game) {
        super(game);
    }

    public get angleIndex(): number {
        return this.mAngleIndex;
    }

    public set angleIndex(value: number) {
        if (this.mAngleIndex !== value) {
            this.mAngleIndex = value;
            this.mAngleIndexDirty = true;
        }
    }

    public get animationName(): string {
        return this.mAnimationName;
    }

    public set animationName(value: string) {
        if (this.mAnimationName !== value) {
            this.mAnimationName = value;
            this.mAnimationDirty = true;
        }
    }

    protected get avatarPool(): IObjectPool {
        let op = Globals.ObjectPoolManager.getObjectPool("BonesLoaderAvatar");
        return op;
    }

    public loadModel(model: op_gameconfig.IAvatar): void {
        if (this.Loader) {
            this.Loader.loadModel(model, this, this.bodyAvatarPartLoadStartHandler, this.bodyAvatarPartLoadCompleteHandler);
        }
    }

    public onFrame(): void {
        super.onFrame();
        if (this.Loader) {
            this.Loader.onFrame();
        }
        if (this.mAngleIndexDirty || this.mAnimationDirty) {
            if (this.Loader) {
                this.Loader.invalidAnimationControlFunc();
            }
        }
        this.mAngleIndexDirty = false;
        this.mAnimationDirty = false;
    }

    public get Loader(): BonesLoaderAvatar {
        return this.mLoaderAvatar as BonesLoaderAvatar;
    }

    protected onInitialize(): void {
        this.mLoaderAvatar = this.avatarPool.alloc() as BonesLoaderAvatar;
        if (null == this.mLoaderAvatar) {
            this.mLoaderAvatar = new BonesLoaderAvatar(Globals.game);
        }
        this.Loader.setAnimationControlFunc(this.bodyControlHandler, this);
        this.Loader.visible = false;
        this.addChild(this.Loader);
    }

    protected onInitializeComplete(): void {
    }

    protected onAddPlaceHoldAvatarPart(): void {
    }

    protected onRemovePlaceHoldAvatarPart(): void {
    }

    protected bodyControlHandler(boneAvatar: BonesLoaderAvatar): void {
        boneAvatar.playAnimation(this.animationName, this.angleIndex);
    }

    protected bodyAvatarPartLoadStartHandler(): void {
        if (this.hasPlaceHold) this.onAddPlaceHoldAvatarPart();
    }

    protected bodyAvatarPartLoadCompleteHandler(): void {
        if (this.hasPlaceHold) this.onRemovePlaceHoldAvatarPart();
        if (this.Loader) {
            this.Loader.visible = true;
        }
    }

    public onDispose(): void {
        if (this.contains(this.Loader)) {
            this.removeChild(this.Loader);
        }
        super.onDispose();
    }
}
