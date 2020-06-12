import NinePatch from "tooqingui";
import {Url} from "../../utils/resUtil";

export class DynamicNinepatch {
    protected mUrl: string;
    protected mLoadCompleteCallBack?: Function;
    protected mLoadContext?: any;
    protected mImage: NinePatch;
    protected mConfig: object;
    constructor(
        private mScene: Phaser.Scene,
        private mParent?: Phaser.GameObjects.Container) {
    }

    public load(value: string, config: object, completeCallBack?: Function, loadContext?: any) {
        this.mLoadCompleteCallBack = completeCallBack;
        this.mLoadContext = loadContext;
        this.mConfig = config;

        this.mUrl = value;
        if (this.mScene.cache.obj.get(value)) {
            this.onLoadCompleteHandler();
        } else {
            this.mScene.load.image(this.mUrl, this.mUrl);
            this.mScene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
            this.mScene.load.start();
        }
    }

    private onLoadCompleteHandler() {
        this.mImage = new NinePatch(this.mScene, this.mConfig);
        if (this.mLoadCompleteCallBack) {
            this.mLoadCompleteCallBack.call(this.mLoadContext, this.mImage);
            this.mLoadCompleteCallBack = null;
            this.mLoadContext = null;
        }
    }

    get image(): NinePatch {
        return this.mImage;
    }
}
