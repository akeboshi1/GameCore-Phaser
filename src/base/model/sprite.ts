import { AnimationModel, AnimationQueue, Animator, AvatarSuit, AvatarSuitType, IAvatar, ISprite, RunningAnimation } from "structure";
import { Direction, EventDispatcher, IPos, Logger, LogicPoint, LogicPos } from "utils";
import { op_def, op_gameconfig, op_client, op_gameconfig_01 } from "pixelpai_proto";
import { Helpers } from "game-capsule";
import { DragonbonesModel } from "./dragonbones.model";
import { FramesModel } from "./frames.model";
enum TitleMask {
    TQ_NickName = 0x00010000,
    TQ_Badge = 0x00020000,
    // TQ_   = 0x0004;
}
export enum Flag {
    Pos = 0,
    AnimationName = 1,
    Direction = 2,
    Mount = 3,
    NickName = 4,
    Alpha = 5,
    Speed = 6,
    Avatar = 7,
    Display = 8
}

// pos animationName dirction mount nickname alpha speed avatar display
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
    public layer: number;
    public sound: string;
    public curState: number = 0;
    constructor(obj: op_client.ISprite, nodeType?: op_def.NodeType) {
        super();
        // 必要数据
        this.id = obj.id;
        this.bindID = obj.bindId;
        this.nodeType = nodeType;
        this.nickname = obj.nickname;
        // ==========> 优先处理attr信息，后续avatar才能赋值
        // init attrs
        this.updateAttr(obj.attrs);
        if (this.updateSuits) this.updateAvatarSuits(this.suits);

        // init displayInfo
        this.avatar = this.avatar || obj.avatar;
        if (this.avatar) {
            this.updateAvatar(this.avatar);
        }
        if (obj.display) {
            this.updateDisplay(obj.display, obj.animations, obj.currentAnimationName);
        }
        // ==========> update pos
        let point;
        if (obj.point3f) {
            point = obj.point3f;
            // this.pos = new LogicPos(point.x, point.y, point.z);
        } else {
            // this.pos = new LogicPos(0, 0);
            point = { x: 0, y: 0 };
        }
        this.setPosition(point.x, point.y);

        if (obj.sn) {
            this.sn = obj.sn;
        }
        this.titleMask = obj.titleMask;

        this.alpha = obj.opacity === undefined ? 1 : obj.opacity / 100;
        this.displayBadgeCards = obj.displayBadgeCards;
        if (obj.layer) {
            this.layer = obj.layer;
        }
        if (obj.version) {
            this.version = obj.version;
        }
        if (obj.isMoss !== undefined) {
            this.isMoss = obj.isMoss;
        }

        this.tryRegisterAnimation(obj.animationRegistrationMap);
        this.currentAnimationName = obj.currentAnimationName;
        // setDirection 必须在currentAnimationName赋值之后
        this.setDirection(obj.direction || 3);

        // ============ 碰撞区域 =============
        if (!this.currentCollisionArea) {
            this.currentCollisionArea = this.getCollisionArea();
        }

        // ============ 可行走区域 =============
        if (!this.currentWalkableArea) {
            this.currentWalkableArea = this.getWalkableArea();
        }

        // ============ 注册点 ==============
        if (!this.currentCollisionPoint) {
            this.currentCollisionPoint = this.getOriginPoint();
        }

        // =========== 点击区域 ============
        if (!this.interactive) {
            this.interactive = this.getInteractive();
        }

        this.mountSprites = obj.mountSprites;
        this.speed = obj.speed;
    }

    // =================================== sprite 状态逻辑=========================================

    public updateState(state: Flag) {
        const _state = Number(state);
        this.curState = this.curState | (1 << _state);
        // this.dealSprite();
    }

    public showNickName(): boolean {
        const boo = (this.titleMask & TitleMask.TQ_NickName) > 0;
        if (boo) this.updateState(Flag.NickName);
        return boo;
    }

    public setPosition(x: number, y: number) {
        if (!this.pos) {
            this.pos = new LogicPos();
        }
        this.pos.x = x;
        this.pos.y = y;
        this.updateState(Flag.Pos);
    }

    /**
     * 更新显示对象数据，需要做load处理
     * @param avatar
     */
    public updateAvatar(avatar: op_gameconfig.IAvatar | IAvatar) {
        if (this.displayInfo) {
            this.displayInfo.destroy();
        }
        this.avatar = { id: avatar.id };
        this.avatar = Object.assign(this.avatar, avatar);
        this.displayInfo = new DragonbonesModel(this);
        this.updateState(Flag.Avatar);
    }

    public setTempAvatar(avatar: IAvatar) {
        if (this.displayInfo) {
            this.displayInfo.destroy();
        }
        let tempAvatar = { id: avatar.id };
        tempAvatar = Object.assign(tempAvatar, this.avatar);
        tempAvatar = Object.assign(tempAvatar, avatar);
        this.displayInfo = new DragonbonesModel({ id: this.id, avatar: tempAvatar });
        this.updateState(Flag.Avatar);
    }

    public updateDisplay(display: op_gameconfig.IDisplay, animations: op_gameconfig_01.IAnimationData[], defAnimation?: string) {
        if (!display || !animations) {
            return;
        }
        if (!display.dataPath || !display.texturePath) {
            return;
        }
        if (this.displayInfo) {
            this.displayInfo = null;
        }
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
            id: this.id,
            sound: this.sound
        });
        this.updateState(Flag.Display);
        if (defAnimation) {
            this.setAnimationData(defAnimation, this.direction);
        }
    }

    setDirection(val: number) {
        if (!val) return;

        this.direction = val;
        this.updateState(Flag.Direction);
        if (!this.displayInfo) {
            return;
        }

        if (this.currentAnimationName) this.direction = this.displayInfo.checkDirectionByExistAnimations(
            this.getBaseAniName(this.currentAnimationName), this.direction);

        // Logger.getInstance().debug("#dir sprite setDirection:=====", this.id, val);
        this.setAnimationData(this.currentAnimationName, this.direction);
    }

    // =================================== 处理sprite数据 ================================
    public dealSprite() {
        const state = Number(this.curState);
        for (const key in Flag) {
            if (isNaN(Number(key))) {
                const val = Number(Flag[key]);
                if (((state >> val) & 1) === 1) {
                    switch (key) {
                        case Flag.Pos.toString():
                            break;
                        case Flag.AnimationName.toString():
                            break;
                        case Flag.Direction.toString():
                            break;
                        case Flag.Mount.toString():
                            break;
                        case Flag.NickName.toString():
                            break;
                        case Flag.Alpha.toString():
                            break;
                        case Flag.Speed.toString():
                            break;
                        case Flag.Avatar.toString():
                            break;
                        case Flag.Display.toString():
                            break;
                    }
                }
            }
        }
        this.curState = 0;
    }

    // ===================================分割线=========================================

    public toSprite(): op_client.ISprite {
        const sprite = op_client.Sprite.create();
        sprite.id = this.id;
        sprite.nickname = this.nickname;
        if (this.displayInfo instanceof FramesModel) {
            sprite.display = this.displayInfo.display;
            sprite.currentAnimationName = this.currentAnimationName;
            sprite.animations = (<any>this.displayInfo).createProtocolObject();
        } else if (this.displayInfo instanceof DragonbonesModel) {
            if (this.avatar) {
                const avatar = op_gameconfig.Avatar.create();
                for (const key in this.avatar) {
                    if (Object.prototype.hasOwnProperty.call(this.avatar, key)) {
                        avatar[key] = this.avatar[key];
                    }
                }
                sprite.avatar = avatar;
            }
        }
        if (this.pos) {
            const point3f = op_def.PBPoint3f.create();
            point3f.x = this.pos.x;
            point3f.y = this.pos.y;
            point3f.z = this.pos.z;
            sprite.point3f = point3f;
        }
        sprite.direction = this.direction;
        sprite.bindId = this.bindID;
        sprite.sn = this.sn;
        sprite.version = this.version;
        return sprite;
    }

    public showBadge(): boolean {
        return (this.titleMask & TitleMask.TQ_Badge) > 0;
    }

    public newID() {
        this.id = Helpers.genId();
    }

    public turn(): any {
        if (!this.displayInfo) {
            return;
        }
        const dirable = this.dirable(this.currentAnimationName);
        const index = dirable.indexOf(this.direction);
        if (index > -1) {
            this.setDirection(dirable[(index + 1) % dirable.length]);
            //  Logger.getInstance().debug("turn sprite ===>", dirable[(index + 1) % dirable.length]);
        } else {
            Logger.getInstance().error(`${Sprite.name}: error dir ${this.direction}`);
        }
        return this;
    }
    /**
     * 处理 pkt 龙骨套装数据，转换成可接受的op_gameconfig.IAvatar数据
     * @param suits
     * @returns
     */
    public updateAvatarSuits(suits: AvatarSuit[]) {
        this.updateSuits = false;
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
        if (!attrs) return;
        let suits: AvatarSuit[];
        for (const attr of attrs) {
            if (attr.key === "PKT_AVATAR_SUITS") {
                suits = JSON.parse(attr.value);
                if (suits && suits.length > 0) {
                    this.suits = suits;
                    this.updateSuits = true;
                    if (!this.animator) this.animator = new Animator(this.suits);
                    else this.animator.setSuits(this.suits);
                }
            } else if (attr.key === "touchSound") {
                this.sound = attr.value;
            }
        }
    }

    public setAnimationQueue(queue: AnimationQueue[]) {
        this.animationQueue = queue;
    }

    public setAnimationName(name: string, times?: number) {
        // 注册动画和当前动画可能不一致
        const baseName = this.getBaseAniName(name);
        const suffix = name.split("_")[1];
        const aniName = suffix ? `${baseName}_${suffix}` : baseName;
        if (!this.currentAnimation || this.currentAnimation.name !== aniName) {
            if (this.displayInfo) {
                name = this.animator ? this.animator.getAnimationName(name) : name;
                // this.displayInfo.animationName = name;
            }
            this.currentAnimationName = name;
            const ani = this.setAnimationData(name, this.direction, times);
            return ani;
        }
        return null;
    }

    setDisplayInfo(displayInfo: FramesModel | DragonbonesModel) {
        this.displayInfo = displayInfo;
        this.displayInfo.id = this.id;
        if (this.currentAnimationName) {
            // DragonbonesModel 设置的动画在avatar上
            if (displayInfo instanceof FramesModel) {
                // this.displayInfo.animationName = this.currentAnimationName;
                this.setAnimationData(this.currentAnimationName, this.direction);
            } else {
                if (displayInfo.animationName) this.setAnimationName(displayInfo.animationName);
            }
        } else {
            if (displayInfo.animationName) {
                this.setAnimationName(displayInfo.animationName);
            }
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
        const { name: animationName, flip } = this.currentAnimation;
        return this.displayInfo.getInteractiveArea(animationName, flip);
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

    registerAnimationMap(key: string, value: string) {
        if (!this.registerAnimation) this.registerAnimation = new Map();
        this.registerAnimation.set(key, value);
    }

    unregisterAnimationMap(key: string) {
        if (!this.registerAnimation) return;
        this.registerAnimation.delete(key);
    }

    private setAnimationData(animationName: string, direction: number, times?: number) {
        if (!this.displayInfo || !animationName) {
            return;
        }
        const baseAniName = this.getBaseAniName(animationName);
        if (!baseAniName) return;
        const currentAnimation = this.displayInfo.findAnimation(baseAniName, direction);
        if (!currentAnimation) {
            Logger.getInstance().error(`${this.nickname} can't find animation ${animationName}`);
            // 否则return void导致引用处报错
            return null;
        }
        this.currentAnimation = currentAnimation;
        this.currentAnimation.times = times;
        if (this.animationQueue && this.animationQueue.length > 0) this.currentAnimation.playingQueue = this.animationQueue[0];
        if (this.currentCollisionArea) {
            this.setArea();
        }
        this.updateState(Flag.AnimationName);
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

    private getBaseAniName(animationName: string): string | undefined {
        if (!animationName) return undefined;
        let baseAniName = animationName.split(`_`)[0];
        if (this.registerAnimation) {
            if (this.registerAnimation.has(baseAniName)) {
                baseAniName = this.registerAnimation.get(baseAniName);
            }
        }
        return baseAniName;
    }
}
