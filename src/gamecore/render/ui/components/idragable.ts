import { IDropable } from "./idropable";

export interface IDragable {
    dragStart(): void;
    dragStop(acceptDrag: IDropable): void;
    getDragImage(): Phaser.GameObjects.Image;
    getVisualDisplay(): Phaser.GameObjects.Image;
    getDragType(): number;
    getDragData(): any;
}
