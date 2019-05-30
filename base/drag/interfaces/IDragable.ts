import {IDropable} from "./IDropable";

export interface IDragable {
    dragStart(): void;
    dragStop(acceptDrag: IDropable): void;
    getDragImage(): Phaser.Image;
    getVisualDisplay(): Phaser.Image;
    getDragType(): number;
    getDragData(): any;
}