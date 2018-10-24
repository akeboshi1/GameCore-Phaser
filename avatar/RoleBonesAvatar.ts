import {BasicAvatar} from "../base/BasicAvatar";
import {BonesLoaderAvatar} from "./BonesLoaderAvatar";
import {Const} from "../const/Const";
import RoleAvatarModelVO from "../struct/RoleAvatarModelVO";
import Globals from "../Globals";

export class RoleBonesAvatar extends BasicAvatar {
	public hasPalceHold: boolean = true;
	//dynamic part
	protected mBodyAvatar: BonesLoaderAvatar;

	protected mAngleIndex: number = 3;
	protected mAngleIndexDirty: boolean = false;
	protected mAnimationName: string = Const.ModelStateType.BONES_STAND;
	protected mAnimationDirty: boolean = false;
	protected mSkin: RoleAvatarModelVO;
	protected mSkinDirty: boolean = false;

	protected onInitialize(): void {
		this.mBodyAvatar = new BonesLoaderAvatar();
		this.mBodyAvatar.setAnimationControlFunc(this.bodyControlHandler, this);
		this.mBodyAvatar.visible = false;
		this.addChild(this.mBodyAvatar.view);
	}

	protected onInitializeComplete(): void {
	}

	protected onAddPlaceHoldAvatarPart(): void {}

    protected onRemovePlaceHoldAvatarPart(): void {}

	protected bodyControlHandler(boneAvatar: BonesLoaderAvatar): void {
		boneAvatar.playAnimation(this.animationName, this.angleIndex);
	}

	public dispose(): void {
		super.dispose();
	}

	public loadModel(model: RoleAvatarModelVO): void {
		this.mSkin = model;
		this.mBodyAvatar.loadModel(model, this, this.bodyAvatarPartLoadStartHandler, this.bodyAvatarPartLoadCompleteHandler);
	}

	public onTick(deltaTime: number): void {
		super.onTick(deltaTime);

		if (this.mAngleIndexDirty || this.mAnimationDirty || this.mSkinDirty) {
			this.mBodyAvatar.invalidAnimationControlFunc();
		}
	}

	public onFrame(deltaTime: number): void {
		super.onFrame(deltaTime);
		this.mBodyAvatar.onFrame(deltaTime);
        dragonBones.PhaserFactory.factory.dragonBones.advanceTime(deltaTime);
		this.mAngleIndexDirty = false;
		this.mAnimationDirty = false;
		this.mSkinDirty = false;
	}

	protected bodyAvatarPartLoadStartHandler(): void {
		if (this.hasPalceHold) this.onAddPlaceHoldAvatarPart();
	}

	protected bodyAvatarPartLoadCompleteHandler(): void {
		if (this.hasPalceHold) this.onRemovePlaceHoldAvatarPart();
		this.mBodyAvatar.visible = true;
	}

	public get angleIndex(): number { return this.mAngleIndex; }
	public set angleIndex(value: number) {
		if (this.mAngleIndex != value) {
			this.mAngleIndex = value;
			this.mAngleIndexDirty = true;
		}
	}

	public get animationName(): string { return this.mAnimationName; };
	public set animationName(value: string) {
		if (this.mAnimationName != value) {
			this.mAnimationName = value;
			this.mAnimationDirty = true;
		}
	};

	public get skin(): RoleAvatarModelVO { return this.mSkin; }
	public set skin(value: RoleAvatarModelVO) {
		if (this.mSkin != value) {
			this.mSkin = value;
			this.mSkinDirty = true;
		}
	};
}