export enum LoadType {
    IMAGE,
    JSON,
    ALTAS,
    DRAGONBONES,
}
enum LoadState {
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
    protected mQueue: Map<string, ILoadObject>;
    private mIndex: number = 0;
    constructor(protected scene: Phaser.Scene, private key: string) {
        super();
        this.mQueue = new Map();
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
                this.mQueue.set(key, loadObject);
            }
        });
    }

    startLoad() {
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
        this.emit(this.key + "_QueueComplete");
        this.clearQueue();

    }

    private fileComplete(key: string, type: string) {
        if (!this.mQueue.get(key)) return;
        this.mIndex++;
        const len: number = this.mQueue.size;
        this.emit(this.key + "_QueueProgress", this.mIndex / len, key);
    }

    private fileLoadError(file) {
        // Logger.getInstance().log("queue load error", file);
        this.emit(this.key + "_QueueError", file.key);
    }

    private clearQueue() {
        this.scene.load.off(Phaser.Loader.Events.FILE_COMPLETE, this.fileComplete, this);
        this.scene.load.off(Phaser.Loader.Events.COMPLETE, this.totalComplete, this);
        this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, this.fileLoadError, this);
        this.mQueue.clear();
        this.mQueue = new Map();
        this.mIndex = 0;
    }
}
