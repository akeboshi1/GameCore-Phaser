import { Direction, EventDispatcher, IPos, LogicPoint, AnimationModel, AnimationQueue, Animator, AvatarSuit, IAvatar, ISprite, RunningAnimation, IFramesModel, IDragonbonesModel, IAnimationData, IDisplay } from "structure";
import { op_def, op_gameconfig, op_client, op_gameconfig_01 } from "pixelpai_proto";
export declare enum Flag {
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
export declare class Sprite extends EventDispatcher implements ISprite {
    id: number;
    pos: IPos;
    titleMask: number;
    avatar: IAvatar;
    currentAnimationName: string;
    direction: number;
    bindID: number;
    sn: string;
    alpha: number;
    nickname: string;
    displayBadgeCards: op_def.IBadgeCard[];
    package: op_gameconfig.IPackage;
    sceneId: number;
    uuid: number;
    platformId: string;
    displayInfo: FramesModel | DragonbonesModel;
    nodeType: op_def.NodeType;
    currentAnimation: RunningAnimation;
    currentCollisionArea: number[][];
    currentWalkableArea: number[][];
    currentCollisionPoint: LogicPoint;
    version: string;
    isMoss: boolean;
    registerAnimation: Map<string, string>;
    originWalkPoint: LogicPoint;
    originCollisionPoint: LogicPoint;
    attrs: op_def.IStrPair[];
    suits: AvatarSuit[];
    animationQueue: AnimationQueue[];
    mountSprites: number[];
    speed: number;
    interactive: op_def.IPBPoint2f[];
    animator?: Animator;
    updateSuits: boolean;
    layer: number;
    sound: string;
    curState: number;
    constructor(obj: op_client.ISprite, nodeType?: op_def.NodeType);
    updateState(state: Flag): void;
    showNickName(): boolean;
    setPosition(x: number, y: number): void;
    /**
     * 更新显示对象数据，需要做load处理
     * @param avatar
     */
    updateAvatar(avatar: op_gameconfig.IAvatar | IAvatar): void;
    setTempAvatar(avatar: IAvatar): void;
    updateDisplay(display: op_gameconfig.IDisplay, animations: op_gameconfig_01.IAnimationData[], defAnimation?: string): void;
    setDirection(val: number): void;
    dealSprite(): void;
    toSprite(): op_client.ISprite;
    showBadge(): boolean;
    newID(): void;
    turn(): any;
    /**
     * 处理 pkt 龙骨套装数据，转换成可接受的op_gameconfig.IAvatar数据
     * @param suits
     * @returns
     */
    updateAvatarSuits(suits: AvatarSuit[]): boolean;
    getAvatarSuits(attrs: op_def.IStrPair[]): AvatarSuit[];
    updateAttr(attrs: op_def.IStrPair[]): void;
    setAnimationQueue(queue: AnimationQueue[]): void;
    setAnimationName(name: string, times?: number): RunningAnimation;
    setDisplayInfo(displayInfo: FramesModel | DragonbonesModel): void;
    get hasInteractive(): boolean;
    getInteractive(): op_def.IPBPoint2i[];
    setOriginCollisionPoint(value: number[] | null): void;
    setOriginWalkPoint(value: number[] | null): void;
    getCollisionArea(): number[][];
    getWalkableArea(): number[][];
    getOriginPoint(): LogicPoint;
    registerAnimationMap(key: string, value: string): void;
    unregisterAnimationMap(key: string): void;
    private setAnimationData;
    private checkDirectionAnimation;
    private setArea;
    private dirable;
    private tryRegisterAnimation;
    private getBaseAniName;
}
export declare class FramesModel implements IFramesModel {
    static createFromDisplay(display: any, animation: any, id?: number): {
        animations: Map<any, any>;
        id: number;
        gene: any;
        discriminator: string;
        animationName: any;
        display: any;
        sound: string;
    };
    avatarDir?: number;
    readonly discriminator: string;
    id: number;
    type: string;
    eventName: number[];
    display: IDisplay | null;
    sound: string;
    animations: Map<string, AnimationModel>;
    animationName: string;
    package: op_gameconfig.IPackage;
    shops: op_gameconfig.IShop[];
    gene: string;
    constructor(data: any);
    setInfo(val: any): void;
    getAnimationData(): Map<string, IAnimationData>;
    existAnimation(aniName: string): boolean;
    getAnimations(name: string): IAnimationData;
    destroy(): void;
    createProtocolObject(): op_gameconfig_01.IAnimationData[];
    getCollisionArea(aniName: string, flip?: boolean): number[][];
    getWalkableArea(aniName: string, flip?: boolean): number[][];
    getInteractiveArea(aniName: string, flip?: boolean): op_def.IPBPoint2i[] | undefined;
    getOriginPoint(aniName: any, flip?: boolean): LogicPoint;
    getDirable(): void;
    createSprite(properties: {
        nodeType: op_def.NodeType;
        x: number;
        y: number;
        z?: number;
        id?: number;
        dir?: number;
        isMoss?: boolean;
        layer?: number;
    }): Sprite;
    findAnimation(baseName: string, dir: number): RunningAnimation;
    checkDirectionAnimation(baseAniName: string, dir: Direction): string;
    checkDirectionByExistAnimations(baseAniName: string, dir: number): number;
    private setDisplay;
    private setAnimationData;
    private getDefaultAnimation;
}
export declare class DragonbonesModel implements IDragonbonesModel {
    discriminator: string;
    id: number;
    eventName: number[];
    sound: string;
    avatarDir?: number;
    avatar?: IAvatar;
    animationName?: string;
    constructor(data: any);
    setInfo(val: any): void;
    destroy(): void;
    getCollisionArea(aniName: string): number[][];
    getWalkableArea(): number[][];
    getOriginPoint(aniName: any): LogicPoint;
    getInteractiveArea(): op_def.IPBPoint2i[];
    existAnimation(aniName: string): boolean;
    findAnimation(baseName: string, dir: Direction): RunningAnimation;
    checkDirectionAnimation(baseName: string, dir: Direction): string;
    checkDirectionByExistAnimations(baseAniName: string, dir: number): number;
}
