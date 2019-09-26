export class DynamicImage extends Phaser.GameObjects.Image {
    private mLoadCompleteCallbak: Function;
    private mLoadContext: any;
    private mUrl: string;
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, undefined);
    }

    public load(value: string, completeCallBack?: Function, loadContext?: any) {
        this.mLoadCompleteCallbak = completeCallBack;
        this.mLoadContext = loadContext;

        this.mUrl = value;
        if (this.scene.cache.obj.get(value)) {
            this.onLoadComplete();
        } else {
            this.scene.load.image(value, value);
            this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadComplete, this);
            this.scene.load.start();
        }
    }

    private onLoadComplete() {
        if (this.mLoadCompleteCallbak) {
            const cb: Function = this.mLoadCompleteCallbak;
            this.mLoadCompleteCallbak = null;
            cb.call(this.mLoadContext);
            this.mLoadContext = null;
        }
        this.setTexture(this.mUrl);
    }
}
