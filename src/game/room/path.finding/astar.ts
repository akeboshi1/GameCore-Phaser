import { Grid, AStarFinder } from "pathfinding";
import { IPos, Logger, LogicPos } from "utils";
import { IRoomService } from "../room/room";

export class AStar {
    private grid: Grid;
    private finder: AStarFinder;
    private gridBackup: Grid;
    constructor(private roomService: IRoomService) {
    }

    init(matrix: number[][]) {
        this.grid = new Grid(matrix);
        this.finder = new AStarFinder({ allowDiagonal: true });
    }

    setWalkableAt(x: number, y: number, value: boolean) {
        if (!this.grid) {
            return;
        }
        this.grid.setWalkableAt(x, y, value);
    }

    isWalkableAt(x: number, y: number) {
        if (!this.grid) {
            return false;
        }
        return this.grid.isWalkableAt(x, y);
    }

    find(startPos: IPos, targetList: IPos[], toReverse: boolean): LogicPos[] {
        if (!this.finder) {
            Logger.getInstance().error(`finder not exist`);
            return;
        }
        if (!this.grid) {
            Logger.getInstance().error(`can't find path. grid not exist`);
            return;
        }
        const { rows, cols } = this.roomService.miniSize;
        const start45 = this.roomService.transformToMini45(startPos);
        const end45List = [];
        targetList.forEach((p) => {
            p = this.roomService.transformToMini45(p);
            if (!this._invalidPoint(p, cols, rows)) {
                end45List.push(p);
            }
        });

        if (end45List.length === 0) {
            return;
        }

        const result = [];
        this.gridBackup = this.grid.clone();
        const paths = this.finder.findPathToMultipleEnds(start45.x, start45.y, end45List, this.gridBackup, toReverse);
        for (const path of paths) {
            result.push(this.roomService.transformToMini90(new LogicPos(path[0], path[1])));
        }
        if (toReverse === false) {
            result.shift(); // 正向走的时候移除第一格是为了防止人物走的过程中忽然回头，反向的时候是人从家具上下来，如果移除掉第一格会造成人物从交互点的下一格开始走
        }
        return result;
    }

    _invalidPoint(position: IPos, cols: number, rows: number) {
        return position.x < 0 || position.x >= cols || position.y < 0 || position.y >= rows;
    }
}
