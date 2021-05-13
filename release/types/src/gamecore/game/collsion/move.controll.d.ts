import * as SAT from "sat";
import { IPos } from "structure";
import { CollsionManager } from "./collsion.manager";
export declare class MoveControll {
    private id;
    private collsion;
    protected mBodies: SAT.Polygon;
    private ignoreCollsion;
    private velocity;
    private mPosition;
    private mPrePosition;
    constructor(id: number, collsion: CollsionManager);
    setVelocity(x: number, y: number): void;
    update(time: number, delta: number): void;
    setPosition(pos: IPos): void;
    drawPolygon(path: IPos[], offset?: IPos): void;
    setBodiesOffset(offset: IPos): void;
    removePolygon(): void;
    setIgnoreCollsion(val: boolean): void;
    private getCollideResponses;
    get position(): IPos;
    get prePosition(): IPos;
    get bodies(): SAT.Polygon;
}
