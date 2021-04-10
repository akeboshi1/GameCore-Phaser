import { Handler, Logger } from "utils";

export class TextureSprite extends Phaser.GameObjects.Container {
    private compl: Handler;
    private error: Handler;
    private mUrls: string[];
    private loadUrls: string[];
    private errorUrls: string[];
    private dpr: number;
    private auto: boolean;
    private times: number;
    private timeFrame: number;
    private tempTimes: number;
    private timerID: any;
    private isPlaying: boolean = false;
    private indexed: number = 0;
    private frameImg: Phaser.GameObjects.Image;
    constructor(scene, dpr: number, auto?: boolean, timeFrame?: number, times?: number) {
        super(scene);
        this.dpr = dpr;
        this.auto = auto || false;
        this.setAniData(times, timeFrame);
    }

    public load(value: string[], compl?: Handler, error?: Handler) {
        if (!this.scene) {
            Logger.getInstance().fatal(`Create failed does not exist`);
            return;
        }
        this.compl = compl;
        this.error = error;
        this.mUrls = value;
        this.loadUrls = [];
        this.errorUrls = [];
        for (const url of this.mUrls) {
            if (!this.scene.textures.exists(url)) {
                this.scene.load.image(url);
                this.loadUrls.push(url);
            }
        }
        if (this.loadUrls.length > 0) {
            this.scene.load.on(Phaser.Loader.Events.FILE_COMPLETE, this.onLoadComplete, this);
            this.scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onLoadError, this);
            this.scene.load.start();
        } else {
            this.onLoadComplete();
        }

    }

    public setAniData(times?: number, timeFrame?: number) {
        this.times = times || -1;
        this.timeFrame = timeFrame || 30;
        this.tempTimes = this.times;
    }
    public play(force?: boolean) {
        if (force) {
            if (this.timerID) {
                clearTimeout(this.timerID);
            }
            this.indexed = 0;
            this.tempTimes = this.times;
        } else if (this.isPlaying) return;
        const excute = () => {
            this.frameImg.setTexture(this.mUrls[this.indexed]);
            this.indexed++;
            if (this.indexed === this.mUrls.length) {
                this.indexed = 0;
                if (this.times > 0) {
                    this.tempTimes--;
                    if (this.tempTimes === 0) {
                        this.playEnd();
                        return;
                    }
                }
            }
            this.timerID = setTimeout(() => {
                excute();
            }, this.timeFrame);
        };
        excute();
    }

    public stop() {
        if (this.isPlaying) {
            clearTimeout(this.timerID);
            this.playEnd();
        }
    }

    public destroy(fromScene: boolean = false) {
        this.compl = undefined;
        this.error = undefined;
        this.mUrls = undefined;
        this.loadUrls = undefined;
        this.errorUrls = undefined;
        if (this.scene) {
            this.scene.load.off(Phaser.Loader.Events.FILE_COMPLETE, this.onLoadComplete, this);
            this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onLoadError, this);
        }
        super.destroy(fromScene);
    }
    get playing() {
        return this.isPlaying;
    }

    protected playEnd() {
        this.isPlaying = false;
        this.tempTimes = this.times;
        this.timerID = undefined;
        this.indexed = 0;
        this.frameImg.setTexture(this.mUrls[this.indexed]);
    }
    protected onLoadComplete(file?: string) {
        const index = this.loadUrls.indexOf(file);
        if (index !== -1) {
            this.loadUrls.splice(index, 1);
            if (this.loadUrls.length === 0) {
                if (this.auto) this.play();
                if (this.compl) {
                    this.compl.run();
                    this.compl = undefined;
                }
                this.scene.load.off(Phaser.Loader.Events.FILE_COMPLETE, this.onLoadComplete, this);
                this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onLoadError, this);
            }
        }
    }

    protected onLoadError(file: Phaser.Loader.File) {
        const index = this.loadUrls.indexOf(file.url);
        if (index !== -1) {
            this.loadUrls.splice(index, 1);
            this.errorUrls.push(file.url);
            if (this.loadUrls.length === 0) {
                this.scene.load.off(Phaser.Loader.Events.FILE_COMPLETE, this.onLoadComplete, this);
                this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onLoadError, this);
                if (this.error) {
                    this.error.runWith(this.errorUrls);
                    this.error = undefined;
                }
            }
        }
    }
}
