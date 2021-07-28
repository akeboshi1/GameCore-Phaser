import { op_def } from "pixelpai_proto";
import { RunningAnimation } from "./animation";
import { LogicPoint } from "./logic.point";
import { IPos } from "./logic.pos";

export interface IPhysicalSprite {
    id: number;
    currentCollisionArea: number[][];
    currentWalkableArea: number[][];
    currentCollisionPoint: LogicPoint;
    hasInteractive: boolean;
    interactive: op_def.IPBPoint2f[];
    direction: number;
    pos: IPos;
    bindID: number;
    speed: number;
    currentAnimation: RunningAnimation;
    currentAnimationName: string;
}
