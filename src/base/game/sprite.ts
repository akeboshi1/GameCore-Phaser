import { Direction, EventDispatcher, IPos, Logger, LogicPoint, LogicPos, AnimationModel, AnimationQueue, Animator, AvatarSuit, AvatarSuitType, IAvatar, ISprite, RunningAnimation, IFramesModel, IDragonbonesModel, IAnimationData, IDisplay } from "structure";
import { op_def, op_gameconfig, op_client, op_gameconfig_01 } from "pixelpai_proto";
import { Helpers } from "game-capsule";
import * as sha1 from "simple-sha1";
import { IDisplayRef } from "./elementstorage";
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
    public i18nName: string;
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

    public suits: AvatarSuit[];
    public animationQueue: AnimationQueue;

    public mountSprites: number[];

    public speed: number;
    public interactive: op_def.IPBPoint2f[];
    public animator?: Animator;
    public updateSuits: boolean = false;
    public layer: number;
    public sound: string;
    public curState: number = 0;
    protected mAttrs: Map<string, string | boolean | number>;
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
        if (obj.point3f) {
            const point = obj.point3f;
            this.pos = new LogicPos(point.x, point.y, point.z);
        } else {
            this.pos = new LogicPos(0, 0);
        }

        if (obj.sn) {
            this.sn = obj.sn;
            if (this.displayInfo) this.displayInfo.type = this.sn;
        }
        if (obj.titleMask) this.titleMask = obj.titleMask;

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
        sprite.sn = this.sn || this.displayInfo.type;
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

    public updateAvatar(avatar: op_gameconfig.IAvatar | IAvatar) {
        if (this.displayInfo) {
            this.displayInfo.destroy();
        }
        this.avatar = { id: avatar.id };
        this.avatar = Object.assign(this.avatar, avatar);
        this.displayInfo = new DragonbonesModel(this);
    }

    public setTempAvatar(avatar: IAvatar) {
        if (this.displayInfo) {
            this.displayInfo.destroy();
        }
        let tempAvatar = { id: avatar.id };
        tempAvatar = Object.assign(tempAvatar, this.avatar);
        tempAvatar = Object.assign(tempAvatar, avatar);
        this.displayInfo = new DragonbonesModel({ id: this.id, avatar: tempAvatar });
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
        if (!attrs) return;
        let suits: AvatarSuit[];
        for (const attr of attrs) {
            const { key, value } = attr;
            if (key === "PKT_AVATAR_SUITS") {
                suits = JSON.parse(value);
                if (suits && suits.length > 0) {
                    this.suits = suits;
                    this.updateSuits = true;
                    if (!this.animator) this.animator = new Animator(this.suits);
                    else this.animator.setSuits(this.suits);
                }
            } else if (key === "touchSound") {
                this.sound = value;
            } else if (key === "TitleMask") {
                this.titleMask = parseInt(value, 10);
            } else if (key === "i18nName") {
                this.i18nName = value;
            }
            if (!this.mAttrs) this.mAttrs = new Map();
            this.mAttrs.set(key, value);
        }
    }

    public getAttr(key) {
        if (!this.mAttrs) return;
        return this.mAttrs.get(key);
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
        // this.sn = this.displayInfo.type;
        if (defAnimation) {
            this.setAnimationData(defAnimation, this.direction);
        }
    }

    public setAnimationQueue(queue: AnimationQueue) {
        this.animationQueue = queue;
    }

    public setMountSprites(ids: number[]) {
        this.mountSprites = ids;
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

    setDirection(val: number) {
        if (!val) return;

        this.direction = val;
        if (!this.displayInfo) {
            return;
        }

        if (this.currentAnimationName) this.direction = this.displayInfo.checkDirectionByExistAnimations(
            this.getBaseAniName(this.currentAnimationName), this.direction);

        // Logger.getInstance().debug("#dir sprite setDirection:=====", this.id, val);
        this.setAnimationData(this.currentAnimationName, this.direction);
    }

    setDisplayInfo(displayInfo: FramesModel | DragonbonesModel) {
        this.displayInfo = displayInfo;
        // 修复新号部分家具没有sn数据
        if (displayInfo.hasOwnProperty("type")) {
            this.sn = this.displayInfo["type"];
        }
        this.displayInfo.id = this.id;
        if (this.currentAnimationName) {
            // DragonbonesModel 设置的动画在avatar上
            if (displayInfo.discriminator === "FramesModel") {
                // this.displayInfo.animationName = this.currentAnimationName;
                this.setAnimationData(this.currentAnimationName, this.direction);
            } else {
                if (displayInfo.animationName) this.setAnimationName(displayInfo.animationName);
            }
        } else {
            if (displayInfo.animationName) {
                this.setAnimationName(displayInfo.animationName);
            }
            // if (displayInfo.animationName) this.currentAnimationName = displayInfo.animationName;
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

    get attrs() {
        return this.mAttrs;
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

    importDisplayRef(displayRef: IDisplayRef) {
        const { pos, direction, displayModel } = displayRef;
        this.pos = new LogicPos(pos.x, pos.y, pos.z);
        this.direction = direction;
        this.displayInfo = displayModel;
        if (!this.displayInfo) {
            Logger.getInstance().error(`${displayRef.name}-${displayRef.id} displayInfo does not exise!`);
            return this;
        }
        this.setAnimationName(this.displayInfo.animationName);
        return this;
    }

    private setAnimationData(animationName: string, direction: number, times?: number) {
        if (!this.displayInfo || !animationName) {
            return;
        }
        const baseAniName = this.getBaseAniName(animationName);
        if (!this.displayInfo.findAnimation) {
            Logger.getInstance().error("displayInfo no findanimation ====>", this.displayInfo);
        } else {
            this.currentAnimation = this.displayInfo.findAnimation(baseAniName, direction);
            this.currentAnimation.times = times;
            if (this.animationQueue) {
                const anis = this.animationQueue.changeAnimation;
                if (anis && anis.length > 0) this.currentAnimation.playingQueue = anis[0];
            }
            if (this.currentCollisionArea) {
                this.setArea();
            }
            // Logger.getInstance().debug("#dir ", direction, this.direction);
            this.emit("Animation_Change", { id: this.id, direction: this.direction, animation: this.currentAnimation, playTimes: times });
        }
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

    private getBaseAniName(animationName: string): string {
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
export class FramesModel implements IFramesModel {

    static createFromDisplay(display, animation, id?: number) {
        const anis = [];
        const aniName = animation[0].node.name;
        for (const ani of animation) {
            anis.push(new AnimationModel(ani));
        }
        const animations = new Map();
        for (const aniData of anis) {
            animations.set(aniData.name, aniData);
        }
        return {
            animations,
            id: id || 0,
            gene: sha1.sync(display.dataPath + display.texturePath),
            discriminator: "FramesModel",
            animationName: aniName,
            display,
            sound: ""
        };
    }

    avatarDir?: number;
    readonly discriminator: string = "FramesModel";
    public id: number;
    public type: string;
    public eventName: number[];
    public display: IDisplay | null;
    public sound: string;
    public animations: Map<string, AnimationModel>;
    public animationName: string;
    public package: op_gameconfig.IPackage;
    public shops: op_gameconfig.IShop[];
    public gene: string;

    constructor(data: any) {
        // TODO 定义IElement接口
        this.id = data.id || 0;
        this.type = data.sn || "";
        this.eventName = data.eventName;
        this.sound = data.sound;
        const anis = data.animations;
        if (anis) {
            this.animationName = anis.defaultAnimationName;
            this.setDisplay(anis.display);
            this.setAnimationData(anis.animationData);
        }
    }

    public setInfo(val: any) {
        for (const key in val) {
            if (val.hasOwnProperty(key)) {
                this[key] = val[key];
            }
        }
    }

    public getAnimationData(): Map<string, IAnimationData> {
        return this.animations;
    }

    public existAnimation(aniName: string): boolean {
        if (!this.animations) return false;
        return this.animations.has(aniName);
    }

    public getAnimations(name: string): IAnimationData {
        if (!this.animations) return;
        return this.animations.get(name);
    }

    public destroy() {
        if (this.animations) this.animations.clear();
    }

    public createProtocolObject(): op_gameconfig_01.IAnimationData[] {
        const anis: op_gameconfig_01.IAnimationData[] = [];
        this.animations.forEach((ani: AnimationModel) => {
            anis.push(ani.createProtocolObject());
        }, this);
        return anis;
    }

    public getCollisionArea(aniName: string, flip: boolean = false): number[][] {
        const ani = this.getAnimations(aniName);
        if (ani) {
            if (flip) {
                return Helpers.flipArray(ani.collisionArea);
            }
            return ani.collisionArea;
        }
    }

    public getWalkableArea(aniName: string, flip: boolean = false): number[][] {
        const ani = this.getAnimations(aniName);
        if (!ani) {
            return;
        }
        if (flip) {
            return Helpers.flipArray(ani.walkableArea);
        }
        return ani.walkableArea;
    }

    public getInteractiveArea(aniName: string, flip: boolean = false): op_def.IPBPoint2i[] | undefined {
        const ani = this.getAnimations(aniName);
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

    public getOriginPoint(aniName, flip: boolean = false): LogicPoint {
        const ani = this.getAnimations(aniName);
        if (ani) {
            const originPoint = ani.originPoint;
            if (flip) {
                return new LogicPoint(originPoint.y, originPoint.x);
            }
            return originPoint;
        }
    }

    public getDirable() { }

    public createSprite(properties: {
        nodeType: op_def.NodeType;
        x: number;
        y: number;
        z?: number;
        sn?: string;
        id?: number;
        dir?: number;
        isMoss?: boolean;
        layer?: number;
    }): Sprite {
        const { nodeType, x, y, z, id, dir, isMoss, layer } = properties;
        const spr = op_client.Sprite.create();

        if (id) {
            spr.id = id;
        } else {
            spr.id = Helpers.genId();
        }
        spr.layer = layer;
        spr.display = this.display;
        spr.currentAnimationName = this.animationName;
        const point3f = op_def.PBPoint3f.create();
        point3f.x = x;
        point3f.y = y;
        if (z) {
            point3f.z = z;
        }
        spr.point3f = point3f;
        spr.animations = this.createProtocolObject();
        if (dir) {
            spr.direction = dir;
        }

        if (isMoss !== undefined) {
            spr.isMoss = isMoss;
        }
        const sprite = new Sprite(spr);
        return new Sprite(spr, nodeType);
    }

    public findAnimation(baseName: string, dir: number): RunningAnimation {
        let animationName = this.checkDirectionAnimation(baseName, dir);
        let flip = false;
        if (animationName) {
            return { name: animationName, flip };
        }
        switch (dir) {
            case Direction.west_south:
            case Direction.east_north:
                animationName = this.getDefaultAnimation(baseName);
                break;
            case Direction.south_east:
                animationName = this.getDefaultAnimation(baseName);
                flip = true;
                break;
            case Direction.north_west:
                animationName = this.checkDirectionAnimation(baseName, Direction.east_north);
                if (animationName === null) {
                    animationName = this.getDefaultAnimation(baseName);
                }
                flip = true;
                break;
        }
        return { name: animationName, flip };
    }

    public checkDirectionAnimation(baseAniName: string, dir: Direction) {
        const aniName = `${baseAniName}_${dir}`;
        if (this.existAnimation(aniName)) {
            return aniName;
        }
        return null;
    }

    // 方向数据检查
    public checkDirectionByExistAnimations(baseAniName: string, dir: number): number {
        let result = dir;
        switch (dir) {
            case Direction.west_south:
                break;
            case Direction.south_east:
                break;
            case Direction.east_north:
                if (!this.existAnimation(`${baseAniName}_${Direction.east_north}`)) {
                    result = Direction.west_south;
                }
                break;
            case Direction.north_west:
                if (!this.existAnimation(`${baseAniName}_${Direction.north_west}`) &&
                    !this.existAnimation(`${baseAniName}_${Direction.east_north}`)) {
                    result = Direction.south_east;
                }
                break;
        }
        return result;
    }

    private setDisplay(display: op_gameconfig.IDisplay) {
        if (!display) {
            Logger.getInstance().error(`${this.type} display does not exist`);
            return;
        }
        this.display = {
            dataPath: display.dataPath,
            texturePath: display.texturePath,
        };
        this.gene = sha1.sync(display.dataPath + display.texturePath);
    }

    private setAnimationData(aniDatas: AnimationModel[]) {
        if (!aniDatas) {
            Logger.getInstance().error(`${this.id} animationData does not exist`);
            return;
        }
        this.animations = new Map();
        // let ani: IAnimationData;
        for (const aniData of aniDatas) {
            // const baseLoc = aniData.baseLoc;
            // ani = {
            //     name: aniData.name,
            //     frameName: aniData.frameName,
            //     frameRate: aniData.frameRate,
            //     loop: aniData.loop,
            //     baseLoc: new Phaser.Geom.Point(baseLoc.x, baseLoc.y),
            //     // walkableArea: aniData.walkableArea || [],
            //     collisionArea: aniData.collisionArea || [],
            //     originPoint: aniData.originPoint
            // };
            this.animations.set(aniData.name, aniData);
            // this.animations.set(aniData.name + "_7", aniData);
            // this.animations.set(aniData.name + "_1", aniData);
            // this.animations.set(aniData.name + "_5", aniData);
        }
    }

    private getDefaultAnimation(baseName: string) {
        let animationName = this.checkDirectionAnimation(baseName, Direction.west_south);
        if (animationName === null) {
            if (this.existAnimation(baseName)) {
                animationName = baseName;
            } else {
                Logger.getInstance().warn(`${FramesModel.name}: can't find animation ${baseName}`);
                animationName = "idle";
            }
        }
        return animationName;
    }
}
export class DragonbonesModel implements IDragonbonesModel {
    discriminator: string = "DragonbonesModel";
    id: number;
    public eventName: number[];
    public sound: string;
    public type: string;
    avatarDir?: number;
    avatar?: IAvatar;
    animationName?: string;
    constructor(data: any) {
        // this.id = id;
        // this.avatar = avatar;
        if (data) {
            this.id = data.id;
            this.avatar = data.avatar;
            this.eventName = data.eventName;
            this.sound = data.sound;
            const aniName = data.avatar.defaultAnimation;
            if (aniName) this.animationName = aniName;
        }
    }

    public setInfo(val: any) {
        for (const key in val) {
            if (val.hasOwnProperty(key)) {
                this[key] = val[key];
            }
        }
    }

    public destroy() {
    }

    public getCollisionArea(aniName: string): number[][] {
        return [[1]];
    }

    public getWalkableArea(): number[][] {
        return [[0]];
    }

    public getOriginPoint(aniName): LogicPoint {
        return new LogicPoint(0, 0);
    }

    public getInteractiveArea(): op_def.IPBPoint2i[] {
        return [{ x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }, { x: -1, y: 1 }, { x: -1, y: 0 }];
    }

    existAnimation(aniName: string) {
        return true;
    }

    public findAnimation(baseName: string, dir: Direction): RunningAnimation {
        let flip = false;
        switch (dir) {
            case Direction.south_east:
            case Direction.east_north:
                flip = true;
                break;
            case Direction.west_south:
            case Direction.north_west:
                break;
        }
        const aniName = this.checkDirectionAnimation(baseName, dir);
        return { name: aniName, flip };
    }

    public checkDirectionAnimation(baseName: string, dir: Direction) {
        let addName: string = "";
        if (dir === Direction.north_west || dir === Direction.east_north) addName = "_back";
        const aniName = `${baseName}${addName}`;
        if (this.existAnimation(aniName)) {
            return aniName;
        }
        return null;
    }

    // 方向数据检查
    public checkDirectionByExistAnimations(baseAniName: string, dir: number): number {
        return dir;
    }
}
