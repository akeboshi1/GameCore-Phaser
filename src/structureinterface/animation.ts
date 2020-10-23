
import { op_gameconfig_01, op_def } from "pixelpai_proto";
import { LogicPoint } from "../utils";
export interface IAnimationData {
    name: string;
    frameName: string[];
    frameRate: number;
    loop: boolean;
    baseLoc: LogicPoint;
    collisionArea?: number[][];
    walkableArea?: number[][];
    originPoint: LogicPoint;

    readonly interactiveArea?: op_def.IPBPoint2i[];
    readonly layer: op_gameconfig_01.IAnimationLayer[];
    readonly mountLayer: op_gameconfig_01.IAnimationMountLayer;
}

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
