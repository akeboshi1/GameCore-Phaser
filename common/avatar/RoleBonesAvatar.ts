import {BasicAvatar} from "../../base/BasicAvatar";
import {BonesLoaderAvatar} from "./BonesLoaderAvatar";
import {Const} from "../const/Const";
import RoleAvatarModelVO from "../struct/RoleAvatarModelVO";
import Globals from "../../Globals";
import {Log} from "../../Log";
import {IObjectPool} from "../../base/pool/interfaces/IObjectPool";

export class RoleBonesAvatar extends BasicAvatar {
    protected hasPlaceHold = true;

    protected mAngleIndex = 3;
    protected mAngleIndexDirty = false;
    protected mAnimationName: string = Const.ModelStateType.BONES_STAND;
    protected mAnimationDirty = false;

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

    public loadModel(model: RoleAvatarModelVO): void {
        this.Loader.loadModel(model, this, this.bodyAvatarPartLoadStartHandler, this.bodyAvatarPartLoadCompleteHandler);
    }

    public onFrame(): void {
        super.onFrame();
        this.Loader.onFrame();
        if (this.mAngleIndexDirty || this.mAnimationDirty) {
          this.Loader.invalidAnimationControlFunc();
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
        this.Loader.visible = true;
    }
}
