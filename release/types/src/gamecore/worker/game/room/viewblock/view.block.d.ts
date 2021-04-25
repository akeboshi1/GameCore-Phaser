import { LogicRectangle, LogicRectangle45 } from "structure";
import { IBlockObject } from "../block/iblock.object";
/**
 * 显示区域
 */
export declare class Viewblock {
    private mRect;
    private mElements;
    private mInCamera;
    private mIndex;
    constructor(mRect: LogicRectangle, index: number);
    add(element: IBlockObject, miniViewPort?: LogicRectangle45): Promise<any>;
    remove(ele: IBlockObject): boolean;
    check(bound: LogicRectangle): void;
    getElement(id: number): IBlockObject;
    get rectangle(): LogicRectangle | undefined;
    get inCamera(): boolean;
}
