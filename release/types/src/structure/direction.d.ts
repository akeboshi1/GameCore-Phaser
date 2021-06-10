import { IPos } from "./logic.pos";
export declare enum Direction {
    north = 0,
    north_west = 1,
    west = 2,
    west_south = 3,
    south = 4,
    south_east = 5,
    east = 6,
    east_north = 7,
    concave = 35,
    convex = 17
}
export declare class DirectionChecker {
    static check(pos1: IPos, pos2: IPos): number;
}
