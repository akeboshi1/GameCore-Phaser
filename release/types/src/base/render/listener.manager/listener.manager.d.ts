export declare class ListenerManager {
    private scene;
    private mLoadListeners;
    private mTexturesListeners;
    constructor(scene: Phaser.Scene);
    destroy(): void;
    addPhaserListener(type: PhaserListenerType, key: string, func: Function): void;
    removePhaserListener(type: PhaserListenerType, key: string, func: Function): void;
}
export declare enum PhaserListenerType {
    Load = 0,
    Textures = 1
}
