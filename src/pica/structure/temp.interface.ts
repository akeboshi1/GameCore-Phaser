import { IGalleryCombination } from "./igallery";

export interface IUpdateGalleryDatas {
    list: Array<{ id: string, status: number }>;
    galleryLevel: number;
    galleryExp: number;
    nextLevelExp: number;
    badgeLevel: number;
    badgeExp: number;
    badgePresentLevelexp: number;
}
export interface IGalleryCollection extends IGalleryCombination {
    rewardId: number;
    gotcount: number;
    gotindex: number[];
}
