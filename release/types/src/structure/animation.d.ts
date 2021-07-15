export interface RunningAnimation {
    name: string;
    flip: boolean;
    times?: number;
    playingQueue?: IChangeAnimation;
}
export interface AnimationQueue {
    changeAnimation: IChangeAnimation[];
    finishAnimationBehavior?: number;
}
export interface IChangeAnimation {
    name: string;
    playTimes?: number;
    playedTimes?: number;
}
