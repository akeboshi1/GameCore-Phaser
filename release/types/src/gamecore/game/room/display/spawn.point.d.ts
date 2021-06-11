/// <reference types="tooqinggamephaser" />
import { op_client, op_gameconfig, op_gameconfig_01, op_def } from "pixelpai_proto";
import { LogicPos, AnimationQueue, AvatarSuit, ISprite, RunningAnimation, IAvatar, IDragonbonesModel, IFramesModel } from "structure";
export declare class SpawnPoint implements ISprite {
    id: number;
    avatar: IAvatar;
    nickname: string;
    alpha: number;
    displayBadgeCards: op_def.IBadgeCard[];
    walkableArea: string;
    collisionArea: string;
    originPoint: number[];
    walkOriginPoint: number[];
    platformId: string;
    sceneId: number;
    nodeType: op_def.NodeType;
    currentAnimation: RunningAnimation;
    currentAnimationName: string;
    displayInfo: IFramesModel | IDragonbonesModel;
    direction: number;
    pos: LogicPos;
    bindID: number;
    sn: string;
    attrs: op_def.IStrPair[];
    animationQueue: AnimationQueue[];
    suits: AvatarSuit[];
    titleMask: number;
    sound: string;
    constructor();
    newID(): void;
    setPosition(x: number, y: number): void;
    turn(): ISprite;
    toSprite(): op_client.ISprite;
    updateAvatar(avatar: op_gameconfig.IAvatar): void;
    setTempAvatar(avatar: IAvatar): void;
    updateAvatarSuits(suits: AvatarSuit[]): boolean;
    updateDisplay(display: op_gameconfig.IDisplay, animations: op_gameconfig_01.IAnimationData[], defAnimation?: string): void;
    updateAttr(attrs: op_def.IStrPair[]): void;
    setAnimationName(): RunningAnimation;
    setAnimationQueue(): void;
    get display(): op_gameconfig.IDisplay;
    get animation(): op_gameconfig_01.IAnimationData;
    setDirection(): void;
    setDisplayInfo(): void;
    getCollisionArea(): number[][];
    getWalkableArea(): number[][];
    getOriginPoint(): {
        x: number;
        y: number;
    };
    getInteractive(): any[];
    registerAnimationMap(key: string, value: string): void;
    unregisterAnimationMap(key: string): void;
    get currentCollisionArea(): number[][];
    get currentWalkableArea(): number[][];
    get currentCollisionPoint(): Phaser.Geom.Point;
    get hasInteractive(): boolean;
    get interactive(): any[];
    get speed(): number;
}
