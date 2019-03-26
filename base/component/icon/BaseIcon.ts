import {op_gameconfig} from "../../../../protocol/protocols";
import IDisplay = op_gameconfig.IDisplay;
import Globals from "../../../Globals";
import {Load} from "../../../Assets";

export class BaseIcon extends Phaser.Sprite {
    protected m_Icon: Phaser.Image;
    protected m_Param: IDisplay;

    private mLoadThisArg: any;
    private mLoadCompleteCallback: Function;

    private mModelLoaded = false;

    constructor(game: Phaser.Game) {
        super(game, 0, 0);
        this.m_Icon = game.make.image(0, 0);
        this.addChild(this.m_Icon);
    }

    protected onCompleteLoadModel(): void {
        let key: string = this.resKey;
        this.m_Icon.loadTexture(key);
    }

    public load(value: IDisplay, thisArg?: any, onLoadComplete?: Function) {
        this.mLoadCompleteCallback = onLoadComplete;
        this.mLoadThisArg = thisArg;

        this.closeLoadModel();

        this.m_Param = value;
        let key: string = this.resKey;
        if (Globals.game.cache.checkImageKey(key)) {
            this.modelLoadCompleteHandler();
        } else {
            Globals.game.load.onLoadComplete.addOnce(this.modelLoadCompleteHandler, this);
            this.game.load.image(key, Load.Url.getRes(this.m_Param.texturePath));
            this.game.load.start();
        }
    }

    protected closeLoadModel() {
        this.mModelLoaded = false;
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
    }

    public get resKey(): string {
        if (this.m_Param == null) return null;
        let key: string = Load.Atlas.getKey(this.m_Param.texturePath + this.m_Param.dataPath);
        return key;
    }
}