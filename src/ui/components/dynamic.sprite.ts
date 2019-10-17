export class DynamicSprite extends Phaser.GameObjects.Sprite {
    private mLoadCompleteCallbak: Function;
    private mLoadContext: any;
    private mLoadErrorCallback: Function;
    private mUrl: string;
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, undefined);
        // TODO updateList.add在3.20的ts def中被移除
        scene.sys.updateList.add(this);
    }

    load(textureURL: string, atlasURL: string, loadContext?: any, completeCallBack?: Function, errorCallBack?: Function) {
        this.mLoadCompleteCallbak = completeCallBack;
        this.mLoadErrorCallback = errorCallBack;
        this.mLoadContext = loadContext;

        this.mUrl = textureURL + atlasURL;
        if (this.scene.cache.obj.get(this.mUrl)) {
            this.onLoadComplete();
        } else {
            this.scene.load.atlas(this.mUrl, textureURL, atlasURL);
            this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadComplete, this);
            this.scene.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onLoadError, this);
            this.scene.load.start();
        }
    }

    destroy(fromScene?: boolean): void {
        this.scene.sys.updateList.remove(this);
        super.destroy(fromScene);
    }

    private onLoadComplete() {
        if (this.mLoadCompleteCallbak) {
            const cb: Function = this.mLoadCompleteCallbak;
            this.mLoadCompleteCallbak = null;
            cb.call(this.mLoadContext);
            this.mLoadContext = null;
        }
        this.scene.anims.create({
            key: this.mUrl,
            frames: this.scene.anims.generateFrameNames(this.mUrl),
            repeat: 1
        });
        this.play(this.mUrl);
        // this.setTexture(this.mUrl);
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
