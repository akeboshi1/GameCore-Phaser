import {op_gameconfig, op_client} from "pixelpai_proto";

export interface IDragonbonesModel {
    readonly discriminator: string;
    id: number;
    avatarDir?: number;
    avatar?: IAvatar;
    // TODO
    destroy();
}

export interface IAvatar {
    id: number;
    dirable?: (number[]|null);
    headBaseId?: (string|null);
    headHairId?: (string|null);
    headEyesId?: (string|null);
    headBackId?: (string|null);
    headMousId?: (string|null);
    headHatsId?: (string|null);
    headMaskId?: (string|null);
    headSpecId?: (string|null);
    bodyBaseId?: (string|null);
    bodyCostId?: (string|null);
    bodyDresId?: (string|null);
    bodyTailId?: (string|null);
    bodyWingId?: (string|null);
    bodySpecId?: (string|null);
    farmBaseId?: (string|null);
    farmCostId?: (string|null);
    farmShldId?: (string|null);
    farmWeapId?: (string|null);
    farmSpecId?: (string|null);
    barmBaseId?: (string|null);
    barmCostId?: (string|null);
    barmShldId?: (string|null);
    barmWeapId?: (string|null);
    barmSpecId?: (string|null);
    flegBaseId?: (string|null);
    flegCostId?: (string|null);
    flegSpecId?: (string|null);
    blegBaseId?: (string|null);
    blegCostId?: (string|null);
    blegSpecId?: (string|null);
}

export class DragonbonesModel implements IDragonbonesModel {
    discriminator: string = "DragonbonesModel";
    id: number;
    avatarDir?: number;
    avatar?: IAvatar;

    constructor(data: any) {
        if (data) {
            this.setInfo(data);
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
}
