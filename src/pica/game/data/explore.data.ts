import { BaseConfigData } from "./base.config.data";

export class ExploreData extends BaseConfigData {
    public chapters: IExploreChapterData[];
    public levels: IExploreLevelData[];
}

export interface IExploreChapterData {
    id: number;
    name?: (string | null);
    imagePath?: (string | null);
    totalStar?: (number | null);
    award?: (any | null);
    requiredPlayerLevel?: (number | null);
    des?: (string | null);
}
export interface IExploreLevelData {
    id: number;
    sn: string;
    name: string;
    imagePath: string;
    type: number;
    chapterId: number;
    clueItems: IClueItem[];
}
export interface IClueItem {
    star: number;
    itemId: string;
}
