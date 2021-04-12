import { BaseConfigData } from "gamecore";
export declare class ExploreDataConfig extends BaseConfigData {
    chapters: any[];
    levels: any[];
    excludes: string[];
    getChapter(id: number): any;
    getLevel(id: any): any;
}
