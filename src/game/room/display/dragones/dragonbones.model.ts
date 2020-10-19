import { op_def } from "pixelpai_proto";
import { Direction } from "../../../../utils/direction";
import { LogicPoint } from "../../../../utils/logic.point";
import { AnimationData } from "../animation/animation";
export interface IDragonbonesModel {
    readonly discriminator: string;
    id: number;
    avatarDir?: number;
    avatar?: IAvatar;
    animationName?: string;

    // TODO
    destroy();
    getCollisionArea(aniName: string): number[][];
    getWalkableArea(aniName: string): number[][];
    getOriginPoint(aniName: string): LogicPoint;
    existAnimation(aniName: string): boolean;
    getInteractiveArea(aniName: string): op_def.IPBPoint2i[] | undefined;
    findAnimation(baseName: string, dir: Direction): AnimationData;

}

export interface IAvatar {
    id: string;
    dirable?: (number[] | null);
    headBaseId?: (string | null);
    headHairId?: (string | null);
    headEyesId?: (string | null);
    headBackId?: (string | null);
    headMousId?: (string | null);
    headHatsId?: (string | null);
    headMaskId?: (string | null);
    headSpecId?: (string | null);
    bodyBaseId?: (string | null);
    bodyCostId?: (string | null);
    bodyDresId?: (string | null);
    bodyTailId?: (string | null);
    bodyWingId?: (string | null);
    bodySpecId?: (string | null);
    farmBaseId?: (string | null);
    farmCostId?: (string | null);
    farmShldId?: (string | null);
    farmWeapId?: (string | null);
    farmSpecId?: (string | null);
    barmBaseId?: (string | null);
    barmCostId?: (string | null);
    barmShldId?: (string | null);
    barmWeapId?: (string | null);
    barmSpecId?: (string | null);
    flegBaseId?: (string | null);
    flegCostId?: (string | null);
    flegSpecId?: (string | null);
    blegBaseId?: (string | null);
    blegCostId?: (string | null);
    blegSpecId?: (string | null);
    stalkerId?: (string | null);
}

export class DragonbonesModel implements IDragonbonesModel {
    discriminator: string = "DragonbonesModel";
    id: number;
    avatarDir?: number;
    avatar?: IAvatar;

    constructor(data: any) {
        // this.id = id;
        // this.avatar = avatar;
        if (data) {
            this.id = data.id;
            this.avatar = data.avatar;
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
        return [[1, 1], [1, 1]];
    }

    public getWalkableArea(): number[][] {
        return [[1, 1], [1, 1]];
    }

    public getOriginPoint(aniName): Phaser.Geom.Point {
        return new Phaser.Geom.Point(1, 1);
    }

    public getInteractiveArea(): op_def.IPBPoint2i[] {
        return undefined;
    }

    existAnimation(aniName: string) {
        return true;
    }

    public findAnimation(baseName: string, dir: Direction): AnimationData {
        let flip = false;
        switch (dir) {
            case Direction.south_east:
                flip = true;
                dir = Direction.west_south;
                break;
            case Direction.east_north:
                flip = true;
                dir = Direction.north_west;
                break;
        }
        let addName: string = "";
        if ((dir >= Direction.north && dir < Direction.west) || dir > Direction.east && dir <= Direction.east_north) addName = "_back";
        return { name: `${baseName}${addName}`, flip };
    }
}
