import { op_def, op_client } from "pixelpai_proto";
import { Fit, IScenery } from "structure";
import { ILogicPoint, Logger, LogicPoint } from "utils";

export class Scenery implements IScenery {
    private mID: number;
    private mDepth: number;
    private mWidth: number;
    private mHeight: number;
    private mUris: string[][];
    private mSpeed: number;
    private mFit: Fit;
    private mOffset: ILogicPoint;
    constructor(scenery: op_client.IOP_EDITOR_REQ_CLIENT_ADD_SCENERY) {
        this.mID = scenery.id;
        this.mDepth = scenery.depth;
        this.mUris = [];
        let uris = null;
        if (Array.isArray(scenery.uris)) {
            uris = scenery.uris;
        } else {
            uris = scenery.uris.value;
        }

        if (uris.length < 1) {
            Logger.getInstance().error(`${Scenery.name}: scenery uris is empty`);
        }
        for (let i = 0; i < uris.length; i++) {
            const val = uris[i].value || uris;
            this.mUris[i] = new Array(val[i].length);
            for (let j = 0; j < val[i].length; j++) {
                this.mUris[i][j] = val[i][j];
            }
        }
        this.mSpeed = scenery.speed || 1;
        if (!scenery.width) {
            Logger.getInstance().error(`${Scenery.name}: scenery width is ${scenery.width}`);
        }
        if (!scenery.height) {
            Logger.getInstance().error(`${Scenery.name}: scenery height is ${scenery.height}`);
        }
        this.mWidth = scenery.width;
        this.mHeight = scenery.height;
        this.mFit = scenery.fit;
        this.mOffset = scenery.offset || { x: 0, y: 0 };
        // const pos = { x: 0, y: 0 };
        // const offset = scenery.offset;
        // if (offset) {
        //     pos.x = offset.x;
        //     pos.y = offset.y;
        // }
        // this.mOffset = pos;
    }

    get offset(): ILogicPoint {
        return this.mOffset;
    }

    get width(): number {
        return this.mWidth;
    }

    get height(): number {
        return this.mHeight;
    }

    get id(): number {
        return this.mID;
    }

    get depth(): number {
        return this.mDepth;
    }

    get speed(): number {
        return this.mSpeed;
    }

    get uris(): string[][] {
        return this.mUris;
    }

    get fit(): Fit {
        return this.mFit;
    }
}
