import { LogicPoint } from "../../../utils";
import { op_gameconfig_01, op_def } from "pixelpai_proto";
export interface IAnimationModel {
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
