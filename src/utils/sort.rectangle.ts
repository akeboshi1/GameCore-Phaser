import { LogicPos } from "./logic.pos";
import {Position45} from "./position45";

export class SortRectangle {
    private mLeft: LogicPos = new LogicPos();
    private mRight: LogicPos = new LogicPos();
    private mTop: LogicPos = new LogicPos();
    private mBottom: LogicPos = new LogicPos();

    setArea(val: number[][]) {
        if (!val || val.length < 1 || val[0].length < 0) return;
        const width = val[0].length;
        const height = val.length;
        const position = {rows: width, cols: height, tileWidth: 30, tileHeight: 15, sceneWidth: (width + height) * (30 / 2), sceneHeight: (width + height) * (15 / 2)};
        this.mTop = Position45.transformTo90(new LogicPos(0, 0), position);
        this.mLeft = Position45.transformTo90(new LogicPos(0, val.length - 1), position).add(-15, 0);
        this.mRight = Position45.transformTo90(new LogicPos(val.length - 1, 0), position).add(15, 0);
        this.mBottom = Position45.transformTo90(new LogicPos(val[0].length - 1, val.length - 1), position).add(0, 7);
    }

    get left(): LogicPos {
        return this.mLeft;
    }

    get right(): LogicPos {
        return this.mRight;
    }

    get top(): LogicPos {
        return this.mTop;
    }

    get bottom(): LogicPos {
        return this.mBottom;
    }
}
