import { IAvatar, IDragonbonesModel, RunningAnimation } from "structure";
import { Direction, LogicPoint } from "utils";
import { op_def } from "pixelpai_proto";
export declare class DragonbonesModel implements IDragonbonesModel {
    discriminator: string;
    id: number;
    eventName: number[];
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
