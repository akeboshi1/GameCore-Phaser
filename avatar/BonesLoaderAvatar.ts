import {IAnimatedObject} from "../base/IAnimatedObject";
import Globals from "../Globals";
import Slot = dragonBones.Slot;
import * as Assets from "../Assets";

export class BonesLoaderAvatar implements IAnimatedObject {
    private static readonly BONES_SCALE: number = 1;
    protected armature: dragonBones.PhaserArmatureDisplay;
    private myModelUrl: string = "";
    private myModelUrlDirty: boolean = false;
    private mModelLoaded: boolean = false;
    private mLoadCompleteCallback: Function;
    private mLoadThisObj: any;
    private mGroupName: string;
    private mAnimatonControlFunc: Function;
    private mAnimatonControlFuncDitry: boolean;
    private mAnimatonControlThisObj: any;

    public constructor() {
        this.init();
    }

    public set visible(value: boolean) {
        this.view.visible = value;
    }

    public get modelUrl(): string {
        return this.myModelUrl;
    }

    public get modelLoaded(): boolean {
        return this.mModelLoaded
    };

    public get view(): any {
        return this.armature.armature.display;
    }

    public setPos(x: number, y: number): void {
        this.armature.x = x;
        this.armature.y = y;
    }

    public setAnimationControlFunc(value: Function, thisObj: any): void {
        this.mAnimatonControlFunc = value;
        this.mAnimatonControlThisObj = thisObj;
        this.mAnimatonControlFuncDitry = true;
    }

    public invalidAnimationControlFunc(): void {
        this.mAnimatonControlFuncDitry = true;
    }

    /**
     * 动画
     */
    public playAnimation(animationName: string, angleIndex: number): void {
        // console.log(this.direct);
        this.armature.scale.x = BonesLoaderAvatar.BONES_SCALE;
        let t_direct = angleIndex;
        if (angleIndex == 7) {
            t_direct = 1;
            this.armature.scale.x = -BonesLoaderAvatar.BONES_SCALE
        }

        if (angleIndex == 5) {
            t_direct = 3
            this.armature.scale.x = -BonesLoaderAvatar.BONES_SCALE
        }
        this.armature.animation.play(animationName + "_" + t_direct);
    }

    /**
     * 替换皮肤
     */
    public replaceSkin(skinIndex: number): void {
        this.replacePart("body_3_dress", skinIndex);
        this.replacePart("body_3_tail", skinIndex);
        this.replacePart("body_3_base", skinIndex);
        this.replacePart("fleg_3_base", skinIndex);
        this.replacePart("barm_3_base", skinIndex);
        this.replacePart("bleg_3_base", skinIndex);
        this.replacePart("farm_3_base", skinIndex);
        this.replacePart("head_3_face", skinIndex);
        this.replacePart("head_3_back", skinIndex);
        this.replacePart("head_3_base", skinIndex);

        this.replacePart("body_1_dress", skinIndex);
        this.replacePart("body_1_tail", skinIndex);
        this.replacePart("body_1_base", skinIndex);
        this.replacePart("fleg_1_base", skinIndex);
        this.replacePart("barm_1_base", skinIndex);
        this.replacePart("bleg_1_base", skinIndex);
        this.replacePart("farm_1_base", skinIndex);
        this.replacePart("head_1_back", skinIndex);
        this.replacePart("head_1_base", skinIndex);
    }

    public loadModel(url: string, thisObj: any, onLoadStart: Function = null, onLoadComplete: Function = null): void {
        if (this.myModelUrl == url) return;

        if (this.myModelUrl != url) {
            this.closeLoadModel();

            if (onLoadStart != null) {
                onLoadStart.apply(thisObj);
            }

            this.myModelUrl = url;
            this.mGroupName = url + "_avatar";

            if (this.myModelUrl && this.myModelUrl.length > 0) {
                this.mLoadCompleteCallback = onLoadComplete;
                this.mLoadThisObj = thisObj;
                this.myModelUrlDirty = true;
            }
        }
    }

    public dispose(): void {
        this.closeLoadModel();
        this.mLoadCompleteCallback = null;
    }

    public onFrame(deltaTime: number): void {
        if (this.myModelUrlDirty) {
            this.onUpdateModelUrl();
            this.myModelUrlDirty = false;
        }

        if (this.mModelLoaded) {
            if (this.mAnimatonControlFuncDitry) {
                if (this.mAnimatonControlFunc != null) {
                    this.mAnimatonControlFunc.call(this.mAnimatonControlThisObj, this);
                }
                this.mAnimatonControlFuncDitry = false;
            }
        }
    }

    protected init(): void {
        let dragonbonesData = Globals.game.cache.getItem(Assets.Avatar.AvatarBone.getSkeName(),Phaser.Cache.BINARY);
        let textureData: any = Globals.game.cache.getItem(Assets.Avatar.AvatarBone.getJsonName(), Phaser.Cache.JSON).data;
        let texture: any = Globals.game.cache.getImage(Assets.Avatar.AvatarBone.getImgName());

        const factory = dragonBones.PhaserFactory.factory;
        factory.parseDragonBonesData(dragonbonesData);
        factory.parseTextureAtlasData(textureData, texture.base);

        this.armature = factory.buildArmatureDisplay("Armature", "bones_allblue");
        this.armature.scale.x = this.armature.scale.y = BonesLoaderAvatar.BONES_SCALE;
        this.armature.armature.cacheFrameRate = 0;
    }

    protected closeLoadModel(): void {
        if (this.myModelUrl != null) {
            if (this.mModelLoaded) {
                this.mModelLoaded = false;
            }
            this.myModelUrl = null;
        }
        this.myModelUrlDirty = false;
    }

    protected onUpdateModelUrl(): void {
        if (Globals.game.cache.checkImageKey("fleg_3_base_" + this.modelUrl + "_png")) {
            this.modelLoadCompleteHandler();
        } else {
            Globals.game.load.onLoadComplete.addOnce(this.modelLoadCompleteHandler, this);
            Globals.game.load.image("barm_1_base_" + this.modelUrl + "_png", require("assets/avatar/part/barm_1_base_" + this.modelUrl + ".png"));
            Globals.game.load.image("bleg_1_base_" + this.modelUrl + "_png", require("assets/avatar/part/bleg_1_base_" + this.modelUrl + ".png"));
            Globals.game.load.image("body_1_base_" + this.modelUrl + "_png", require("assets/avatar/part/body_1_base_" + this.modelUrl + ".png"));
            Globals.game.load.image("farm_1_base_" + this.modelUrl + "_png", require("assets/avatar/part/farm_1_base_" + this.modelUrl + ".png"));
            Globals.game.load.image("fleg_1_base_" + this.modelUrl + "_png", require("assets/avatar/part/fleg_1_base_" + this.modelUrl + ".png"));
            Globals.game.load.image("head_1_back_" + this.modelUrl + "_png", require("assets/avatar/part/head_1_back_" + this.modelUrl + ".png"));
            Globals.game.load.image("head_1_base_" + this.modelUrl + "_png", require("assets/avatar/part/head_1_base_" + this.modelUrl + ".png"));
            Globals.game.load.image("head_3_back_" + this.modelUrl + "_png", require("assets/avatar/part/head_3_back_" + this.modelUrl + ".png"));
            Globals.game.load.image("head_3_base_" + this.modelUrl + "_png", require("assets/avatar/part/head_3_base_" + this.modelUrl + ".png"));
            Globals.game.load.image("barm_3_base_" + this.modelUrl + "_png", require("assets/avatar/part/barm_3_base_" + this.modelUrl + ".png"));
            Globals.game.load.image("bleg_3_base_" + this.modelUrl + "_png", require("assets/avatar/part/bleg_3_base_" + this.modelUrl + ".png"));
            Globals.game.load.image("body_3_base_" + this.modelUrl + "_png", require("assets/avatar/part/body_3_base_" + this.modelUrl + ".png"));
            Globals.game.load.image("farm_3_base_" + this.modelUrl + "_png", require("assets/avatar/part/farm_3_base_" + this.modelUrl + ".png"));
            Globals.game.load.image("fleg_3_base_" + this.modelUrl + "_png", require("assets/avatar/part/fleg_3_base_" + this.modelUrl + ".png"));
            Globals.game.load.start();
        }
    }

    protected modelLoadCompleteHandler(): void {
        this.mModelLoaded = true;

        if (this.mLoadCompleteCallback != null) {
            var cb: Function = this.mLoadCompleteCallback;
            this.mLoadCompleteCallback = null;
            cb.apply(this.mLoadThisObj);
            this.mLoadThisObj = null;
        }

        this.invalidAnimationControlFunc();
    }

    private replacePart(prat: string, skinIndex: number): void {
        let solt: Slot = this.armature.armature.getSlot(prat);
        let partStr: string = Globals.Tool.caclNumStr(skinIndex);
        let tex = Globals.game.cache.getImage(prat + "_" + partStr + "_png");
        solt.replaceDisplay(tex);
    }
}
