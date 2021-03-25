import { BaseConfigData } from "gamecore";
import { IExploreChapterData, IExploreLevelData } from "picaStructure";

export class ExploreDataConfig extends BaseConfigData {
    chapters: IExploreChapterData[];
    levels: IExploreLevelData[];
    excludes = ["clueItems"];
    public getChapter(id: number) {
        if (!this.chapters) return undefined;
        for (const data of this.chapters) {
            if (data.id === id) return data;
        }
        return undefined;
    }

    public getLevel(id) {
        if (!this.levels) return undefined;
        for (const data of this.levels) {
            if (data.id === id) return data;
        }
        return undefined;
    }
}
