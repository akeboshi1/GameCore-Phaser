import { IAvatar } from "../../../../render/rooms/display/dragonbones.model";
import { LogicPos } from "../../../../utils/logic.pos";
import { op_client, op_def, op_gameconfig, op_gameconfig_01 } from "pixelpai_proto";
import { IDragonbonesModel } from "../dragonbones/idragonbones.model";
import { AnimationData, AnimationQueue } from "../animation/ianimation";
import { IFramesModel } from "../frame/iframe.model";

export interface ISprite {
    readonly id: number;
    // 龙骨资源名集合
    readonly avatar: IAvatar;
    readonly nickname: string;
    readonly alpha: number;
    readonly displayBadgeCards: op_def.IBadgeCard[];

    readonly platformId: string;
    readonly sceneId: number;
    readonly nodeType: op_def.NodeType;
    readonly currentAnimation: AnimationData;
    readonly currentCollisionArea: number[][];
    readonly currentWalkableArea: number[][];
    readonly hasInteractive: boolean;
    readonly attrs: op_def.IStrPair[];
    readonly animationQueue: AnimationQueue[];
    currentAnimationName: string;
    displayInfo: IFramesModel | IDragonbonesModel;
    direction: number;
    pos: LogicPos;
    bindID: number;
    sn: string;
    isMoss?: boolean;
    mountSprites?: number[];

    newID();
    updateAvatar(avatar: op_gameconfig.IAvatar);
    updateDisplay(display: op_gameconfig.IDisplay, animations: op_gameconfig_01.IAnimationData[], defAnimation?: string);
    setPosition(x: number, y: number);
    setAnimationName(name: string, playTimes?: number): AnimationData;
    setAnimationQueue(queue: AnimationQueue[]);
    turn(): ISprite;
    toSprite(): op_client.ISprite;
}
