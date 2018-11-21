import {IDisposeObject} from "../../../IDisposeObject";

export interface IPageComponent extends IDisposeObject {
    setCurIndex( index: number ): void;
    setMaxIndex( index: number ): void;
    readonly curIndex: number;
    readonly maxIndex: number;
    setPagePolicy( needHide: boolean, needLoop: boolean): void;
}