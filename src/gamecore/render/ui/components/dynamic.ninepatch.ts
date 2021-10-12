import { NineSlicePatch } from "apowophaserui";

export class DynamicNinepatch {
    protected mUrl: string;
    protected mLoadCompleteCallBack?: Function;
    protected mLoadContext?: any;
    protected mImage: NineSlicePatch;
    protected mConfig: any;
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

    public destroy() {
        if (this.mScene) {
            this.mScene.load.off(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
            this.mScene = null;
        }
        this.mConfig = null;
    }

    private onLoadCompleteHandler() {
        // x: number, y: number, width: number, height: number, key: string, frame: string
        this.mImage = new NineSlicePatch(this.mScene, 0, 0, this.mConfig.width, this.mConfig.height, this.mConfig.key, undefined, this.mConfig.config, this.mConfig.scale);
        if (this.mLoadCompleteCallBack) {
            this.mLoadCompleteCallBack.call(this.mLoadContext, this.mImage);
            this.mLoadCompleteCallBack = null;
            this.mLoadContext = null;
        }
    }

    get image(): NineSlicePatch {
        return this.mImage;
    }
}
