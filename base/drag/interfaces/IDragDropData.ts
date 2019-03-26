import {IDragable} from "./IDragable";
import {IDropable} from "./IDropable";

export interface IDragDropData {
    dragSource: IDragable;
    dropTarget: IDropable;
}