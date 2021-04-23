import { op_client } from "pixelpai_proto";
import { ILogicPoint, Fit, IScenery } from "structure";
export declare class Scenery implements IScenery {
    private mID;
    private mDepth;
    private mWidth;
    private mHeight;
    private mUris;
    private mSpeed;
    private mFit;
    private mOffset;
    constructor(scenery: op_client.IOP_EDITOR_REQ_CLIENT_ADD_SCENERY);
    get offset(): ILogicPoint;
    get width(): number;
    get height(): number;
    get id(): number;
    get depth(): number;
    get speed(): number;
    get uris(): string[][];
    get fit(): Fit;
}
