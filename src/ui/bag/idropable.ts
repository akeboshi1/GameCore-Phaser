import { IDragable } from "./idragable";

export interface IDropable {
    dragDrop(dragable: IDragable): void;
    dragOver(dragable: IDragable): void;
    getDropType(): number;
    getDropData(): any;
    getBound(): Phaser.Geom.Rectangle;
}
