import {Position45} from "./position45";
import {Pos} from "./pos";

export class SortRectangle {
    private mLeft: Pos = new Pos();
    private mRight: Pos = new Pos();
    private mTop: Pos = new Pos();
    private mBottom: Pos = new Pos();

    setArea(val: number[][]) {
        if (!val || val.length < 1 || val[0].length < 0) return;
        const width = val[0].length;
        const height = val.length;
        const position = {rows: width, cols: height, tileWidth: 30, tileHeight: 15, sceneWidth: (width + height) * (30 / 2), sceneHeight: (width + height) * (15 / 2)};
        this.mTop = Position45.transformTo90(new Pos(0, 0), position);
        this.mLeft = Position45.transformTo90(new Pos(0, val.length - 1), position).add(-15, 0);
        this.mRight = Position45.transformTo90(new Pos(val.length - 1, 0), position).add(15, 0);
        this.mBottom = Position45.transformTo90(new Pos(val[0].length - 1, val.length - 1), position).add(0, 7);
    }

    get left(): Pos {
        return this.mLeft;
    }

    get right(): Pos {
        return this.mRight;
    }

    get top(): Pos {
        return this.mTop;
    }

    get bottom(): Pos {
        return this.mBottom;
    }
}
