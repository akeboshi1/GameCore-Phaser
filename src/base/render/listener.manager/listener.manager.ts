export class ListenerManager {
    // phaer 监听回收
    private mLoadListeners: Map<string, Function[]> = new Map();
    private mTexturesListeners: Map<string, Function[]> = new Map();

    constructor(private scene: Phaser.Scene) {
    }

    public destroy() {
        this.mLoadListeners.forEach((val, key) => {
            for (const func of val) {
                this.scene.load.off(key, func, this);
            }
        });
        this.mLoadListeners.clear();
        this.mTexturesListeners.forEach((val, key) => {
            for (const func of val) {
                this.scene.textures.off(key, func, this);
            }
        });
        this.mTexturesListeners.clear();
    }

    // issues: https://code.apowo.com/PixelPai/game-core/-/issues/243
    public addPhaserListener(type: PhaserListenerType, key: string, func: Function) {
        let loadPlugin;
        let listenersMap;
        switch (type) {
            case PhaserListenerType.Load: {
                loadPlugin = this.scene.load;
                listenersMap = this.mLoadListeners;
                break;
            }
            case PhaserListenerType.Textures: {
                loadPlugin = this.scene.textures;
                listenersMap = this.mTexturesListeners;
                break;
            }
        }
        loadPlugin.off(key, func, this);
        loadPlugin.on(key, func, this);
        if (!listenersMap.has(key)) {
            listenersMap.set(key, []);
        }
        const listeners = listenersMap.get(key);
        const idx = listeners.indexOf(func);
        if (idx >= 0) listeners.splice(idx, 1);
        listeners.push(func);
    }

    public removePhaserListener(type: PhaserListenerType, key: string, func: Function) {
        let loadPlugin;
        let listenersMap;
        switch (type) {
            case PhaserListenerType.Load: {
                loadPlugin = this.scene.load;
                listenersMap = this.mLoadListeners;
                break;
            }
            case PhaserListenerType.Textures: {
                loadPlugin = this.scene.textures;
                listenersMap = this.mTexturesListeners;
                break;
            }
        }
        loadPlugin.off(key, func, this);
        if (!listenersMap.has(key)) return;
        const listeners = listenersMap.get(key);
        const idx = listeners.indexOf(func);
        if (idx >= 0) listeners.splice(idx, 1);
    }

}

export enum PhaserListenerType {
    Load = 0,
    Textures = 1
}
