import {IAnimatedObject} from "../../base/IAnimatedObject";
import Globals from "../../Globals";
import {BasicAvatar} from "../../base/BasicAvatar";
import {Images} from "../../Assets";
import {op_gameconfig} from "../../../protocol/protocols";
import {Const} from "../const/Const";
import ModelStateType = Const.ModelStateType;
import * as Assets from "../../Assets";

export class BasicElementAvatar extends BasicAvatar implements IAnimatedObject {
    protected element: Phaser.Sprite;
    private myModelURL: string = "";
    private myModelUrlDirty: boolean = false;
    private mModelLoaded: boolean = false;
    private mLoadCompleteCallback: Function;
    private mLoadErrorCallback: Function;
    private mLoadThisArg: any;

    constructor(game: Phaser.Game) {
        super(game);
    }

    public get modelLoaded(): boolean {
        return this.mModelLoaded;
    }

    public initAnimations(config: op_gameconfig.IAnimation[]): void {
        let key = Images.ImagesElement.getName(+this.myModelURL);
        this.element = this.game.make.sprite(0, 0, key);
        let animation: op_gameconfig.IAnimation;
        for (let i = 0; i < config.length; i++) {
            animation = config[i];
            // this.element.animations.add(animation.name, animation.frame);
        }
        this.element.animations.add(ModelStateType.ELEMENT_IDEL);
        this.addChild(this.element);
    }

    public gotoAndPlay(animationName: string): void {
        this.element.animations.play(animationName, 15, true);
    }

    public dispose() {
        if (this.element)
            this.removeChild(this.element);
        this.element = null;

        this.closeLoadModel();
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

    // IAnimatedObject Interface
    public onFrame(deltaTime: number): void {
        if (this.myModelUrlDirty) {
            this.onUpdateModelURL();
            this.myModelUrlDirty = false;
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
            let key = Images.ImagesElement.getName(+this.myModelURL);
            let png = Images.ImagesElement.getPNG(+this.myModelURL);
            let json = Images.ImagesElement.getJSONArray(+this.myModelURL);
            this.game.load.atlasJSONHash(key, Images.ImagesElement.getPNG(+this.myModelURL), Images.ImagesElement.getJSONArray(+this.myModelURL));
            this.game.load.start();
        }
    }

    protected modelLoadCompleteHandler() {
        this.mModelLoaded = true;

        let graphics = Globals.game.make.graphics();
        graphics.clear();
        // graphics.lineStyle(1, 0x00ff00, 1);
        graphics.beginFill(0x0000ff);
        graphics.drawCircle(0, 0, 5);
        graphics.endFill();
        this.addChild(graphics);

        if (this.mLoadCompleteCallback != null) {
            let cb: Function = this.mLoadCompleteCallback;
            this.mLoadCompleteCallback = null;
            cb.apply(this.mLoadThisArg);
            this.mLoadThisArg = null;
        }
    }
}