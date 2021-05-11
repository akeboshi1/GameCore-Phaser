import { LogicPos } from "structure";
import { PhysicalPeer } from "../physical.worker";
import { MatterObject } from "./matter.object";
export declare class MatterPlayerObject extends MatterObject {
    peer: PhysicalPeer;
    id: number;
    constructor(peer: PhysicalPeer, id: number);
    addBody(): void;
    setExistingBody(body: Body, addToWorld?: boolean): void;
    changeState(val?: string, times?: number): void;
    protected get offsetY(): number;
}
export interface PhysicalMoveData {
    destPos?: LogicPos;
    posPath?: PhysicalMovePath[];
    arrivalTime?: number;
    tweenAnim?: any;
    tweenLineAnim?: any;
    tweenLastUpdate?: number;
    onCompleteParams?: any;
    step?: number;
    path?: any[];
}
export interface PhysicalMovePos {
    x: number;
    y: number;
    stopDir?: number;
}
export interface PhysicalMovePath {
    x: number;
    y: number;
    direction: number;
    duration?: number;
    onStartParams?: any;
}
export interface IMoveTarget extends PhysicalMoveData {
    targetId?: number;
}
