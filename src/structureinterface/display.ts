export enum DisplayType {
    Dragonbones,
    Element,
    Frame,
    Terrain
}

export interface IDisplay {
    texturePath: string;
    dataPath?: string;
}

export interface AnimationData {
    name: string;
    flip: boolean;
    times?: number;
    playingQueue?: AnimationQueue;
}

export interface AnimationQueue {
    name: string;
    playTimes?: number;
    playedTimes?: number;
    complete?: Function;
}
