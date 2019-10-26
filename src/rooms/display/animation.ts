import {AnimationDataNode} from "game-capsule/lib/configobjects/animations";
import { op_gameconfig } from "pixelpai_proto";

export interface IAnimationData {
    name: string;
    frameName: string[];
    frameRate: number;
    loop: boolean;
    baseLoc: Phaser.Geom.Point;
    collisionArea?: number[][];
    walkableArea?: number[][];
}

export class Animation implements IAnimationData {
    protected mBaseLoc: Phaser.Geom.Point;
    protected mFrameName: string[];
    protected mFrameRate: number;
    protected mLoop: boolean;
    protected mName: string;
    protected mCollisionArea: number[][];
    protected mWalkableArea: number[][];

    constructor(ani: AnimationDataNode | op_gameconfig.IAnimation) {
        let tmpBaseLoc = null;
        if (typeof ani.baseLoc === "string") {
            tmpBaseLoc = ani.baseLoc.split(",");
        } else {
            tmpBaseLoc = ani.baseLoc;
        }
        this.mBaseLoc = tmpBaseLoc;
        this.mName = ani.name;
        this.mFrameName = ani.frameName;
        this.mLoop = ani.loop;
        this.mBaseLoc = new Phaser.Geom.Point(tmpBaseLoc[0], tmpBaseLoc[1]);
        if (typeof ani.collisionArea === "string") {

        } else {
            this.mCollisionArea = ani.collisionArea;
        }

        if (typeof ani.walkableArea === "string") {

        } else {
            this.mWalkableArea = ani.walkableArea;
        }
    }

    get baseLoc(): Phaser.Geom.Point {
        return this.mBaseLoc;
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
}
