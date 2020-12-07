import { Helpers } from "game-capsule";
import { op_client, op_gameconfig, op_gameconfig_01, op_def } from "pixelpai_proto";
import { AnimationQueue, AvatarSuit, AvatarSuitType, RunningAnimation } from "structure";
import { IAvatar, IDragonbonesModel } from "structure";
import { IFramesModel } from "structure";
import { IPos, LogicPos, LogicPoint, Logger, Direction, EventDispatcher } from "utils";
import { AnimationModel } from "../animation/animation.model";
import { DragonbonesModel } from "../dragones/dragonbones.model";
import { FramesModel } from "../frames/frames.model";
import NodeType = op_def.NodeType;

enum TitleMask {
    TQ_NickName = 0x00010000,
    TQ_Badge = 0x00020000,
    // TQ_   = 0x0004;
}
export interface ISprite {
    id: number;
    avatar: IAvatar;
    titleMask: number;
    nickname: string;
    alpha: number;
    displayBadgeCards: op_def.IBadgeCard[];

    platformId: string;
    sceneId: number;
    nodeType: op_def.NodeType;
    currentAnimation: RunningAnimation;
    currentCollisionArea: number[][];
    currentWalkableArea: number[][];
    currentCollisionPoint: LogicPoint;
    hasInteractive: boolean;
    interactive: op_def.IPBPoint2f[];
    attrs: op_def.IStrPair[];
    suits: AvatarSuit[];
    animationQueue: AnimationQueue[];
    currentAnimationName: string;
    displayInfo: IFramesModel | IDragonbonesModel;
    direction: number;
    pos: IPos;
    bindID: number;
    sn: string;
    isMoss?: boolean;
    mountSprites?: number[];
    speed: number;

    newID();
    emit(type, data);
    on(event: string, fn: Function, context: any);
    off(event: string, fn: Function, context: any);
    clear();
    updateAvatar(avatar: IAvatar);
    updateDisplay(display: op_gameconfig.IDisplay, animations: op_gameconfig_01.IAnimationData[], defAnimation?: string);
    setPosition(x: number, y: number);
    setAnimationName(name: string, playTimes?: number): RunningAnimation;
    setAnimationQueue(queue: AnimationQueue[]);
    setDirection(val);
    setDisplayInfo(val);
    updateAttr(attrs: op_def.IStrPair[]);
    updateAvatarSuits(suits: AvatarSuit[]): boolean;
    getCollisionArea(): number[][];
    getWalkableArea(): number[][];
    getOriginPoint(): IPos;
    getInteractive(): op_def.IPBPoint2f[];
    turn(): ISprite;
    toSprite(): op_client.ISprite;
}

export class Sprite extends EventDispatcher implements ISprite {
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
    public displayInfo: FramesModel | DragonbonesModel;
    public nodeType: NodeType;
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

    constructor(obj: op_client.ISprite, nodeType?: NodeType) {
        super();
        this.id = obj.id;
        if (obj.point3f) {
            const point = obj.point3f;
            this.pos = new LogicPos(point.x, point.y, point.z);
        }
        this.updateAttr(obj.attrs);
        if (this.suits)
            this.updateAvatarSuits(this.suits);
        this.avatar = this.avatar || obj.avatar;
        if (this.avatar) {
            this.updateAvatar(this.avatar);
        }
        if (obj.display) {
            this.updateDisplay(obj.display, obj.animations, obj.currentAnimationName);
        }
        if (obj.sn) {
            this.sn = obj.sn;
        }
        this.tryRegisterAnimation(obj.animationRegistrationMap);
        this.currentAnimationName = obj.currentAnimationName;
        // this.direction = obj.direction || 3;
        this.titleMask = obj.titleMask;
        this.setDirection(obj.direction || 3);
        this.nickname = obj.nickname;
        this.bindID = obj.bindId;
        this.alpha = obj.opacity === undefined ? 1 : obj.opacity / 100;
        this.displayBadgeCards = obj.displayBadgeCards;
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

    public toSprite(): op_client.ISprite {
        const sprite = op_client.Sprite.create();
        sprite.id = this.id;
        sprite.nickname = this.nickname;
        if (this.displayInfo instanceof FramesModel) {
            sprite.display = this.displayInfo.display;
            sprite.currentAnimationName = this.currentAnimationName;
            const point3f = op_def.PBPoint3f.create();
            point3f.x = this.pos.x;
            point3f.y = this.pos.y;
            point3f.z = this.pos.z;
            sprite.point3f = point3f;
            sprite.animations = (<FramesModel>this.displayInfo).createProtocolObject();
        }
        sprite.direction = this.direction;
        sprite.bindId = this.bindID;
        sprite.sn = this.sn;
        sprite.version = this.version;
        return sprite;
    }

    public showNickName(): boolean {
        return (this.titleMask & TitleMask.TQ_NickName) > 0;
    }

    public showBadge(): boolean {
        return (this.titleMask & TitleMask.TQ_Badge) > 0;
    }

    public newID() {
        this.id = Helpers.genId();
    }

    public setPosition(x: number, y: number) {
        if (!this.pos) {
            this.pos = new LogicPos();
        }
        this.pos.x = x;
        this.pos.y = y;
    }

    public turn(): any {
        if (!this.displayInfo) {
            return;
        }
        const dirable = this.dirable(this.currentAnimationName);
        const index = dirable.indexOf(this.direction);
        if (index > -1) {
            this.direction = dirable[(index + 1) % dirable.length];
        } else {
            Logger.getInstance().error(`${Sprite.name}: error dir ${this.direction}`);
        }

        return this;
    }
    public updateAvatarSuits(suits: AvatarSuit[]) {
        if (suits) {
            if (suits.length > 0) {
                this.suits = suits;
                this.avatar = AvatarSuitType.createHasBaseAvatar(suits);
            } else {
                this.avatar = AvatarSuitType.createBaseAvatar();
            }
            return true;
        }
        return false;
    }

    public updateAvatar(avatar: op_gameconfig.IAvatar | IAvatar) {
        if (this.displayInfo) {
            this.displayInfo.destroy();
        }
        this.avatar = { id: avatar.id };
        this.avatar = Object.assign(this.avatar, avatar);
        this.displayInfo = new DragonbonesModel(this);
    }
    public getAvatarSuits(attrs: op_def.IStrPair[]) {
        let suits: AvatarSuit[];
        if (attrs) {
            for (const attr of attrs) {
                if (attr.key === "PKT_AVATAR_SUITS") {
                    suits = JSON.parse(attr.value);
                    break;
                }
            }
        }
        return suits;
    }

    public updateAttr(attrs: op_def.IStrPair[]) {
        this.attrs = attrs;
        this.suits = this.getAvatarSuits(attrs);
    }

    public updateDisplay(display: op_gameconfig.IDisplay, animations: op_gameconfig_01.IAnimationData[], defAnimation?: string) {
        if (!display || !animations) {
            return;
        }
        if (this.displayInfo) {
            this.displayInfo.destroy();
        }
        if (display) {
            const anis = [];
            const objAnis = animations;
            for (const ani of objAnis) {
                anis.push(new AnimationModel(ani));
            }
            defAnimation = defAnimation || this.currentAnimationName || "";
            this.displayInfo = new FramesModel({
                animations: {
                    defaultAnimationName: defAnimation,
                    display,
                    animationData: anis,
                },
                id: this.id
            });
            if (defAnimation) {
                this.currentAnimationName = defAnimation;
            }
        }
    }

    public setAnimationQueue(queue: AnimationQueue[]) {
        this.animationQueue = queue;
    }

    public setMountSprites(ids: number[]) {
        this.mountSprites = ids;
    }

    public setAnimationName(name: string, times?: number) {
        if (!this.currentAnimation || this.currentAnimationName !== name) {
            if (this.displayInfo) {
                this.displayInfo.animationName = name;
            }
            this.currentAnimationName = name;
            const ani = this.setAnimationData(name, this.direction, times);
            return ani;
        }
        return null;
    }

    setDirection(val: number) {
        if (!val) return;
        this.direction = val;
        if (!this.displayInfo) {
            return;
        }
        Logger.getInstance().log("setDirection:=====", val);
        this.setAnimationData(this.currentAnimationName, this.direction);
    }

    setDisplayInfo(displayInfo: FramesModel | DragonbonesModel) {
        this.displayInfo = displayInfo;
        this.displayInfo.id = this.id;
        if (this.currentAnimationName) {
            this.displayInfo.animationName = this.currentAnimationName;
            this.setAnimationData(this.currentAnimationName, this.direction);
        } else {
            if (displayInfo.animationName) this.currentAnimationName = displayInfo.animationName;
        }
    }

    get hasInteractive(): boolean {
        if (!this.displayInfo || !this.currentAnimation) {
            return false;
        }
        const { name: animationName } = this.currentAnimation;
        const area = this.displayInfo.getInteractiveArea(animationName);
        if (area && area.length > 0) {
            return true;
        }
        return false;
    }

    public getInteractive() {
        if (!this.displayInfo || !this.currentAnimation) {
            return;
        }
        const { name: animationName } = this.currentAnimation;
        return this.displayInfo.getInteractiveArea(animationName);
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

    public getInteracviveArea(): op_def.IPBPoint2i[] {
        if (!this.displayInfo || !this.currentAnimation) {
            return;
        }
        const { name: animationName } = this.currentAnimation;
        return this.displayInfo.getInteractiveArea(animationName);
    }

    public getCollisionArea() {
        if (!this.displayInfo || !this.currentAnimation) {
            return;
        }
        const { name: animationName, flip } = this.currentAnimation;
        return this.displayInfo.getCollisionArea(animationName, flip);
    }

    public getWalkableArea() {
        if (!this.displayInfo || !this.currentAnimation) {
            return;
        }
        const { name: animationName, flip } = this.currentAnimation;
        return this.displayInfo.getWalkableArea(animationName, flip);
    }

    public getOriginPoint() {
        if (!this.displayInfo || !this.currentAnimation) {
            return;
        }
        const { name: animationName, flip } = this.currentAnimation;
        return this.displayInfo.getOriginPoint(animationName, flip);
    }

    private setAnimationData(animationName: string, direction: number, times?: number) {
        if (!this.displayInfo || !animationName) {
            return;
        }
        let baseAniName = animationName.split(`_`)[0];
        if (this.registerAnimation) {
            if (this.registerAnimation.has(baseAniName)) {
                baseAniName = this.registerAnimation.get(baseAniName);
            }
        }
        this.currentAnimation = this.displayInfo.findAnimation(baseAniName, direction);
        this.currentAnimation.times = times;
        if (this.animationQueue && this.animationQueue.length > 0) this.currentAnimation.playingQueue = this.animationQueue[0];
        if (this.currentCollisionArea) {
            this.setArea();
        }
        this.emit("Animation_Change", { id: this.id, direction: this.direction, animation: this.currentAnimation, playTimes: times });
        return this.currentAnimation;
    }

    private checkDirectionAnimation(baseAniName: string, dir: Direction) {
        const aniName = `${baseAniName}_${dir}`;
        if (this.displayInfo.existAnimation(aniName)) {
            return aniName;
        }
        return null;
    }

    private setArea() {
        this.currentCollisionArea = this.getCollisionArea();
        this.currentWalkableArea = this.getWalkableArea();
        this.currentCollisionPoint = this.getOriginPoint();
    }

    private dirable(aniName: string): number[] {
        const baseAniName = aniName.split("_")[0];
        const dirs = [3, 5];
        if (this.checkDirectionAnimation(baseAniName, Direction.east_north)) {
            dirs.push(7, 1);
            // dirs = [1, 3, 5, 7];
        }
        return dirs;
    }

    private tryRegisterAnimation(anis: op_def.IStrPair[]) {
        if (!anis || anis.length < 1) {
            return;
        }
        this.registerAnimation = new Map();
        for (const ani of anis) {
            this.registerAnimation.set(ani.key, ani.value);
        }
    }
}
