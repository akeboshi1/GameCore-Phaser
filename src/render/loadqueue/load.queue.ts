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
    protected mQueue: any[] = [];
    constructor(protected scene: Phaser.Scene) {
        super();
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
                // 如果load没有在加载，且load状态处于准备状态，可自动开启startLoad
                // if (!this.scene.load.isLoading() && this.scene.load.isReady()) {
                //     this.startLoad();
                // }
            }
        });
    }

    // 现改为add自动调用，可外部手动调用
    startLoad() {
        this.mQueue.forEach((loadObject) => {
            loadObject.state = LoadState.PROGRESS;
        });
        this.addListen();
        this.scene.load.start();
    }

    public destroy() {
        this.removeListen();
        if (this.mQueue) this.mQueue = null;
        super.destroy();
    }

    private addListen() {
        // 默认先清理下该loadqueue下的load监听，防止多次监听
        this.removeListen();
        this.scene.load.on(Phaser.Loader.Events.FILE_COMPLETE, this.fileComplete, this);
        this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.totalComplete, this);
        this.scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, this.fileLoadError, this);
    }

    private removeListen() {
        this.scene.load.off(Phaser.Loader.Events.FILE_COMPLETE, this.fileComplete, this);
        this.scene.load.off(Phaser.Loader.Events.COMPLETE, this.totalComplete, this);
        this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, this.fileLoadError, this);
    }

    private totalComplete() {
        this.emit("QueueComplete");
        this.clearQueue();
    }

    private fileComplete(key: string, type?: string) {
        this.emit("QueueProgress", this.scene.load.progress, key, type);
    }

    private fileLoadError(file) {
        // Logger.getInstance().log("queue load error", file);
        this.emit("QueueError", file.key);
    }

    private clearQueue() {
        this.removeListen();
        if (!this.mQueue) return;
        this.mQueue.length = 0;
        this.mQueue = [];
    }
}
