import { Logger } from "../../utils/log";

export class DynamicImage extends Phaser.GameObjects.Image {    private mLoadCompleteCallbak: Function;
    private mLoadContext: any;
    private mLoadErrorCallback: Function;
    private mUrl: string;
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, undefined);
    }

    public load(value: string, loadContext?: any, completeCallBack?: Function, errorCallBack?: Function) {
        this.mLoadCompleteCallbak = completeCallBack;
        this.mLoadErrorCallback = errorCallBack;
        this.mLoadContext = loadContext;
        if (!this.scene) {
            Logger.getInstance().fatal(`${DynamicImage.name} Create failed does not exist`);
            return;
        }

        this.mUrl = value;
        if (this.scene.cache.obj.exists(value)) {
            this.onLoadComplete();
        } else {
            this.scene.load.image(value, value);
            this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadComplete, this);
            this.scene.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onLoadError, this);
            this.scene.load.start();
        }
    }

    private onLoadComplete() {
        this.setTexture(this.mUrl);
        if (this.mLoadCompleteCallbak) {
            const cb: Function = this.mLoadCompleteCallbak;
            this.mLoadCompleteCallbak = null;
            cb.call(this.mLoadContext);
            this.mLoadContext = null;
        }
    }

    private onLoadError(file: Phaser.Loader.File) {
        if (this.mUrl === file.url) {
            if (this.mLoadErrorCallback) {
                const cb: Function = this.mLoadErrorCallback;
                this.mLoadErrorCallback = null;
                cb.call(this.mLoadContext);
                this.mLoadContext = null;
            }
        }
    }
}
