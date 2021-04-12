import { BaseConfigData } from "gamecore";
import { IJob } from "src/pica/structure/ijob";
export declare class JobConfig extends BaseConfigData {
    excludes: string[];
    jobMap: Map<string, Map<string, IJob[]>>;
    get(id: string): IJob;
    parseJson(json: any): void;
}
