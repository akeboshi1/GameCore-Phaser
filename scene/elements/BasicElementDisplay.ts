import { IAnimatedObject } from "../../base/IAnimatedObject";
import Globals from "../../Globals";

export default class BasicElementDisplay extends Phaser.Plugin.Isometric.IsoSprite implements IAnimatedObject {
    private myModelURL: string = ""
    private myModelUrlDirty: boolean = false;
    private mModelLoaded: boolean = false;

    private mLoadCompleteCallback: Function;
    private mLoadErrorCallback: Function;
    private mLoadThisArg: any;

    private mAnimationControlFunc: Function;
    private mAnimationControlFuncDirty: boolean;
    private mAnimationControlThisObj: any;

    // protected element: Phaser.Plugin.Isometric.IsoSprite;
    protected element: Phaser.Image;

    constructor(game: Phaser.Game) {
        super(game, 0, 0, 0);
        this.init();
    }

    protected init() {
        this.element = this.game.add.image(0, 0, 0);

        this.visible = false;
    }

    public setPosition(x?: number, y?: number, z?: number) {
        let point3 = this.isoPosition;
        point3.set(x, y, z);
    }

    public setAnimaionControlFunc(value: Function, thisObj: any) {
        this.mAnimationControlFunc = value;
        this.mAnimationControlThisObj = thisObj;
        this.mAnimationControlFuncDirty = true;
    }

    public invalidAnimationControllerFunc() {
        this.mAnimationControlFuncDirty = true;
    }

    public dispose() {
        this.removeChild(this.element);
        this.element = null;

        this.closeLoadModel();
    }

    public get modelURL(): string {
        return this.myModelURL;
    }

    public get modelLoaded(): boolean {
        return this.mModelLoaded;
    }

    public loadModel(url: string, thisArg: any, onLoadStart?: Function, onLoadComplete?: Function, onLoadError?: Function) {
        if (this.myModelURL === url) return;
        
        this.closeLoadModel();

        if (onLoadStart !== undefined) {
            onloadstart.apply(thisArg);
        }

        this.myModelURL = url;

        if (this.myModelURL && this.myModelURL.length > 0) {
            this.mLoadCompleteCallback = onLoadComplete;
            this.mLoadErrorCallback = onLoadError;
            this.mLoadThisArg = thisArg;
            this.myModelUrlDirty = true;
        }
    }

    protected closeLoadModel() {
        if (this.myModelURL !== null) {
            if (this.mModelLoaded) {
                this.mModelLoaded = false;
            }
            this.myModelURL = null;
        }
        this.myModelUrlDirty = false;
    }

    protected onUpdateModelURL() {
        if (Globals.game.cache.checkTextureKey(this.myModelURL)) {
            this.mLoadCompleteCallback();
        } else {
            Globals.game.load.onLoadComplete.addOnce(this.modelLoadCompleteHandler, this);
            this.game.load.image(this.myModelURL + "_png",  require("assets/images/elements/"+ this.myModelURL + ".png"));
            this.game.load.json(this.myModelURL + "_json", require("assets/images/elements/"+ this.myModelURL + ".json"));

            this.game.load.start();
        }
    }

    // IAnimatedObject Interface
    public onFrame(deltaTime: number): void {
        if (this.myModelUrlDirty) {
            this.onUpdateModelURL();
            this.myModelUrlDirty = false;
        }

        if (this.mModelLoaded) {
            if (this.mAnimationControlFuncDirty) {
                if (this.mAnimationControlFunc !== undefined) {
                    this.mAnimationControlFunc.call(this.mAnimationControlThisObj, this);
                }
                this.mAnimationControlFuncDirty = false;
            }
        }
    }

    protected modelLoadCompleteHandler() {
        this.mModelLoaded = true;

        if (this.mLoadCompleteCallback !== undefined) {
            let cb: Function = this.mLoadCompleteCallback;
            this.mLoadCompleteCallback = null;
            cb.apply(this.mLoadThisArg);
            this.mLoadThisArg = null;
        }

        // let json = this.game.cache.getJSON(this.myModelURL + "_json");

        this.invalidAnimationControllerFunc();
    }
}