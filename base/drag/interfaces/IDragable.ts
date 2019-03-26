import {IDropable} from "./IDropable";

export interface IDragable {
    dragStart(): void;
    dragStop(acceptDrag: IDropable): void;
    getDragImage(): Phaser.BitmapData;
    getVisualDisplay(): Phaser.Image;
    getDragType(): number;
    getDragData(): any;
}