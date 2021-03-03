
export interface IExploreDataConfig {
    chapters?: IExploreChapterData[];
    levels?: IExploreLevelData[];
}

export interface IExploreChapterData {
    id: number;
    name: string;
    texturePath: string;
    totalStar: string;
    award: string[];
    requiredPlayerLevel: number;
    des: string;
}
export interface IExploreLevelData {
    id: number;
    sn: string;
    name: string;
    texturePath: string;
    type: number;
    chapterId: number;
    costEnergy: number;
    progress: number;
    clueItems: IClueItem[];
    completeScene: string;
}
export interface IClueItem {
    star: number;
    itemId: string;
}
