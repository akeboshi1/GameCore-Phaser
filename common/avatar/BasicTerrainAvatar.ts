import {IAnimatedObject} from "../../base/IAnimatedObject";
import {BasicAvatar} from "../../base/BasicAvatar";
import Globals from "../../Globals";
import {TerrainInfo} from "../struct/TerrainInfo";
import {DisplayLoaderAvatar} from "./DisplayLoaderAvatar";

export class BasicTerrainAvatar extends BasicAvatar implements IAnimatedObject {
    protected hasPlaceHold = true;
    protected mBodyAvatar: DisplayLoaderAvatar;
    protected mAnimationName: string;
    protected mAnimationDirty = false;

    constructor(game: Phaser.Game) {
        super(game);
    }

    public get animationName(): string {
        return this.mAnimationName;
    }

    public set animationName(value: string) {
        this.mAnimationName = value;
        this.mAnimationDirty = true;
    }

    private callBack: Function;
    private callThisObj: any;
    public loadModel(terrainInfo: TerrainInfo, callBack: Function, thisObj: any): void {
        this.mBodyAvatar.setAnimationConfig(terrainInfo.animations);
        this.callBack = callBack;
        this.callThisObj = thisObj;
        this.mBodyAvatar.loadModel(terrainInfo.display, this, this.bodyAvatarPartLoadStartHandler, this.bodyAvatarPartLoadCompleteHandler);
    }

    public onTick(deltaTime: number): void {
        super.onTick(deltaTime);
        if (this.mAnimationDirty) {
            this.mBodyAvatar.invalidAnimationControlFunc();
        }
    }

    public onFrame(deltaTime: number): void {
        super.onFrame(deltaTime);
        this.mBodyAvatar.onFrame(deltaTime);
        this.mAnimationDirty = false;
    }

    protected onInitialize(): void {
        this.mBodyAvatar = new DisplayLoaderAvatar(Globals.game);
        this.mBodyAvatar.setAnimationControlFunc(this.bodyControlHandler, this);
        this.mBodyAvatar.visible = false;
        this.addChild(this.mBodyAvatar);
    }

    protected bodyControlHandler(boneAvatar: DisplayLoaderAvatar): void {
        boneAvatar.playAnimation(this.animationName);
    }

    protected bodyAvatarPartLoadStartHandler(): void {
        if (this.hasPlaceHold) this.onAddPlaceHoldAvatarPart();
    }

    protected bodyAvatarPartLoadCompleteHandler(): void {
        if (this.hasPlaceHold) this.onRemovePlaceHoldAvatarPart();
        if (this.callBack != null) {
            let cb: Function = this.callBack;
            this.callBack = null;
            cb.apply(this.callThisObj);
            this.callThisObj = null;
        }
        this.mBodyAvatar.visible = true;
    }

    protected onAddPlaceHoldAvatarPart(): void {
    }

    protected onRemovePlaceHoldAvatarPart(): void {
    }
}
