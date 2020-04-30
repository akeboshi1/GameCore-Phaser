import { op_gameconfig_01, op_def, op_client } from "pixelpai_proto";
import { Logger } from "../../utils/log";
import { SceneryNode } from "game-capsule";

export interface IScenery {
    readonly id: number;
    readonly depth: number;
    readonly width: number;
    readonly height: number;
    readonly uris: string[][];
    readonly speed: number;
    readonly fit: Fit;
    readonly offset: op_def.IPBPoint2f;
}

export class Scenery implements IScenery {
    private mID: number;
    private mDepth: number;
    private mWidth: number;
    private mHeight: number;
    private mUris: string[][];
    private mSpeed: number;
    private mFit: Fit;
    private mOffset: op_def.IPBPoint2f;
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
            this.mUris[i] = new Array(val.length);
            for (let j = 0; j < val.length; j++) {
                this.mUris[i][j] = val[j];
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

    get offset(): op_def.IPBPoint2f {
        return this.mOffset;
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

export enum Fit {
    Center = 1,
    Fill
}
