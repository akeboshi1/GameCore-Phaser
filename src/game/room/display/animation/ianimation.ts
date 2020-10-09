
import { op_def, op_gameconfig_01 } from "pixelpai_proto";
export interface IAnimationData {
    name: string;
    frameName: string[];
    frameRate: number;
    loop: boolean;
    baseLoc: Phaser.Geom.Point;
    collisionArea?: number[][];
    walkableArea?: number[][];
    originPoint: Phaser.Geom.Point;

    readonly interactiveArea?: op_def.IPBPoint2i[];
    readonly layer: op_gameconfig_01.IAnimationLayer[];
    readonly mountLayer: op_gameconfig_01.IAnimationMountLayer;

    createProtocolObject(): op_gameconfig_01.IAnimationData;
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
