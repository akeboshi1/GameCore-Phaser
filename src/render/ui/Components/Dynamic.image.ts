import { Logger } from "../../../utils/log";

export class DynamicImage extends Phaser.GameObjects.Image {
    private mLoadCompleteCallbak: Function;
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
        if (this.scene.textures.exists(value)) {
            this.onLoadComplete(value);
        } else {
            this.scene.load.image(value, value);
            this.scene.load.on(Phaser.Loader.Events.FILE_COMPLETE, this.onLoadComplete, this);
            this.scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onLoadError, this);
            this.scene.load.start();
        }
    }

    public destroy(fromScene: boolean = false) {
        this.mLoadCompleteCallbak = null;
        this.mLoadContext = null;
        this.mLoadErrorCallback = null;
        this.mUrl = "";
        if (this.scene) {
            this.scene.load.off(Phaser.Loader.Events.FILE_COMPLETE, this.onLoadComplete, this);
            this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onLoadError, this);
        }
        super.destroy(fromScene);
    }

    protected onLoadComplete(file?: string) {
        if (file === this.mUrl) {
            this.scene.load.off(Phaser.Loader.Events.FILE_COMPLETE, this.onLoadComplete, this);
            this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onLoadError, this);
            this.setTexture(this.mUrl);
            //  this.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            if (this.mLoadCompleteCallbak) {
                const cb: Function = this.mLoadCompleteCallbak;
                this.mLoadCompleteCallbak = null;
                cb.call(this.mLoadContext);
                this.mLoadContext = null;
            }
        }
    }

    protected onLoadError(file: Phaser.Loader.File) {
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
