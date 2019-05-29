import Globals from "../../../Globals";
import {Load} from "../../../Assets";

export class BaseIcon extends Phaser.Sprite {
    protected m_Icon: Phaser.Image;
    protected m_Url: string;

    private mLoadThisArg: any;
    private mLoadCompleteCallback: Function;

    private mModelLoaded = false;

    constructor(game: Phaser.Game) {
        super(game, 0, 0);
        this.inputEnabled = false;
        this.m_Icon = game.make.image(0, 0);
        this.m_Icon.anchor.set(0.5, 0);
        this.addChild(this.m_Icon);
    }

    public get iconWidth(): number {
        return this.m_Icon.texture.width;
    }

    public get iconHeight(): number {
        return this.m_Icon.texture.height;
    }

    protected onCompleteLoadModel(): void {
        let key: string = this.resKey;
        this.m_Icon.loadTexture(key);
    }

    public load(value: string, thisArg?: any, onLoadComplete?: Function) {
        this.mLoadCompleteCallback = onLoadComplete;
        this.mLoadThisArg = thisArg;

        this.closeLoadModel();

        this.m_Url = value;
        let key: string = this.resKey;
        if (Globals.game.cache.checkImageKey(key)) {
            this.modelLoadCompleteHandler();
        } else {
            Globals.game.load.onLoadComplete.addOnce(this.modelLoadCompleteHandler, this);
            this.game.load.image(key, Load.Url.getRes(this.m_Url));
            this.game.load.start();
        }
    }

    protected closeLoadModel() {
        this.mModelLoaded = false;
    }

    protected modelLoadCompleteHandler() {
        this.mModelLoaded = true;

        this.onCompleteLoadModel();

        if (this.mLoadCompleteCallback) {
            let cb: Function = this.mLoadCompleteCallback;
            this.mLoadCompleteCallback = null;
            cb.apply(this.mLoadThisArg);
            this.mLoadThisArg = null;
        }
    }

    public get resKey(): string {
        if (this.m_Url === undefined) return "";
        let key: string = Load.Image.getKey(this.m_Url);
        return key;
    }
}