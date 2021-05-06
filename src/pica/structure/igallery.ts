import { ICountablePackageItem } from "./icountablepackageitem";

export interface IGalleryCombination {
    id: string;
    name: string;
    des: string;
    difficult: number;
    requirement: string[] | ICountablePackageItem[];
    rewardItems: ICountablePackageItem[];
    gotcount: number;
    subsection: number[];
    gotindex: number[];
}

export interface IGalleryLevel {
    id: number;
    exp: number;
    level: number;
    /**
     *  1 不能领取，2 可以领取，3 已经领取
     */
    received: number;
    rewardItems: ICountablePackageItem;
    progress: number;
}
export interface IGalleryLevelGroup {
    level: number;
    progress: number;
    rewards: boolean;
    allReceived: boolean;
    gallery: IGalleryLevel[];
}
