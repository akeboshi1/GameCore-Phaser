import { ICountablePackageItem } from "./icountablepackageitem";

export interface IGalleryCombination {
    id: string;
    name: string;
    des: string;
    difficult: number;
    requirement: string[] | ICountablePackageItem[];
    rewardItems: ICountablePackageItem[];
}

export interface IGalleryLevel {
    id: number;
    exp: number;
    rewardItems: ICountablePackageItem[];
}
