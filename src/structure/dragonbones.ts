export interface IDragonbonesModel {
    readonly discriminator?: string;
    id: number;
    avatarDir?: number;
    avatar?: IAvatar;
    animationName?: string;
}

export interface IAvatar {
    id: string;
    dirable?: (number[] | null);
    headBaseId?: (SlotSkin | string | null);
    headHairId?: (SlotSkin | string | null);
    headEyesId?: (SlotSkin | string | null);
    headHairBackId?: (SlotSkin | string | null);
    headMousId?: (SlotSkin | string | null);
    headHatsId?: (SlotSkin | string | null);
    headMaskId?: (SlotSkin | string | null);
    headSpecId?: (SlotSkin | string | null);
    headFaceId?: (SlotSkin | string | null);
    bodyBaseId?: (SlotSkin | string | null);
    bodyCostId?: (SlotSkin | string | null);
    bodyCostDresId?: (SlotSkin | string | null);
    bodyTailId?: (SlotSkin | string | null);
    bodyWingId?: (SlotSkin | string | null);
    bodySpecId?: (SlotSkin | string | null);
    farmBaseId?: (SlotSkin | string | null);
    farmCostId?: (SlotSkin | string | null);
    farmShldId?: (SlotSkin | string | null);
    farmWeapId?: (SlotSkin | string | null);
    farmSpecId?: (SlotSkin | string | null);
    barmBaseId?: (SlotSkin | string | null);
    barmCostId?: (SlotSkin | string | null);
    barmShldId?: (SlotSkin | string | null);
    barmWeapId?: (SlotSkin | string | null);
    barmSpecId?: (SlotSkin | string | null);
    flegBaseId?: (SlotSkin | string | null);
    flegCostId?: (SlotSkin | string | null);
    flegSpecId?: (SlotSkin | string | null);
    blegBaseId?: (SlotSkin | string | null);
    blegCostId?: (SlotSkin | string | null);
    blegSpecId?: (SlotSkin | string | null);
    stalkerId?: (SlotSkin | string | null);
}

export interface SlotSkin {
    sn?: string;
    suitType?: string;
    version?: string;
}
