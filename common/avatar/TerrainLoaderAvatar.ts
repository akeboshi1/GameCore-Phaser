import {IAnimatedObject} from "../../base/IAnimatedObject";
import {Images} from "../../Assets";
import {op_gameconfig} from "../../../protocol/protocols";
import Globals from "../../Globals";

export class TerrainLoaderAvatar extends Phaser.Group implements IAnimatedObject {
    private myType: string;
    private mLoadThisArg: any;
    private myModelUrlDirty: boolean = false;
    private mModelLoaded: boolean = false;
    private mLoadCompleteCallback: Function;
    private mLoadErrorCallback: Function;
    private terrain: Phaser.Sprite;
    private config: op_gameconfig.IAnimation[];
    private mAnimatonControlFunc: Function;
    private mAnimatonControlFuncDitry: boolean;
    private mAnimatonControlThisObj: any;

    public constructor(game: Phaser.Game) {
        super(game);
    }

    public get modelLoaded(): boolean {
        return this.mModelLoaded;
    }

    public setAnimationConfig(value: op_gameconfig.IAnimation[]): void {
        this.config = value;
    }

    protected init(): void {
        let key = Images.ImagesTile.getName(this.myType);
        this.terrain = this.game.make.sprite(0, 0, key);
        let animation: op_gameconfig.IAnimation;
        for (let i = 0; i < this.config.length; i++) {
            animation = this.config[i];
            this.terrain.animations.add(animation.name, animation.frame, animation.frameRate, animation.loop);
        }
        this.addChild(this.terrain);
    }

    /**
     * 动画
     */
    public playAnimation(animationName: string): void {
        this.terrain.animations.play(animationName);
    }

    public setAnimationControlFunc(value: Function, thisObj: any): void {
        this.mAnimatonControlFunc = value;
        this.mAnimatonControlThisObj = thisObj;
        this.mAnimatonControlFuncDitry = true;
    }

    public invalidAnimationControlFunc(): void {
        this.mAnimatonControlFuncDitry = true;
    }

    public loadModel(type: string, thisArg: any, onLoadStart?: Function, onLoadComplete?: Function, onLoadError?: Function) {
        if (this.myType === type) return;

        this.closeLoadModel();

        if (onLoadStart != null) {
            onLoadStart.apply(thisArg);
        }

        this.myType = type;

        if (this.myType) {
            this.mLoadCompleteCallback = onLoadComplete;
            this.mLoadErrorCallback = onLoadError;
            this.mLoadThisArg = thisArg;
            this.myModelUrlDirty = true;
        }
    }

    protected closeLoadModel() {
        if (this.myType) {
            if (this.mModelLoaded) {
                this.mModelLoaded = false;
            }
            this.myType = "";
        }
        this.myModelUrlDirty = false;
    }

    protected onUpdateModelURL() {
        if (Globals.game.cache.checkTextureKey(Images.ImagesTile.getName(this.myType))) {
            this.mLoadCompleteCallback();
        } else {
            Globals.game.load.onLoadComplete.addOnce(this.modelLoadCompleteHandler, this);
            this.game.load.atlasJSONHash(Images.ImagesTile.getName(this.myType), Images.ImagesTile.getPNG(this.myType), Images.ImagesTile.getJSONArray(this.myType));
            this.game.load.start();
        }
    }

    protected modelLoadCompleteHandler() {
        this.mModelLoaded = true;

        if (this.mLoadCompleteCallback != null) {
            let cb: Function = this.mLoadCompleteCallback;
            this.mLoadCompleteCallback = null;
            cb.apply(this.mLoadThisArg);
            this.mLoadThisArg = null;
        }

        this.init();

        this.invalidAnimationControlFunc();
    }

    public onFrame(deltaTime: number): void {
        if (this.myModelUrlDirty) {
            this.onUpdateModelURL();
            this.myModelUrlDirty = false;
        }

        if (this.modelLoaded) {
            if (this.mAnimatonControlFuncDitry) {
                if (this.mAnimatonControlFunc != null) {
                    this.mAnimatonControlFunc.call(this.mAnimatonControlThisObj, this);
                }
                this.mAnimatonControlFuncDitry = false;
            }
        }
    }
}
