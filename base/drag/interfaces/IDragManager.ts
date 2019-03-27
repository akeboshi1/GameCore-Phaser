import {IDragable} from "./IDragable";

export interface IDragManager {
    startDrag(dragable: IDragable): boolean;
}