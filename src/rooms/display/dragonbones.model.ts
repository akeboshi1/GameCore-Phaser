import { op_gameconfig } from "pixelpai_proto";

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
    getOriginPoint(aniName: string): Phaser.Geom.Point;
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
}
