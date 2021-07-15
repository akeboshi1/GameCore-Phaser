export interface RunningAnimation {
    name: string;
    flip: boolean;
    times?: number;
    playingQueue?: IChangeAnimation;
}

export interface AnimationQueue {
    changeAnimation: IChangeAnimation[];
    // finishAnimationBehavior -1 回到之前的动画， 0 停在当前 默认0
    finishAnimationBehavior?: number;
}

export interface IChangeAnimation {
    name: string;
    playTimes?: number;
    playedTimes?: number;
}
