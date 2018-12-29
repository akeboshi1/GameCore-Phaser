import {IAnimatedObject} from "../../base/IAnimatedObject";
import {Load} from "../../Assets";
import {op_gameconfig} from "../../../protocol/protocols";
import Globals from "../../Globals";
import Display = op_gameconfig.Display;

export class DisplayLoaderAvatar extends Phaser.Group implements IAnimatedObject {
    private mUrl: op_gameconfig.IDisplay = {};
    private mLoadThisArg: any;
    private myModelUrlDirty = false;
    private mModelLoaded = false;
    private mLoadCompleteCallback: Function;
    private mLoadErrorCallback: Function;
    private element: Phaser.Sprite;
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
        let key: string = Load.Atlas.getKey(this.mUrl.texturePath + this.mUrl.dataPath);
        this.element = this.game.make.sprite(0, 0, key);
        let animation: op_gameconfig.IAnimation;
        for (let i = 0; i < this.config.length; i++) {
            animation = this.config[i];
            this.element.animations.add(animation.name, animation.frame, animation.frameRate, animation.loop);
        }
        this.addChild(this.element);
    }

    /**
     * 动画
     */
    public playAnimation(animationName: string, scaleX?: number): void {
        this.element.animations.play(animationName);
        this.element.scale.x = scaleX || 1;
    }

    public setAnimationControlFunc(value: Function, thisObj: any): void {
        this.mAnimatonControlFunc = value;
        this.mAnimatonControlThisObj = thisObj;
        this.mAnimatonControlFuncDitry = true;
    }

    public invalidAnimationControlFunc(): void {
        this.mAnimatonControlFuncDitry = true;
    }

    public loadModel(url: op_gameconfig.IDisplay, thisArg: any, onLoadStart?: Function, onLoadComplete?: Function, onLoadError?: Function) {
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
        if (Globals.game.cache.checkTextureKey(Load.Atlas.getKey(this.mUrl.texturePath + this.mUrl.dataPath))) {
            this.mLoadCompleteCallback();
        } else {
            Globals.game.load.onLoadComplete.addOnce(this.modelLoadCompleteHandler, this);
            this.game.load.atlas(Load.Atlas.getKey(this.mUrl.texturePath + this.mUrl.dataPath), Load.Url.getRes(this.mUrl.texturePath), Load.Url.getRes(this.mUrl.dataPath));
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
