import { ILogicPoint } from "utils";
export interface IScenery {
    readonly id: number;
    readonly depth: number;
    readonly width: number;
    readonly height: number;
    readonly uris: string[][];
    readonly speed: number;
    readonly fit: Fit;
    readonly offset: ILogicPoint;
}
export declare enum Fit {
    Center = 1,
    Fill = 2,
    Stretch = 3,
    Repeat = 4
}
