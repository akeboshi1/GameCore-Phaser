import { LogicPos } from "./logic.pos";
export declare class SortRectangle {
    private mLeft;
    private mRight;
    private mTop;
    private mBottom;
    setArea(val: number[][]): void;
    get left(): LogicPos;
    get right(): LogicPos;
    get top(): LogicPos;
    get bottom(): LogicPos;
}
