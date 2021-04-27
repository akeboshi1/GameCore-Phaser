import { AnimationModel,IAnimationData, IDisplay, AnimationQueue, Animator, AvatarSuit, AvatarSuitType, IAvatar, ISprite, RunningAnimation, Direction, EventDispatcher, IPos, Logger, LogicPoint, LogicPos, IFramesModel, IDragonbonesModel } from "structure";
import { op_def, op_gameconfig, op_client, op_gameconfig_01 } from "pixelpai_proto";

import { Helpers } from "game-capsule";
import * as sha1 from "simple-sha1";

enum TitleMask {
    TQ_NickName = 0x00010000,
    TQ_Badge = 0x00020000,
    // TQ_   = 0x0004;
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
    public layer: number;

    constructor(obj: op_client.ISprite, nodeType?: op_def.NodeType) {
        super();
        this.id = obj.id;
        if (obj.point3f) {
            const point = obj.point3f;
            this.pos = new LogicPos(point.x, point.y, point.z);
        } else {
            this.pos = new LogicPos(0, 0);
        }
        this.updateAttr(obj.attrs);
        if (this.updateSuits)
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
        if (obj.layer) {
            this.layer = obj.layer;
        }

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
        if (this.displayInfo.discriminator === "FramesModel") {
            sprite.display = (<any>this.displayInfo).display;
            sprite.currentAnimationName = this.currentAnimationName;
            sprite.animations = (<any>this.displayInfo).createProtocolObject();
        } else if (this.displayInfo.discriminator === "DragonbonesModel") {
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
            (<any>this.displayInfo).destroy();
        }
        this.avatar = { id: avatar.id };
        this.avatar = Object.assign(this.avatar, avatar);
        this.displayInfo = new DragonbonesModel(this);
    }

    public setTempAvatar(avatar: IAvatar) {
        if (this.displayInfo) {
            (<any>this.displayInfo).destroy();
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
        this.attrs = attrs;
        const suits = this.getAvatarSuits(attrs);
        if (suits && suits.length > 0) {
            this.suits = suits;
            this.updateSuits = true;
            if (!this.animator) this.animator = new Animator(this.suits);
            else this.animator.setSuits(this.suits);
        }
    }

    public updateDisplay(display: op_gameconfig.IDisplay, animations: op_gameconfig_01.IAnimationData[], defAnimation?: string) {
        if (!display || !animations) {
            return;
        }
        if (!display.dataPath || !display.texturePath) {
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

        if (this.currentAnimationName) this.direction = (<any>this.displayInfo).checkDirectionByExistAnimations(
            this.getBaseAniName(this.currentAnimationName), this.direction);

        // Logger.getInstance().debug("#dir sprite setDirection:=====", this.id, val);
        this.setAnimationData(this.currentAnimationName, this.direction);
    }

    setDisplayInfo(displayInfo: IFramesModel | IDragonbonesModel) {
        this.displayInfo = displayInfo;
        this.displayInfo.id = this.id;
        if (this.currentAnimationName) {
            // DragonbonesModel 设置的动画在avatar上
            if (displayInfo.discriminator === "FrameModel") {
                this.displayInfo.animationName = this.currentAnimationName;
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
        if (!(<any>this.displayInfo).findAnimation) {
            Logger.getInstance().error("displayInfo no findanimation ====>", this.displayInfo);
        } else {
            this.currentAnimation = (<any>this.displayInfo).findAnimation(baseAniName, direction);
            this.currentAnimation.times = times;
            if (this.animationQueue && this.animationQueue.length > 0) this.currentAnimation.playingQueue = this.animationQueue[0];
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
        if ((<any>this.displayInfo).existAnimation(aniName)) {
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
        let baseAniName = animationName.split(`_`)[0];
        if (this.registerAnimation) {
            if (this.registerAnimation.has(baseAniName)) {
                baseAniName = this.registerAnimation.get(baseAniName);
            }
        }
        return baseAniName;
    }
}
export class DragonbonesModel implements IDragonbonesModel {
    discriminator: string = "DragonbonesModel";
    id: number;
    public eventName: number[];
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
        return undefined;
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
            display
        };
    }

    avatarDir?: number;
    readonly discriminator: string = "FramesModel";
    public id: number;
    public type: string;
    public eventName: number[];
    public display: IDisplay | null;
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
