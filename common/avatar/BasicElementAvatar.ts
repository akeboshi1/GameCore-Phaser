import {IAnimatedObject} from "../../base/IAnimatedObject";
import Globals from "../../Globals";
import {BasicAvatar} from "../../base/BasicAvatar";
import {Images} from "../../Assets";

export class BasicElementAvatar extends BasicAvatar implements IAnimatedObject {
    private myModelURL: string = "";
    private myModelUrlDirty: boolean = false;
    private mModelLoaded: boolean = false;

    private mLoadCompleteCallback: Function;
    private mLoadErrorCallback: Function;
    private mLoadThisArg: any;

    protected element: Phaser.Sprite;

    constructor(game: Phaser.Game) {
        super(game);
    }

    public initAnimations(config: any): void {
        this.element = this.game.add.sprite(0, 0, this.myModelURL + "_element");
        this.element.animations.add("", [ 1, 2 ]);
    }

    public gotoAndPlay( animationName: string ): void {
        this.element.animations.play(animationName);
    }

    public dispose() {
        if ( this.element )
            this.removeChild(this.element);
        this.element = null;

        this.closeLoadModel();
    }

    public get modelLoaded(): boolean {
        return this.mModelLoaded;
    }

    public loadModel(url: string, thisArg: any, onLoadStart?: Function, onLoadComplete?: Function, onLoadError?: Function) {
        if (this.myModelURL === url) return;

        this.closeLoadModel();

        if (onLoadStart != null) {
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
        if (this.myModelURL != null) {
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
            this.game.load.atlasJSONArray(Images.ImagesElement.getName(+this.myModelURL),  Images.ImagesElement.getPNG(+this.myModelURL), Images.ImagesElement.getJSON(+this.myModelURL));
            this.game.load.start();
        }
    }

    // IAnimatedObject Interface
    public onFrame(deltaTime: number): void {
        if (this.myModelUrlDirty) {
            this.onUpdateModelURL();
            this.myModelUrlDirty = false;
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
    }
}