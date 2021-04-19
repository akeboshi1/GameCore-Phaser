import { IPos } from "./logic.pos";

export interface IProjection {
    offset: IPos;
    width: number;
    height: number;
}

export const projectionAngle = [Math.cos(45 * Math.PI / 180), Math.sin(45 * Math.PI / 180)];
