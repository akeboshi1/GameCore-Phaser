import {IDragable} from "./IDragable";

export interface IDragData {
    dragSource(): IDragable;
    dragSource(value: IDragable): void;
}