/// <reference types="phaser" />
export declare enum LoadType {
    IMAGE = 0,
    JSON = 1,
    ALTAS = 2,
    DRAGONBONES = 3
}
export interface ILoadObject {
    type: number;
    key: string;
    textureUrl?: string;
    altasUrl?: string;
    jsonUrl?: string;
    boneUrl?: string;
}
export declare class LoadQueue extends Phaser.Events.EventEmitter {
    protected scene: Phaser.Scene;
    protected mQueue: any[];
    constructor(scene: Phaser.Scene);
    add(list: ILoadObject[]): void;
    startLoad(): void;
    destroy(): void;
    private addListen;
    private removeListen;
    private totalComplete;
    private fileComplete;
    private fileLoadError;
    private clearQueue;
}
