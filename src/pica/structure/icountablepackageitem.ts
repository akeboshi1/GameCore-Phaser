import { IAnimationData } from "./ielement";
import { ICompareValue, IPrice } from "./imarketcommodity";
export interface ICountablePackageItem {
    id: string;
    count: number;
    neededCount: number;
    name: string;
    shortName: string;
    texturePath: string;
    category: string;
    subcategory: string;
    source: string;
    elementId: string;
    des: string;
    nodeType: number;
    className: string;
    tradeable: boolean;
    recyclable: boolean;
    executable: boolean;
    quality: number;
    grade: number;
    rarity: number;
    forge: number;
    combine: number;
    type: string;
    version?: string;
    recommended: string;
    code: string;
    suitType: string;
    sn: string;
    slot: string;
    tag: string;
    affectValues: ICompareValue[];
    sellingPrice: IPrice;
}

export interface IExtendCountablePackageItem extends ICountablePackageItem {
    indexId: number;
    animationDisplay: { dataPath?: string; texturePath?: string };
    display: { dataPath?: string; texturePath?: string };
    animations?: IAnimationData[];
}
