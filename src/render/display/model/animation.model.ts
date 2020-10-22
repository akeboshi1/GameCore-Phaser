
export interface IAnimationModel {
    name: string;
    frameName: string[];
    frameRate: number;
    loop: boolean;
    collisionArea?: number[][];
    walkableArea?: number[][];
}

export class AnimationModel implements IAnimationModel {
    protected mID: number;
    protected mFrameName: string[];
    protected mFrameRate: number;
    protected mLoop: boolean;
    protected mName: string;
    protected mCollisionArea: number[][];
    protected mWalkableArea: number[][];

    constructor(ani) {
        const tmpBaseLoc = ani.baseLoc.split(",");
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
        const origin = ani.originPoint;
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
    }

    createProtocolObject() {
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
}
