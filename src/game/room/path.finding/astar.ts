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

    find(startPos: IPos, endPos: IPos): LogicPos[] {
        if (!this.finder) {
            Logger.getInstance().error(`finder not exist`);
            return;
        }
        if (!this.grid) {
            Logger.getInstance().error(`can't find path. grid not exist`);
            return;
        }
        const start45 = this.roomService.transformToMini45(startPos);
        const end45 = this.roomService.transformToMini45(endPos);
        const { rows, cols } = this.roomService.miniSize;
        if (end45.x < 0 || end45.x >= cols || end45.y < 0 || end45.y >= rows) {
            return;
        }
        const result = [];
        this.gridBackup = this.grid.clone();
        const paths = this.finder.findPath(start45.x, start45.y, end45.x, end45.y, this.gridBackup);
        for (const path of paths) {
            result.push(this.roomService.transformToMini90(new LogicPos(path[0], path[1])));
        }
        result.shift();
        return result;
    }
}
