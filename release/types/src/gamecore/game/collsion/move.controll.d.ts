import * as SAT from "sat";
import { IPos } from "structure";
import { IRoomService } from "../room";
export declare class MoveControll {
    private id;
    private room;
    protected mBodies: SAT.Polygon;
    private ignoreCollsion;
    private velocity;
    private mPosition;
    private mPrePosition;
    private collsion;
    private maxWidth;
    private maxHeight;
    constructor(id: number, room: IRoomService);
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
