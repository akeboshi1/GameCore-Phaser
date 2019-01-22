import {IAnimatedObject} from "../../base/IAnimatedObject";
import {Load} from "../../Assets";
import {op_gameconfig} from "../../../protocol/protocols";
import Globals from "../../Globals";
import {IDisposeObject} from "../../base/object/interfaces/IDisposeObject";
import {IRecycleObject} from "../../base/object/interfaces/IRecycleObject";

export class DisplayLoaderAvatar extends Phaser.Sprite implements IAnimatedObject, IDisposeObject, IRecycleObject {
    private mUrl: op_gameconfig.IDisplay = {};
    private mLoadThisArg: any;
    private myModelUrlDirty = false;
    private mModelLoaded = false;
    private mLoadCompleteCallback: Function;
    private mLoadErrorCallback: Function;
    private config: op_gameconfig.IAnimation[];
    private mAnimatonControlFunc: Function;
    private mAnimatonControlFuncDitry: boolean;
    private mAnimatonControlThisObj: any;

    public constructor(game: Phaser.Game) {
        super(game, 0, 0);
    }

    public get modelLoaded(): boolean {
        return this.mModelLoaded;
    }

    public setAnimationConfig(value: op_gameconfig.IAnimation[]): void {
        this.config = value;
    }

    /**
     * 动画
     */
    public playAnimation(animationName: string, scaleX?: number): void {
        this.animations.play(animationName);
        this.scale.x = scaleX || 1;
    }

    public setAnimationControlFunc(value: Function, thisObj: any): void {
        this.mAnimatonControlFunc = value;
        this.mAnimatonControlThisObj = thisObj;
        this.mAnimatonControlFuncDitry = true;
    }

    public invalidAnimationControlFunc(): void {
        this.mAnimatonControlFuncDitry = true;
    }

    public loadModel(url: op_gameconfig.IDisplay, thisArg?: any, onLoadStart?: Function, onLoadComplete?: Function, onLoadError?: Function) {
        if (this.mUrl.dataPath === url.dataPath && this.mUrl.texturePath === url.texturePath) {
            return;
        }

        this.closeLoadModel();

        if (onLoadStart != null) {
            onLoadStart.apply(thisArg);
        }

        this.mUrl.texturePath = url.texturePath;
        this.mUrl.dataPath = url.dataPath;

        if (this.mUrl.dataPath && this.mUrl.texturePath) {
            this.mLoadCompleteCallback = onLoadComplete;
            this.mLoadErrorCallback = onLoadError;
            this.mLoadThisArg = thisArg;
            this.myModelUrlDirty = true;
        }
    }

    public onFrame(): void {
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

    public onClear(): void {
        this.closeLoadModel();
    }

    public onDispose(): void {
        this.closeLoadModel();
        this.config = null;
        this.mLoadCompleteCallback = null;
        this.mLoadErrorCallback = null;
        this.mAnimatonControlFunc = null;
        this.mLoadThisArg = null;
        this.mAnimatonControlThisObj = null;
        this.destroy(true);
    }

    public onRecycle(): void {
    }

    protected onCompleteLoadModel(): void {
        let key: string = Load.Atlas.getKey(this.mUrl.texturePath + this.mUrl.dataPath);
        this.loadTexture(key);
        // TODO 编辑器添加Character时没有动画，有了更好的解决方案再更改
        // let animation: op_gameconfig.IAnimation;
        // if (this.config) {
        //     for (let i = 0; i < this.config.length; i++) {
        //         animation = this.config[i];
        //         this.animations.add(animation.name, animation.frame, animation.frameRate, animation.loop);
        //     }
        // }
    }

    protected closeLoadModel() {
        if (this.mUrl.dataPath && this.mUrl.texturePath) {
            if (this.mModelLoaded) {
                this.mModelLoaded = false;
            }
            this.mUrl.texturePath = "";
            this.mUrl.dataPath = "";
        }
        this.myModelUrlDirty = false;
    }

    protected onUpdateModelURL() {
        if (Globals.game.cache.checkImageKey(Load.Atlas.getKey(this.mUrl.texturePath + this.mUrl.dataPath))) {
            this.modelLoadCompleteHandler();
        } else {
            Globals.game.load.onLoadComplete.addOnce(this.modelLoadCompleteHandler, this);
            this.game.load.atlas(Load.Atlas.getKey(this.mUrl.texturePath + this.mUrl.dataPath), Load.Url.getRes(this.mUrl.texturePath), Load.Url.getRes(this.mUrl.dataPath));
            this.game.load.start();
        }
    }

    protected modelLoadCompleteHandler() {
        this.mModelLoaded = true;

        this.onCompleteLoadModel();

        if (this.mLoadCompleteCallback != null) {
            let cb: Function = this.mLoadCompleteCallback;
            this.mLoadCompleteCallback = null;
            cb.apply(this.mLoadThisArg);
            this.mLoadThisArg = null;
        }

        this.invalidAnimationControlFunc();
    }
}
