import { op_gameconfig_01, op_def } from "pixelpai_proto";
import { IPoint } from "game-capsule";
import { LogicPoint } from "utils";
export interface IAnimationData {
    name: string;
    frameName: string[];
    frameRate: number;
    loop: boolean;
    baseLoc: LogicPoint;
    collisionArea?: number[][];
    walkableArea?: number[][];
    originPoint: LogicPoint;
    layer: op_gameconfig_01.IAnimationLayer[];
    interactiveArea?: op_def.IPBPoint2i[];
    mountLayer: op_gameconfig_01.IAnimationMountLayer;
}
export declare class AnimationModel implements IAnimationData {
    id: number;
    name: string;
    frameName: string[];
    frameRate: number;
    loop: boolean;
    baseLoc: LogicPoint;
    collisionArea?: number[][];
    walkableArea?: number[][];
    originPoint: LogicPoint;
    layer: op_gameconfig_01.IAnimationLayer[];
    interactiveArea: IPoint[];
    mountLayer: op_gameconfig_01.IAnimationMountLayer;
    protected mNode: op_gameconfig_01.INode;
    constructor(ani: op_gameconfig_01.IAnimationData);
    changeLayer(layer: any[]): void;
    createProtocolObject(): op_gameconfig_01.IAnimationData;
    createMountPoint(index: number): void;
    updateMountPoint(index: number, x: number, y: number): void;
    private stringToArray;
    private arrayToString;
}
