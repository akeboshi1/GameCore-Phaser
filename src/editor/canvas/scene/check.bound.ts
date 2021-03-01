import { IPos, IPosition45Obj, Logger, LogicPos, Position45 } from "utils";

export function transitionGrid(x: number, y: number, alignGrid: boolean, roomSize: IPosition45Obj) {
    const source = new LogicPos(x, y);
    const pos = Position45.transformTo45(source, roomSize);
    if (alignGrid === false) {
        return checkBound(roomSize, pos, source);
    }
    return checkBound(roomSize, pos, undefined);
}

/**
 * 边界检查
 * @param roomSize 房间和Tile大小
 * @param pos 45度坐标，
 * @param source 没有超出边界并不贴边就返回原始坐标
 */
function checkBound(roomSize: IPosition45Obj, pos: IPos, source?: LogicPos) {
    const bound = new LogicPos(pos.x, pos.y);
    if (pos.x < 0) {
        bound.x = 0;
    } else if (pos.x > roomSize.cols) {
        bound.x = roomSize.cols;
    }

    if (pos.y < 0) {
        bound.y = 0;
    } else if (pos.y > roomSize.rows) {
        bound.y = roomSize.rows;
    }
    if (bound.equal(pos) && source) {
        return source;
    }
    return Position45.transformTo90(bound, roomSize);
}
