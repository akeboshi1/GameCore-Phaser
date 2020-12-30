import { AnimationModel, AnimationQueue, Animator, AvatarSuit, IAvatar, IDragonbonesModel, IFramesModel, ISprite, RunningAnimation } from "structure";
import { IPos, LogicPoint, LogicPos } from "utils";
import { op_def, op_gameconfig, op_client, op_gameconfig_01 } from "pixelpai_proto";

export class MatterSprite {
    public id: number;
    public pos: IPos;
    public titleMask: number;
    public avatar: IAvatar;
    public currentAnimationName: string;
    public direction: number = 3;
    public bindID: number;
    public sn: string;
    public alpha: number;
    public nickname: string;
    public displayBadgeCards: op_def.IBadgeCard[];

    public package: op_gameconfig.IPackage;
    public sceneId: number;
    public uuid: number;
    public platformId: string;
    public displayInfo: IFramesModel | IDragonbonesModel;
    public nodeType: op_def.NodeType;
    public currentAnimation: RunningAnimation;
    public currentCollisionArea: number[][];
    public currentWalkableArea: number[][];
    public currentCollisionPoint: LogicPoint;
    public version: string;
    public isMoss: boolean;
    public registerAnimation: Map<string, string>;

    public originWalkPoint: LogicPoint;

    public originCollisionPoint: LogicPoint;

    public attrs: op_def.IStrPair[];
    public suits: AvatarSuit[];
    public animationQueue: AnimationQueue[];

    public mountSprites: number[];

    public speed: number;
    public interactive: op_def.IPBPoint2f[];
    public animator?: Animator;
    public updateSuits: boolean = false;

    constructor(obj: op_client.ISprite, nodeType?: op_def.NodeType) {
        this.id = obj.id;
        if (obj.point3f) {
            const point = obj.point3f;
            this.pos = new LogicPos(point.x, point.y, point.z);
        } else {
            this.pos = new LogicPos(0, 0);
        }
        // this.updateAttr(obj.attrs);
        // if (this.updateSuits)
        //     this.updateAvatarSuits(this.suits);
        // this.avatar = this.avatar || obj.avatar;
        // if (this.avatar) {
        //     this.updateAvatar(this.avatar);
        // }
        // if (obj.display) {
        //     this.updateDisplay(obj.display, obj.animations, obj.currentAnimationName);
        // }
        if (obj.sn) {
            this.sn = obj.sn;
        }
        // this.tryRegisterAnimation(obj.animationRegistrationMap);
        this.currentAnimationName = obj.currentAnimationName;
        this.direction = obj.direction || 3;
        // this.titleMask = obj.titleMask;
        this.setDirection(obj.direction || 3);
        // this.nickname = obj.nickname;
        this.bindID = obj.bindId;
        // this.alpha = obj.opacity === undefined ? 1 : obj.opacity / 100;
        // this.displayBadgeCards = obj.displayBadgeCards;
        this.nodeType = nodeType;

        if (obj.version) {
            this.version = obj.version;
        }

        if (obj.isMoss !== undefined) {
            this.isMoss = obj.isMoss;
        }

        if (!this.currentCollisionArea) {
            this.currentCollisionArea = this.getCollisionArea();
        }

        if (!this.currentWalkableArea) {
            this.currentWalkableArea = this.getWalkableArea();
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

        this.mountSprites = obj.mountSprites;
        this.speed = obj.speed;
    }

    clear() {
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
        if (this.displayInfo) {
            (<any>this.displayInfo).destroy();
        }
        if (display) {
            const anis = [];
            const objAnis = animations;
            for (const ani of objAnis) {
                anis.push(new AnimationModel(ani));
            }
            defAnimation = defAnimation || this.currentAnimationName || "";
            // (<any>this.displayInfo) = {
            //     animations: {
            //         defaultAnimationName: defAnimation,
            //         display,
            //         animationData: anis,
            //     },
            //     id: this.id
            // };
            (<any>this.displayInfo)["animations"] = {
                defaultAnimationName: defAnimation,
                display,
                animationData: anis,
            };
            (<any>this.displayInfo)["id"] = this.id;
            if (defAnimation) {
                this.currentAnimationName = defAnimation;
            }
        }
    }

    public setMountSprites(ids: number[]) {
        this.mountSprites = ids;
    }

    setDirection(val: number) {
    }

    setDisplayInfo(displayInfo: IFramesModel | IDragonbonesModel) {
    }

    get hasInteractive(): boolean {
        if (!this.displayInfo || !this.currentAnimation) {
            return false;
        }
        const { name: animationName } = this.currentAnimation;
        const area = (<any>this.displayInfo).getInteractiveArea(animationName);
        if (area && area.length > 0) {
            return true;
        }
        return false;
    }

    public getInteractive() {
        if (!this.displayInfo || !this.currentAnimation) {
            return;
        }
        const { name: animationName, flip } = this.currentAnimation;
        return (<any>this.displayInfo).getInteractiveArea(animationName, flip);
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
        if (!this.displayInfo || !this.currentAnimation) {
            return;
        }
        const { name: animationName, flip } = this.currentAnimation;
        return (<any>this.displayInfo).getCollisionArea(animationName, flip);
    }

    public getWalkableArea() {
        if (!this.displayInfo || !this.currentAnimation) {
            return;
        }
        const { name: animationName, flip } = this.currentAnimation;
        return (<any>this.displayInfo).getWalkableArea(animationName, flip);
    }

    public getOriginPoint() {
        if (!this.displayInfo || !this.currentAnimation) {
            return;
        }
        const { name: animationName, flip } = this.currentAnimation;
        return (<any>this.displayInfo).getOriginPoint(animationName, flip);
    }
}
