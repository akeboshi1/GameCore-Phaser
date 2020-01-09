import {AnimationDataNode} from "game-capsule/lib/configobjects/animations";
import { op_gameconfig } from "pixelpai_proto";
import {Logger} from "../../utils/log";

export interface IAnimationData {
    name: string;
    frameName: string[];
    frameRate: number;
    loop: boolean;
    baseLoc: Phaser.Geom.Point;
    collisionArea?: number[][];
    walkableArea?: number[][];
    originPoint: Phaser.Geom.Point;

    toClient(): op_gameconfig.IAnimation;
}

export class Animation implements IAnimationData {
    protected mID: number;
    protected mBaseLoc: Phaser.Geom.Point;
    protected mFrameName: string[];
    protected mFrameRate: number;
    protected mLoop: boolean;
    protected mName: string;
    protected mCollisionArea: number[][];
    protected mWalkableArea: number[][];
    protected mOriginPoint: Phaser.Geom.Point;

    constructor(ani: AnimationDataNode | op_gameconfig.IAnimation) {
        let tmpBaseLoc = null;
        if (typeof ani.baseLoc === "string") {
            tmpBaseLoc = ani.baseLoc.split(",");
        } else {
            tmpBaseLoc = [ani.baseLoc.x, ani.baseLoc.y];
        }
        this.mID = ani.id;
        this.mBaseLoc = tmpBaseLoc;
        this.mName = ani.name;
        this.mFrameName = ani.frameName;
        this.mLoop = ani.loop;
        this.mFrameRate = ani.frameRate;
        this.mBaseLoc = new Phaser.Geom.Point(parseInt(tmpBaseLoc[0], 10), parseInt(tmpBaseLoc[1], 10));
        const origin = ani.originPoint;
        if (Array.isArray(origin)) {
            this.mOriginPoint = new Phaser.Geom.Point(origin[0], origin[1]);
        } else {
            this.mOriginPoint = new Phaser.Geom.Point(origin.x, origin.y);
        }
        if (typeof ani.collisionArea === "string") {
            this.mCollisionArea = this.stringToArray(ani.collisionArea, ",", "&");
        } else {
            this.mCollisionArea = ani.collisionArea;
        }

        if (typeof ani.walkableArea === "string") {
            this.mWalkableArea = this.stringToArray(ani.walkableArea, ",", "&");
        } else {
            this.mWalkableArea = ani.walkableArea;
        }
    }

    toClient(): op_gameconfig.IAnimation {
        const ani = op_gameconfig.Animation.create();
        ani.id = this.id;
        ani.baseLoc = `${this.baseLoc.x},${this.baseLoc.y}`;
        ani.name = this.name;
        ani.loop = this.loop;
        ani.frameRate = this.frameRate;
        ani.frameName = this.frameName;
        ani.originPoint = [this.originPoint.x, this.originPoint.y];
        ani.walkOriginPoint = [this.originPoint.x, this.originPoint.y];
        ani.walkableArea = this.arrayToString(this.mWalkableArea, ",", "&");
        ani.collisionArea = this.arrayToString(this.mCollisionArea, ",", "&");
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

    get originPoint(): Phaser.Geom.Point {
        return this.mOriginPoint;
    }
}
