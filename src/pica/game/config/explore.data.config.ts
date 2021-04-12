import { BaseConfigData } from "gamecore";
export class ExploreDataConfig extends BaseConfigData {
    chapters: any[];
    levels: any[];
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
