import {IDragable} from "./IDragable";

export interface IDragManager {
    setup(container: Phaser.Group): void;
    startDrag(dragable: IDragable): boolean;
}