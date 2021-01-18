import { IDragonbonesModel, IFramesModel, RunningAnimation, AnimationQueue, Animator } from "structure";
import { Direction, IPos, Logger, LogicPoint, LogicPos } from "utils";
import { op_def, op_gameconfig_01 } from "pixelpai_proto";
import { Helpers } from "game-capsule";
import { IPoint } from "game-capsule";
export class MatterSprite {
    public id: number;
    public pos: IPos;
    public speed: number;
    public direction: number;
    public currentAnimationName: string;
    public currentAnimation: RunningAnimation;
    public animations: Map<string, MatterAnimationModel>;
    public registerAnimation: Map<string, string>;
    public animationQueue: AnimationQueue[];
    public originCollisionPoint: LogicPoint;
    public mountSprites: number[];
    public animator: Animator;
    protected sprite: any;
    protected currentCollisionArea: number[][];
    protected currentWalkableArea: number[][];
    protected currentCollisionPoint: LogicPoint;
    protected originWalkPoint: LogicPoint;
    protected interactive: op_def.IPBPoint2f[];
    constructor(obj: any) {
        this.id = obj.id;
        this.sprite = obj;
        if (obj.point3f) {
            const point = obj.point3f;
            this.pos = new LogicPos(point.x, point.y, point.z);
        } else if (obj.displayInfo && obj.displayInfo.pos) {
            this.pos = new LogicPos(obj.displayInfo.pos.x, obj.displayInfo.pos.y);
        } else if (obj.pos) {
            this.pos = new LogicPos(obj.pos.x, obj.pos.y);
        } else {
            this.pos = new LogicPos(0, 0);
        }
        this.currentAnimationName = obj.currentAnimationName || "";
        this.setDirection(obj.direction || 3);
        const anis = obj.displayInfo ? obj.displayInfo.animations : obj.animations;
        if (anis) {
            this.initAnimations(anis);
        }

        if (!this.interactive) {
            // this.interactive = this.
        }
        this.speed = obj.speed;
    }

    public initAnimations(anis: any) {
        if (!this.animations) this.animations = new Map();
        const tmpList = [];
        anis.forEach((ani: any) => {
            if (ani && (ani.mNode || ani.node)) {
                const model = new MatterAnimationModel(ani);
                tmpList.push(model);
            }
        });
        this.setAnimationModelData(tmpList);
        if (!this.currentCollisionArea) {
            this.currentCollisionArea = this.getCollisionArea();
        }

        if (!this.currentWalkableArea) {
            this.currentWalkableArea = this.getWalkableArea();
        }

        if (!this.currentCollisionPoint) {
            this.currentCollisionPoint = this.getOriginPoint();
        }

    }

    public setPosition(x: number, y: number) {
        if (!this.pos) {
            this.pos = new LogicPos();
        }
        this.pos.x = x;
        this.pos.y = y;
    }

    public updateAnimations(anis: op_gameconfig_01.IAnimationData[]) {
        if (!anis) {
            return;
        }
        this.initAnimations(anis);
    }

    setDirection(val: number) {
        if (!val) return;
        this.direction = val;
        // Logger.getInstance().log("setDirection:=====", val);
        this.setAnimationData(this.currentAnimationName, this.direction);
    }

    setDisplayInfo(displayInfo: IFramesModel | IDragonbonesModel) {
    }

    get hasInteractive(): boolean {
        if (!this.currentAnimation || !this.sprite.displayInfo.animations) {
            return false;
        }
        const { name: animationName } = this.currentAnimation;
        const area = this.getInteractiveArea(animationName);
        if (area && area.length > 0) {
            return true;
        }
        return false;
    }

    public getInteractiveArea(aniName: string, flip: boolean = false): op_def.IPBPoint2i[] | undefined {
        const ani = this.animations.get(aniName);
        if (ani) {
            if (flip) {
                const area = [];
                const interactiveArea = ani.interactiveArea;
                for (const interactive of interactiveArea) {
                    area.push({ x: interactive.y, y: interactive.x });
                }
                return area;
            }
            return ani.interactiveArea;
        }
        return;
    }

    public getInteractive() {
        if (!this.currentAnimation) {
            return;
        }
        const { name: animationName, flip } = this.currentAnimation;
        return this.getInteractiveArea(animationName, flip);
    }

    public setOriginCollisionPoint(value: number[] | null): void {
        if (this.originCollisionPoint === undefined) {
            this.originCollisionPoint = new LogicPoint();
        }
        if (value && value.length > 1) {
            this.originCollisionPoint.x = value[0];
            this.originCollisionPoint.y = value[1];
        }
    }

    public setOriginWalkPoint(value: number[] | null): void {
        if (this.originWalkPoint === undefined) {
            this.originWalkPoint = new LogicPoint();
        }
        if (value && value.length > 1) {
            this.originWalkPoint.x = value[0];
            this.originWalkPoint.y = value[1];
        }
    }

    public getCollisionArea() {
        if (!this.sprite.displayInfo || !this.sprite.displayInfo.animations) return [[1]];
        if (!this.currentAnimation) {
            return;
        }
        const animationName = this.currentAnimation.name;
        const ani = this.getAnimations(animationName);
        if (!ani) return [[1]];
        const flip = this.currentAnimation.flip;
        if (flip) {
            return Helpers.flipArray(ani.collisionArea);
        }
        return ani.collisionArea;
        // const { name: animationName, flip } = this.currentAnimation;
        // return (<any>this.displayInfo).getCollisionArea(animationName, flip);
    }

    public getAnimations(name: string): IMatterAnimationData {
        if (!this.animations) return;
        return this.animations.get(name);
    }

    public getWalkableArea() {
        if (!this.sprite.displayInfo || !this.sprite.displayInfo.animations) return [[0]];
        if (!this.currentAnimation) {
            return;
        }
        const animationName = this.currentAnimation.name;
        const ani = this.getAnimations(animationName);
        if (!ani) return [[0]];
        const flip = this.currentAnimation.flip;
        if (flip) {
            return Helpers.flipArray(ani.walkableArea);
        }
        return ani.walkableArea;
        // const { name: animationName, flip } = this.currentAnimation;
        // return (<any>this.displayInfo).getWalkableArea(animationName, flip);
    }

    public getOriginPoint() {
        if (!this.sprite.displayInfo || !this.sprite.displayInfo.animations) return new LogicPoint(0, 0);
        if (!this.currentAnimation) {
            return;
        }
        const animationName = this.currentAnimation.name;
        const ani = this.getAnimations(animationName);
        if (!ani) return new LogicPoint(0, 0);
        const flip = this.currentAnimation.flip;
        const originPoint = ani.originPoint;
        if (flip) {
            return new LogicPoint(originPoint.y, originPoint.x);
        }
        return originPoint;
        // const { name: animationName, flip } = this.currentAnimation;
        // return (<any>this.displayInfo).getOriginPoint(animationName, flip);
    }

    public findDragonBonesAnimation(baseName: string, dir: Direction): RunningAnimation {
        let flip = false;
        switch (dir) {
            case Direction.south_east:
                flip = true;
                dir = Direction.west_south;
                break;
            case Direction.east_north:
                flip = true;
                dir = Direction.north_west;
                break;
        }
        let addName: string = "";
        if ((dir >= Direction.north && dir < Direction.west) || dir > Direction.east && dir <= Direction.east_north) addName = "_back";
        return { name: `${baseName}${addName}`, flip };
    }

    public findFramesAnimation(baseName: string, dir: number): RunningAnimation {
        let flip = false;
        switch (dir) {
            case Direction.west_south:
            case Direction.east_north:
                break;
            case Direction.south_east:
                flip = true;
                break;
            case Direction.north_west:
                flip = true;
                break;
        }
        let addName: string = "";
        if ((dir >= Direction.north && dir < Direction.west) || dir > Direction.east && dir <= Direction.east_north) addName = "_back";
        return { name: `${baseName}${addName}`, flip };
    }

    public setAnimationName(name: string, playTimes?: number): RunningAnimation {
        if (!this.currentAnimation || this.currentAnimationName !== name) {
            name = this.animator ? this.animator.getAnimationName(name) : name;
            this.currentAnimationName = name;
            const ani = this.setAnimationData(name, this.direction, playTimes);
            return ani;
        }
        return null;
    }

    private setAnimationData(animationName: string, direction: number, times?: number) {
        if (!animationName) {
            return;
        }
        let baseAniName = animationName.split(`_`)[0];
        if (this.registerAnimation) {
            if (this.registerAnimation.has(baseAniName)) {
                baseAniName = this.registerAnimation.get(baseAniName);
            }
        }
        if (this.sprite.displayInfo) {
            if (this.sprite.displayInfo.discriminator === "FramesModel") {
                this.currentAnimation = this.findFramesAnimation(baseAniName, direction);
            } else {
                this.currentAnimation = this.findDragonBonesAnimation(baseAniName, direction);
            }
        } else {
            this.currentAnimation = this.findFramesAnimation(baseAniName, direction);
        }
        this.currentAnimation.times = times;
        if (this.animationQueue && this.animationQueue.length > 0) this.currentAnimation.playingQueue = this.animationQueue[0];
        if (this.currentCollisionArea) {
            this.setArea();
        }
        return this.currentAnimation;
    }

    private setAnimationModelData(aniDatas: MatterAnimationModel[]) {
        if (!aniDatas) {
            Logger.getInstance().error(`${this.id} animationData does not exist`);
            return;
        }
        if (!this.animations) this.animations = new Map();
        for (const aniData of aniDatas) {
            const dirList = aniData.name.split("_");
            let aniName: string;
            let dir: number;
            if (dirList && dirList.length > 1) {
                dir = Number(dirList[1]);
                let addName: string = "";
                if ((dir >= Direction.north && dir < Direction.west) || dir > Direction.east && dir <= Direction.east_north) addName = "_back";
                aniName = dirList[0] + `${addName}`;
            } else {
                aniName = aniData.name;
            }
            this.animations.set(aniName, aniData);
        }
    }

    private setArea() {
        this.currentCollisionArea = this.getCollisionArea();
        this.currentWalkableArea = this.getWalkableArea();
        this.currentCollisionPoint = this.getOriginPoint();
    }
}

export interface IMatterAnimationData {
    name: string;
    frameName: string[];
    frameRate: number;
    loop: boolean;
    baseLoc: LogicPoint;
    collisionArea?: number[][];
    walkableArea?: number[][];
    originPoint: LogicPoint;
    layer: op_gameconfig_01.IAnimationLayer[];
    interactiveArea?: op_def.IPBPoint2i[];
    mountLayer: op_gameconfig_01.IAnimationMountLayer;
}

export class MatterAnimationModel implements IMatterAnimationData {
    id: number;
    name: string;
    frameName: string[];
    frameRate: number;
    loop: boolean;
    baseLoc: LogicPoint;
    collisionArea?: number[][];
    walkableArea?: number[][];
    originPoint: LogicPoint;
    layer: op_gameconfig_01.IAnimationLayer[];
    interactiveArea: IPoint[];
    mountLayer: op_gameconfig_01.IAnimationMountLayer;
    protected mNode: op_gameconfig_01.INode;
    constructor(ani: any) {
        const tmpBaseLoc = ani.baseLoc;
        this.mNode = ani.mNode || ani.node;
        this.id = this.mNode.id;
        this.name = this.mNode.name;
        this.frameName = ani.frameName;
        if (!ani.frameName || this.frameName.length < 1) {
            // Logger.getInstance().fatal(`Animation: ${ani.id} frames is invalid`);
        }
        this.loop = ani.loop;
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
        this.frameRate = ani.frameRate;
        this.baseLoc = new LogicPoint(parseInt(tmpBaseLoc[0], 10), parseInt(tmpBaseLoc[1], 10));
        const origin = ani.originPoint;
        this.originPoint = new LogicPoint(origin.x, origin.y);
        if (typeof ani.collisionArea === "string") {
            this.collisionArea = this.stringToArray(ani.collisionArea, ",", "&") || [[0]];
        } else {
            this.collisionArea = ani.collisionArea || [[0]];
        }

        if (typeof ani.walkableArea === "string") {
            this.walkableArea = this.stringToArray(ani.walkableArea, ",", "&") || [[0]];
        } else {
            this.walkableArea = ani.walkableArea || [[0]];
        }
        // this.mInteractiveArea = [{x: 0, y: 0}];
        this.interactiveArea = ani.interactiveArea;
        this.changeLayer(ani.layer);
        this.mountLayer = ani.mountLayer;
    }

    changeLayer(layer: any[]) {
        this.layer = layer;
        if (this.layer.length < 1) {
            this.layer = [{
                frameName: this.frameName,
                offsetLoc: this.baseLoc
            }];
        }
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
        ani.walkableArea = this.arrayToString(this.walkableArea, ",", "&");
        ani.collisionArea = this.arrayToString(this.collisionArea, ",", "&");
        ani.interactiveArea = this.interactiveArea;
        const layers = [];
        for (const layer of this.layer) {
            layers.push(op_gameconfig_01.AnimationLayer.create(layer));
        }
        ani.layer = layers;
        this.changeLayer(ani.layer);
        ani.mountLayer = this.mountLayer;
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
}
