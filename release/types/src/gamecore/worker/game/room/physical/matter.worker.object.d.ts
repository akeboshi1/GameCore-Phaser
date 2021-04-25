import { IPos } from "structure";
import { IRoomService } from "../room";
export declare class MatterWorkerObject {
    protected mRoomService: IRoomService;
    protected mGuid: number;
    protected hasBody: boolean;
    protected _tempVec2: any;
    protected _sensor: boolean;
    protected _offsetOrigin: any;
    constructor(id: number, mRoomService: IRoomService);
    set guid(val: number);
    get guid(): number;
    set _offset(val: any);
    applyForce(force: any): Promise<this>;
    setVelocityX(x: number): void;
    setVelocityY(y: number): void;
    setVelocity(x: number, y: number): void;
    setPosition(pos: IPos): void;
    destroy(): void;
    protected setBody(): void;
    protected addBody(): void;
    protected updateBody(model: any): void;
    protected removeBody(): void;
    protected setVertices(vertexSets: any): Promise<any>;
    protected getSensor(): boolean;
}
