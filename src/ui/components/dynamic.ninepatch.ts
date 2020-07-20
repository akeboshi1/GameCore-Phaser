import { NinePatch } from "@apowo/phaserui";
import { Url } from "../../utils/resUtil";

export class DynamicNinepatch {
    protected mUrl: string;
    protected mLoadCompleteCallBack?: Function;
    protected mLoadContext?: any;
    protected mImage: NinePatch;
    protected mConfig: any;
    constructor(
        private mScene: Phaser.Scene,
        private mParent?: Phaser.GameObjects.Container) {
    }

    public load(value: string, config: any, completeCallBack?: Function, loadContext?: any) {
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
        const columns = this.mConfig.columns ? this.mConfig.columns.length : undefined;
        const rows = this.mConfig.rows ? this.mConfig.rows.length : undefined;
        const left = this.mConfig.columns ? this.mConfig.columns[0] : 0;
        const right = this.mConfig.columns ? this.mConfig.columns[2] : 0;
        const top = this.mConfig.rows ? this.mConfig.rows[0] : 0;
        const bottom = this.mConfig.rows ? this.mConfig.rows[2] : 0;
        this.mImage = new NinePatch(this.mScene, 0, 0, this.mConfig.width, this.mConfig.height, this.mConfig.key, undefined, columns, rows, { left, right, top, bottom }
        );
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
