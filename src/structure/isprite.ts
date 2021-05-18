import { op_client, op_gameconfig, op_gameconfig_01, op_def } from "pixelpai_proto";
import { IPos, LogicPoint } from "utils";
import { AnimationQueue, RunningAnimation } from "./animation";
import { Animator } from "./animator";
import { AvatarSuit } from "./avatar.suit.type";
import { IAvatar, IDragonbonesModel } from "./dragonbones";
import { IFramesModel } from "./frame";

export interface ISprite {
    id: number;
    avatar: IAvatar;
    titleMask: number;
    nickname: string;
    alpha: number;
    displayBadgeCards: op_def.IBadgeCard[];
    sound: string;

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
    animator?: Animator;
    updateSuits?: boolean;
    layer?: number;
    newID();
    updateAvatar(avatar: IAvatar);
    setTempAvatar(avatar: IAvatar);
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
    getInteractive(): any;
    turn(): ISprite;
    toSprite(): op_client.ISprite;
    registerAnimationMap(key: string, value: string);
    unregisterAnimationMap(key: string);
}
