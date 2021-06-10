import { IAvatar } from "./dragonbones";
export declare class AvatarSuitType {
    static avatarSuit: AvatarSuitType;
    static suitPart: {
        costume: string[];
        hair: string[];
        eye: string[];
        mouse: string[];
        hat: string[];
        mask: string[];
        face: string[];
        weapon: string[];
        shield: string[];
        tail: string[];
        wing: string[];
        helmet: string[];
        shell: string[];
        base: string[];
    };
    static specHideParts: {
        headSpecId: string[];
        bodySpecId: string[];
        farmSpecId: string[];
        barmSpecId: string[];
        flegSpecId: string[];
        blegSpecId: string[];
    };
    static slotBitMap: Map<string, number>;
    static createAvatar(suits: AvatarSuit[], avatar?: any): IAvatar;
    static createAvatarBySn(suit_type: string, sn: string, slot: string, tag: string, version?: string, avatar?: any): IAvatar;
    static createHasBaseAvatar(suits: AvatarSuit[]): IAvatar;
    static createHasBaseAvatarBySn(suit_type: string, sn: string, slot: string, tag: string, version?: string): IAvatar;
    static createBaseAvatar(): IAvatar;
    static hasAvatarSuit(attrs: any): boolean;
    static checkSlotValue(suitType: string, slotbit: string, resultType?: boolean): any[];
    static toHumpName(str: string): string;
    static toSlotNames(strs: string[]): string[];
    static toSlotName(str: string): string;
    static getSuitsFromItem(avatarSuits: any[]): {
        avatar: IAvatar;
        suits: AvatarSuit[];
    };
    static checkSpecHideParts(avatar: IAvatar): IAvatar;
    static toIAvatarSets(avatar: IAvatar): Array<{
        id: string;
        parts: string[];
        version?: string;
    }>;
    costume: string[];
    hair: string[];
    eye: string[];
    mouse: string[];
    hat: string[];
    mask: string[];
    face: string[];
    weapon: string[];
    shield: string[];
    tail: string[];
    wing: string[];
    helmet: string[];
    shell: string[];
    baseSuitType: string;
    base: string[];
}
export declare class SuitAlternativeType {
    static suitAlternative: SuitAlternativeType;
    static checkAlternative(target: string, source: string): boolean;
    costume: number;
    hair: number;
    eye: number;
    mouse: number;
    hat: number;
    mask: number;
    face: number;
    weapon: number;
    shield: number;
    tail: number;
    wing: number;
    helmet: number;
    shell: number;
}
export declare class BaseAvatar {
    id: string;
    barmBaseId: {
        sn: string;
    };
    blegBaseId: {
        sn: string;
    };
    bodyBaseId: {
        sn: string;
    };
    farmBaseId: {
        sn: string;
    };
    flegBaseId: {
        sn: string;
    };
    headBaseId: {
        sn: string;
    };
    headHairId: {
        sn: string;
    };
    headEyesId: {
        sn: string;
    };
    headMousId: {
        sn: string;
    };
    bodyCostId: {
        sn: string;
    };
}
export interface AvatarSuit {
    id: string;
    sn: string;
    slot: string;
    suit_type: string;
    version?: string;
    tag?: string;
}
