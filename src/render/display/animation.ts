import { op_gameconfig_01, op_def } from "pixelpai_proto";
import { IPoint } from "game-capsule";

export interface IAnimationData {
    name: string;
    frameName: string[];
    frameRate: number;
    loop: boolean;
    baseLoc: Phaser.Geom.Point;
    collisionArea?: number[][];
    walkableArea?: number[][];
    originPoint: Phaser.Geom.Point;

    readonly interactiveArea?: op_def.IPBPoint2i[];
    readonly layer: op_gameconfig_01.IAnimationLayer[];
    readonly mountLayer: op_gameconfig_01.IAnimationMountLayer;

    createProtocolObject(): op_gameconfig_01.IAnimationData;
}

export interface PlayAnimation {
    name: string;
    flip: boolean;
    times?: number;
    playingQueue?: AnimationQueue;
}

export interface AnimationQueue {
    name: string;
    playTimes?: number;
    playedTimes?: number;
    complete?: Function;
}

export class Animation implements IAnimationData {
    protected mNode: op_gameconfig_01.INode;
    protected mID: number;
    protected mBaseLoc: Phaser.Geom.Point;
    protected mFrameName: string[];
    protected mFrameRate: number;
    protected mLoop: boolean;
    protected mName: string;
    protected mCollisionArea: number[][];
    protected mWalkableArea: number[][];
    protected mOriginPoint: Phaser.Geom.Point;
    protected mInteractiveArea: IPoint[];
    protected mLayer: op_gameconfig_01.IAnimationLayer[];
    protected mMountLayer: op_gameconfig_01.IAnimationMountLayer;

    constructor(ani: op_gameconfig_01.IAnimationData) {
        const tmpBaseLoc = ani.baseLoc.split(",");
        this.mNode = ani.node;
        this.mID = ani.node.id;
        this.mName = ani.node.name;
        this.mFrameName = ani.frameName;
        if (!ani.frameName || this.mFrameName.length < 1) {
            // Logger.getInstance().fatal(`Animation: ${ani.id} frames is invalid`);
        }
        this.mLoop = ani.loop;
        if (!ani.loop) {
            // Logger.getInstance().fatal(`Animation: ${ani.id} loop is invalid`);
        }
        if (!ani.frameRate) {
            // Logger.getInstance().fatal(`Animation: ${ani.id} frameRate is invalid`);
        }
        if (ani.originPoint) {
            // Logger.getInstance().fatal(`Animation: ${ani.id} originPoint is invalid`);
        }
        if (!ani.baseLoc) {
            // Logger.getInstance().fatal(`Animation: ${ani.id} baseLoc is invalid`);
        }
        this.mFrameRate = ani.frameRate;
        this.mBaseLoc = new Phaser.Geom.Point(parseInt(tmpBaseLoc[0], 10), parseInt(tmpBaseLoc[1], 10));
        const origin = ani.originPoint;
        this.mOriginPoint = new Phaser.Geom.Point(origin[0], origin[1]);
        if (typeof ani.collisionArea === "string") {
            this.mCollisionArea = this.stringToArray(ani.collisionArea, ",", "&") || [[0]];
        } else {
            this.mCollisionArea = ani.collisionArea || [[0]];
        }

        if (typeof ani.walkableArea === "string") {
            this.mWalkableArea = this.stringToArray(ani.walkableArea, ",", "&") || [[0]];
        } else {
            this.mWalkableArea = ani.walkableArea || [[0]];
        }
        // this.mInteractiveArea = [{x: 0, y: 0}];
        this.mInteractiveArea = ani.interactiveArea;
        this.mLayer = ani.layer;
        this.mMountLayer = ani.mountLayer;
    }

    createProtocolObject(): op_gameconfig_01.IAnimationData {
        const ani = op_gameconfig_01.AnimationData.create();
        ani.node = this.mNode;
        ani.baseLoc = `${this.baseLoc.x},${this.baseLoc.y}`;
        ani.node.name = this.name;
        ani.loop = this.loop;
        ani.frameRate = this.frameRate;
        ani.frameName = this.frameName;
        ani.originPoint = [this.originPoint.x, this.originPoint.y];
        ani.walkOriginPoint = [this.originPoint.x, this.originPoint.y];
        ani.walkableArea = this.arrayToString(this.mWalkableArea, ",", "&");
        ani.collisionArea = this.arrayToString(this.mCollisionArea, ",", "&");
        ani.interactiveArea = this.mInteractiveArea;
        const layers = [];
        for (const layer of this.mLayer) {
            layers.push(op_gameconfig_01.AnimationLayer.create(layer));
        }
        ani.layer = layers;
        ani.mountLayer = this.mMountLayer;
        return ani;
    }

    private stringToArray(string: string, fristJoin: string, lastJoin: string) {
        if (!string) {
            return;
        }
        const tmp = string.split(lastJoin);
        const result = [];
        for (const ary of tmp) {
            const tmpAry = ary.split(fristJoin);
            result.push(tmpAry.map((value) => parseInt(value, 10)));
        }
        return result;
    }

    private arrayToString<T>(array: T[][], fristJoin: string, lastJoin: string): string {
        if (!array) return "";
        const tmp = [];
        for (const ary of array) {
            tmp.push(ary.join(fristJoin));
        }
        return tmp.join(lastJoin);
    }

    get baseLoc(): Phaser.Geom.Point {
        return this.mBaseLoc;
    }

    get id(): number {
        return this.mID;
    }

    get frameName(): string[] {
        return this.mFrameName;
    }

    get frameRate(): number {
        return this.mFrameRate;
    }

    get loop(): boolean {
        return this.mLoop;
    }

    get name(): string {
        return this.mName;
    }

    get collisionArea(): number[][] {
        return this.mCollisionArea;
    }

    get walkableArea(): number[][] {
        return this.mWalkableArea;
    }

    get originPoint(): Phaser.Geom.Point {
        return this.mOriginPoint;
    }

    get interactiveArea(): op_def.IPBPoint2i[] {
        return this.mInteractiveArea;
    }

    get layer() {
        if (this.mLayer.length > 0) {
            return this.mLayer;
        }
        return [{
            frameName: this.mFrameName,
            offsetLoc: this.mBaseLoc
        }];
    }

    get mountLayer() {
        return this.mMountLayer;
    }
}
