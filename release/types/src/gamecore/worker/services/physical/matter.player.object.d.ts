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
export interface MoveData {
    destPos?: LogicPos;
    posPath?: MovePath[];
    arrivalTime?: number;
    tweenAnim?: any;
    tweenLineAnim?: any;
    tweenLastUpdate?: number;
    onCompleteParams?: any;
    step?: number;
    path?: any[];
}
export interface MovePos {
    x: number;
    y: number;
    stopDir?: number;
}
export interface MovePath {
    x: number;
    y: number;
    direction: number;
    duration?: number;
    onStartParams?: any;
}
export interface IMoveTarget extends MoveData {
    targetId?: number;
}
