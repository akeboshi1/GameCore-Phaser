import {BasicAvatar} from "../../base/BasicAvatar";
import {BonesLoaderAvatar} from "./BonesLoaderAvatar";
import {Const} from "../const/Const";
import Globals from "../../Globals";
import {op_gameconfig, op_client} from "pixelpai_proto";
import {Log} from "../../Log";
import { BubbleContainer } from "../../modules/Scene/chat-bubble/BubbleContainer";

export class RoleBonesAvatar extends BasicAvatar {
    protected hasPlaceHold = true;

    protected mAngleIndex = 3;
    protected mAngleIndexDirty = false;
    protected mAnimationName: string = Const.ModelStateType.BONES_STAND;
    protected mAnimationDirty = false;
    protected mHeadName: Phaser.Text;

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
    }

    public loadModel(model: op_gameconfig.IAvatar): void {
        this.mLoaderAvatar.loadModel(model, this, this.bodyAvatarPartLoadStartHandler, this.bodyAvatarPartLoadCompleteHandler);
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

        this.mHeadName = Globals.game.make.text(0, -96, "" , {fontSize: 15, fill: "#FFF"});
        this.mHeadName.anchor.set(0.5);
        this.mHeadName.align = "center";
        this.mHeadName.stroke = "#000";
        this.mHeadName.strokeThickness = 2;
        this.addChild(this.mHeadName);
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

    public onDispose(): void {
        this.mHeadName.text = "";
        if (this.mLoaderAvatar) {
            this.mLoaderAvatar.onDispose();
            this.mLoaderAvatar = null;
        }
        if (this.mBubble) {
            this.mBubble.destroy();
        }
        super.onDispose();
    }
}
