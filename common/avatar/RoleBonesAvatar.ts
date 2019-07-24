import {BasicAvatar} from "../../base/BasicAvatar";
import {BonesLoaderAvatar} from "./BonesLoaderAvatar";
import {Const} from "../const/Const";
import Globals from "../../Globals";
import {op_gameconfig, op_client} from "pixelpai_proto";
import {Log} from "../../Log";
import { UI } from "../../Assets";

export class RoleBonesAvatar extends BasicAvatar {
    protected hasPlaceHold = true;

    protected mAngleIndex = 3;
    protected mAngleIndexDirty = false;
    protected mAnimationName: string = Const.ModelStateType.BONES_STAND;
    protected mLoop: number = -1;
    protected mAnimationDirty = false;
    protected mFlagContainer: Phaser.Group;
    protected mVoiceIcon: Phaser.Sprite;
    protected mVipIcon: Phaser.Image;
    protected mHeadName: Phaser.Text;

    protected backEffect: Phaser.Sprite;
    protected frontEffect: Phaser.Sprite;

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

    public setModelName(value: string, color: string): void {
        this.mHeadName.text = value;
        // this.mHeadName.fill = color;
        this.updateVoiceIcon();
    }

    public setVoiceIcon(jitterReceived: boolean) {
        if (!!this.mVoiceIcon === false) {
            this.createVoiceIcon();
        }
        if (this.mVoiceIcon.visible === false && jitterReceived === true) {
            this.mVoiceIcon.visible = true;
            this.mVoiceIcon.animations.play("idle", 16, true);
        } else if (this.mVoiceIcon.visible === true && jitterReceived === false) {
            this.mVoiceIcon.visible = false;
            this.mVoiceIcon.animations.stop();
        }
    }

    public addVIPIcon() {
        if (!!this.mVipIcon === false) {
            this.mVipIcon = this.game.make.image(0, 0, UI.VipIcon.getName());
            this.mVipIcon.smoothed = false;
        }
        this.mFlagContainer.addAt(this.mVipIcon, 0);
    }

    public loadModel(model: op_gameconfig.IAvatar): void {
        this.mLoaderAvatar.loadModel(model, this, this.bodyAvatarPartLoadStartHandler, this.bodyAvatarPartLoadCompleteHandler);
    }

    public setAnimatiomCompleteCallBack(callBack: Function, thisArgs: any) {
        this.mLoaderAvatar.setAnimationCompleteFunc(callBack, thisArgs);
    }

    public onFrame(): void {
        super.onFrame();
        this.mLoaderAvatar.onFrame();
        if (this.mAngleIndexDirty || this.mAnimationDirty) {
          this.mLoaderAvatar.invalidAnimationControlFunc();
        }
        this.mAngleIndexDirty = false;
        this.mAnimationDirty = false;
    }

    protected onInitialize(): void {
        this.mLoaderAvatar = new BonesLoaderAvatar(Globals.game);
        this.mLoaderAvatar.setAnimationControlFunc(this.bodyControlHandler, this);
        this.mLoaderAvatar.visible = false;
        this.addChild(this.mLoaderAvatar);

        this.mFlagContainer = this.game.make.group(this);
        this.mFlagContainer.x = 0;
        this.mFlagContainer.y = -96;

        this.mHeadName = Globals.game.make.text(0, 0, "" , {fontSize: 15, fill: "#FFF"});
        this.mHeadName.anchor.set(0.5);
        this.mHeadName.align = "center";
        this.mHeadName.stroke = "#000";
        this.mHeadName.strokeThickness = 2;
        this.mHeadName.smoothed = false;
        this.mFlagContainer.add(this.mHeadName);

        // setTimeout(() => {
        //     this.addVIPIcon();
        //     this.alignFlag(4);
        // }, 1000);
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
        if (this.mLoaderAvatar) {
            this.mLoaderAvatar.visible = true;
        }
    }

    protected initBubble() {
        super.initBubble();
        this.mBubble.y = -120;
    }

    protected createVoiceIcon() {
        this.mVoiceIcon = this.game.make.sprite(0, -106, UI.VoiceIcon.getName());
        this.mVoiceIcon.animations.add("idle");
        this.addChild(this.mVoiceIcon);
        this.updateVoiceIcon();
    }

    public onDispose(): void {
        this.mHeadName.text = "";
        if (this.mLoaderAvatar) {
            this.mLoaderAvatar.onDispose();
            this.mLoaderAvatar = null;
        }
        if (this.mBubble) {
            this.mBubble.destroy();
        }
        if (this.mVoiceIcon) {
            this.mVoiceIcon.animations.stop();
            this.mVoiceIcon.destroy();
        }
        super.onDispose();
    }

    private updateVoiceIcon() {
        if (this.mHeadName && this.mVoiceIcon) {
            this.mVoiceIcon.x = -((this.mVoiceIcon.width + 4) + (this.mHeadName.width >> 1));
        }
    }

    protected get flag(): Phaser.Group {
        if (!!this.mFlagContainer === false) {
            this.mFlagContainer = this.game.make.group();
            this.addChild(this.mFlagContainer);
        }
        return this.mFlagContainer;
    }

    protected alignFlag(offset: number) {
        if (!this.mFlagContainer) return;
        const children: any[] = this.mFlagContainer.children;
        let _x = 0;
        for (const child of children) {
            child.x = _x;
            if (child.width) _x += child.width + offset;
        }
        this.mFlagContainer.x = 0 - this.mFlagContainer.width >> 1;
    }
}
