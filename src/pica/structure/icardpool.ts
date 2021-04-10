import { ICountablePackageItem } from "./icountablepackageitem";

export interface ICardPool {
    className: string;
    id: string;
    tokenId: string;
    price: number;
    unitPrice: number;
    alterTokenId: string;
    drawTime: number;
    picaStarCount: number;
    picaStarName: string;
    cardPoolGroup: number;
    coverPath: string;
    backPath: string;

}

export interface IDrawPoolStatus extends ICardPool {
    nextFreeTime?: number;
    progressAward?: IProgress[];
    progress?: number;
    progressExpireTime?: number;
}

export interface IProgress {

    targetValue?: number;

    rewards?: ICountablePackageItem[];

    received?: boolean;
}
