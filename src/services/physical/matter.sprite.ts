import { AnimationModel, IDragonbonesModel, IFramesModel, RunningAnimation, IAnimationData, AnimationQueue, Animator } from "structure";
import { Direction, IPos, Logger, LogicPoint, LogicPos } from "utils";
import { op_def, op_gameconfig, op_client, op_gameconfig_01 } from "pixelpai_proto";
import { Helpers } from "game-capsule";
export class MatterSprite {
    public id: number;
    public pos: IPos;
    public speed: number;
    public direction: number;
    public currentAnimationName: string;
    public currentAnimation: RunningAnimation;
    public animations: Map<string, AnimationModel>;
    public registerAnimation: Map<string, string>;
    public animationQueue: AnimationQueue[];
    public originCollisionPoint: LogicPoint;
    public mountSprites: number[];
    public animator: Animator;
    protected sprite: op_client.ISprite;
    protected currentCollisionArea: number[][];
    protected currentWalkableArea: number[][];
    protected currentCollisionPoint: LogicPoint;
    protected originWalkPoint: LogicPoint;
    protected interactive: op_def.IPBPoint2f[];
    constructor(obj: op_client.ISprite) {
        this.id = obj.id;
        this.sprite = obj;
        if (obj.point3f) {
            const point = obj.point3f;
            this.pos = new LogicPos(point.x, point.y, point.z);
        } else {
            this.pos = new LogicPos(0, 0);
        }
        this.currentAnimationName = obj.currentAnimationName || "";
        this.setDirection(obj.direction || 3);
        const anis = obj.animations;
        if (anis) {
            if (!this.animations) this.animations = new Map();
            const tmpList = [];
            const objAnis = anis;
            for (const ani of objAnis) {
                const model = new AnimationModel(ani);
                tmpList.push(model);
            }
            // this.displayInfo = new FramesModel({
            //     animations: {
            //         defaultAnimationName: this.currentAnimationName,
            //         display,
            //         animationData: tmpList,
            //     },
            //     id: this.id
            // });
            // if (defAnimation) {
            //     this.currentAnimationName = defAnimation;
            // }

            this.setAnimationModelData(tmpList);
        }
        if (!this.currentCollisionArea) {
            this.currentCollisionArea = this.getCollisionArea();
        }

        if (!this.currentWalkableArea) {
            this.currentWalkableArea = this.getWalkableArea();
        }

        if (!this.currentCollisionPoint) {
            this.currentCollisionPoint = this.getOriginPoint();
        }

        if (!this.interactive) {
            // this.interactive = this.
        }

        this.speed = obj.speed;
    }

    public setPosition(x: number, y: number) {
        if (!this.pos) {
            this.pos = new LogicPos();
        }
        this.pos.x = x;
        this.pos.y = y;
    }

    public updateDisplay(display: op_gameconfig.IDisplay, animations: op_gameconfig_01.IAnimationData[], defAnimation?: string) {
        if (!display || !animations) {
            return;
        }
        if (display) {
            const anis = [];
            const objAnis = animations;
            for (const ani of objAnis) {
                anis.push(new AnimationModel(ani));
            }
            defAnimation = defAnimation || this.currentAnimationName || "";
        }
    }

    setDirection(val: number) {
        if (!val) return;
        this.direction = val;
        Logger.getInstance().log("setDirection:=====", val);
        this.setAnimationData(this.currentAnimationName, this.direction);
    }

    setDisplayInfo(displayInfo: IFramesModel | IDragonbonesModel) {
    }

    get hasInteractive(): boolean {
        if (!this.currentAnimation || !this.sprite.animations) {
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
        if (!this.sprite.animations) return;
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
        if (!this.currentAnimation) {
            return;
        }
        const animationName = this.currentAnimation.name;
        const ani = this.getAnimations(animationName);
        const flip = this.currentAnimation.flip;
        if (flip) {
            return Helpers.flipArray(ani.collisionArea);
        }
        return ani.collisionArea;
        // const { name: animationName, flip } = this.currentAnimation;
        // return (<any>this.displayInfo).getCollisionArea(animationName, flip);
    }

    public getAnimations(name: string): IAnimationData {
        if (!this.animations) return;
        return this.animations.get(name);
    }

    public getWalkableArea() {
        if (!this.currentAnimation) {
            return;
        }
        const animationName = this.currentAnimation.name;
        const ani = this.getAnimations(animationName);
        const flip = this.currentAnimation.flip;
        if (flip) {
            return Helpers.flipArray(ani.walkableArea);
        }
        return ani.walkableArea;
        // const { name: animationName, flip } = this.currentAnimation;
        // return (<any>this.displayInfo).getWalkableArea(animationName, flip);
    }

    public getOriginPoint() {
        if (!this.currentAnimation) {
            return;
        }
        const animationName = this.currentAnimation.name;
        const ani = this.getAnimations(animationName);
        const flip = this.currentAnimation.flip;
        const originPoint = ani.originPoint;
        if (flip) {
            return new LogicPoint(originPoint.y, originPoint.x);
        }
        return originPoint;
        // const { name: animationName, flip } = this.currentAnimation;
        // return (<any>this.displayInfo).getOriginPoint(animationName, flip);
    }

    public findAnimation(baseName: string, dir: Direction): RunningAnimation {
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
        this.currentAnimation = this.findAnimation(baseAniName, direction);
        this.currentAnimation.times = times;
        if (this.animationQueue && this.animationQueue.length > 0) this.currentAnimation.playingQueue = this.animationQueue[0];
        if (this.currentCollisionArea) {
            this.setArea();
        }
        return this.currentAnimation;
    }

    private setAnimationModelData(aniDatas: AnimationModel[]) {
        if (!aniDatas) {
            Logger.getInstance().error(`${this.id} animationData does not exist`);
            return;
        }
        if (!this.animations) this.animations = new Map();
        for (const aniData of aniDatas) {
            this.animations.set(aniData.name, aniData);
        }
    }

    private setArea() {
        this.currentCollisionArea = this.getCollisionArea();
        this.currentWalkableArea = this.getWalkableArea();
        this.currentCollisionPoint = this.getOriginPoint();
    }
}
