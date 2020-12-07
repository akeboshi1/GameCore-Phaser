export enum LoadType {
    IMAGE,
    JSON,
    ALTAS,
    DRAGONBONES,
}
enum LoadState {
    NONE,
    PRELOAD,
    PROGRESS,
    COMPLETE,
    ERROR,
    RETRY
}
export interface ILoadObject {
    type: number;
    key: string;
    textureUrl?: string;
    altasUrl?: string;
    jsonUrl?: string;
    boneUrl?: string;
}

export class LoadQueue extends Phaser.Events.EventEmitter {
    protected mQueue: any[];
    private mIndex: number = 0;
    constructor(protected scene: Phaser.Scene) {
        super();
        this.mQueue = [];
    }

    add(list: ILoadObject[]) {
        list.forEach((loadObject) => {
            if (loadObject) {
                const type = loadObject.type;
                const key = loadObject.key;
                const altasUrl = loadObject.altasUrl, textureUrl = loadObject.textureUrl,
                    jsonUrl = loadObject.jsonUrl, boneUrl = loadObject.boneUrl;
                switch (type) {
                    case LoadType.ALTAS:
                        this.scene.load.atlas(key, altasUrl);
                        break;
                    case LoadType.IMAGE:
                        this.scene.load.image(key, textureUrl);
                        break;
                    case LoadType.JSON:
                        this.scene.load.json(key, jsonUrl);
                        break;
                    case LoadType.DRAGONBONES:
                        this.scene.load.dragonbone(key, textureUrl, jsonUrl, boneUrl, null, null, { responseType: "arraybuffer" });
                        break;
                }
                this.mQueue.push(loadObject);
            }
        });
    }

    startLoad() {
        this.mQueue.forEach((loadObject) => {
            loadObject.state = LoadState.PROGRESS;
        });
        this.scene.load.on(Phaser.Loader.Events.FILE_COMPLETE, this.fileComplete, this);
        this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.totalComplete, this);
        this.scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, this.fileLoadError, this);
        this.scene.load.start();
    }

    public destroy() {
        this.clearQueue();
        if (this.mQueue) this.mQueue = null;
    }

    private totalComplete() {
        this.emit("QueueComplete");
        this.clearQueue();

    }

    private fileComplete(key: string, type?: string) {
        this.mIndex++;
        const len: number = this.mQueue.length;
        this.emit("QueueProgress", this.mIndex / len, key, type);
    }

    private fileLoadError(file) {
        // Logger.getInstance().log("queue load error", file);
        this.emit("QueueError", file.key);
    }

    private clearQueue() {
        this.scene.load.off(Phaser.Loader.Events.FILE_COMPLETE, this.fileComplete, this);
        this.scene.load.off(Phaser.Loader.Events.COMPLETE, this.totalComplete, this);
        this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, this.fileLoadError, this);
        if (!this.mQueue) return;
        this.mQueue.length = 0;
        this.mQueue = [];
        this.mIndex = 0;
    }
}
