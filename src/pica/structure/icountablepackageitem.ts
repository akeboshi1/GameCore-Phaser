import { IAnimationData } from "./ielement";
export interface ICountablePackageItem {
    id: string;

    count: number;

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

    code: string;
}

export interface IExtendCountablePackageItem extends ICountablePackageItem {
    indexId: number;
    animationDisplay: { dataPath?: string; texturePath?: string };
    display: { dataPath?: string; texturePath?: string };
    animations?: IAnimationData[];
}
