import { BaseConfigData } from "gamecore";
import { IExploreChapterData, IExploreLevelData } from "picaStructure";
export declare class ExploreDataConfig extends BaseConfigData {
    chapters: IExploreChapterData[];
    levels: IExploreLevelData[];
    excludes: string[];
    getChapter(id: number): IExploreChapterData;
    getLevel(id: any): IExploreLevelData;
}
