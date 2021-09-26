import { ILogicPoint } from "./logic.point";

export interface IAnimationLayer {
    frameName: string[];
    offsetLoc?: ILogicPoint;
    frameVisible: boolean[];
    name: string;
    id: number;
}