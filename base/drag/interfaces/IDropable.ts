import {IDragable} from "./IDragable";

export interface IDropable {
    dragDrop(dragable: IDragable): void;
    getAcceptDragImage(): Phaser.BitmapData;
    getDropType(): number;
    getDropData(): any;
}