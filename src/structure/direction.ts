import {IPos} from "./logic.pos";

export enum Direction {
    north, // 0
    north_west, // 1
    west, // 2
    west_south, // 3
    south, // 4
    south_east, // 5
    east, // 6
    east_north, // 7
}

export class DirectionChecker {
    // dir from pos1 to pos2
    public static check(pos1: IPos, pos2: IPos): number {
        const reg = Math.atan2((pos2.y - pos1.y), (pos2.x - pos1.x));
        const ang = reg * (180 / Math.PI);
        // 重叠
        if (ang > 90) {
            return 3;
        } else if (ang >= 0) {
            return 5;
        } else if (ang >= -90) {
            return 7;
        } else {
            return 1;
        }
    }
}
