export interface RunningAnimation {
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
