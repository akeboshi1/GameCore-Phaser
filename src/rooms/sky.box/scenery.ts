import { op_gameconfig_01 } from "pixelpai_proto";
import { Logger } from "../../utils/log";

export interface IScenery {
    readonly id: number;
    readonly depth: number;
    readonly width: number;
    readonly height: number;
    readonly uris: string[][];
    readonly speed: number;
    readonly fit: Fit;
    readonly offset: Phaser.Geom.Point;
}

export class Scenery implements IScenery {
    private mID: number;
    private mDepth: number;
    private mWidth: number;
    private mHeight: number;
    private mUris: string[][];
    private mSpeed: number;
    private mFit: Fit;
    private mOffset: Phaser.Geom.Point;
    constructor(scenery: op_gameconfig_01.IScenery) {
        this.mID = scenery.node.id;
        this.mDepth = scenery.depth;
        this.mUris = [];
        const uris = scenery.uris.value || [];
        if (!scenery.uris || uris.length < 1) {
            Logger.getInstance().fatal(`${Scenery.name}: scenery uris is empty`);
        }
        for (let i = 0; i < uris.length; i++) {
            const val = uris[i].value || [];
            this.mUris[i] = new Array(val.length);
            for (let j = 0; j < val.length; j++) {
                this.mUris[i][j] = val[j];
            }
        }
        this.mSpeed = scenery.speed || 1;
        if (!scenery.width) {
            Logger.getInstance().fatal(`${Scenery.name}: scenery width is ${scenery.width}`);
        }
        if (!scenery.height) {
            Logger.getInstance().fatal(`${Scenery.name}: scenery height is ${scenery.height}`);
        }
        this.mWidth = scenery.width;
        this.mHeight = scenery.height;
        this.mFit = scenery.fit;
        const {x, y} = scenery.offset || { x: 0, y: 0 };
        this.mOffset = new Phaser.Geom.Point(x, y);
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

    get offset(): Phaser.Geom.Point {
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
