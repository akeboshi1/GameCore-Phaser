import { RunningAnimation } from "./animation";
import { ILogicPoint } from "./logic.point";
import { IPos } from "./logic.pos";

export interface IPhysicalSprite {
    id: number;
    currentCollisionArea: number[][];
    currentWalkableArea: number[][];
    currentCollisionPoint: ILogicPoint;
    hasInteractive: boolean;
    interactive: ILogicPoint[];
    direction: number;
    pos: IPos;
    bindID: number;
    speed: number;
    currentAnimation: RunningAnimation;
    currentAnimationName: string;
}
