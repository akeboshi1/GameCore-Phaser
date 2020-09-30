import { IAnimationData, AnimationData } from "./ianimation";
import { op_def, op_gameconfig } from "pixelpai_proto";
export interface IDisplay {
    texturePath: string;
    dataPath?: string;
}

export enum Direction {
    north,
    north_west,
    west,
    west_south,
    south,
    south_east,
    east,
    east_north,
}

export interface IFramesModel {
    readonly discriminator: string;
    readonly gene: string | undefined;
    id: number;
    avatarDir?: number;
    type?: string;
    display?: IDisplay | null;
    animations?: Map<string, IAnimationData>;
    animationName: string;
    package?: op_gameconfig.IPackage;
    shops?: op_gameconfig.IShop[] | null;
    getAnimations(name: string): IAnimationData;
    existAnimation(aniName: string): boolean;
    getCollisionArea(aniName: string, flip: boolean): number[][];
    getWalkableArea(aniName: string, flip: boolean): number[][];
    getInteractiveArea(aniName: string): op_def.IPBPoint2i[] | undefined;
    getOriginPoint(aniName: string, flip: boolean): Phaser.Geom.Point;
    createSprite(properties: object);
    findAnimation(baseName: string, dir: Direction): AnimationData;
    destroy();
}
