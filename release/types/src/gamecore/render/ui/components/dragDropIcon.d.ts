/// <reference types="phaser" />
import { IDragable } from "./idragable";
import { IDropable } from "./idropable";
export declare class DragDropIcon extends Phaser.GameObjects.Container implements IDragable, IDropable {
    private mScene;
    protected mDropType: number;
    protected mDragType: number;
    private mIcon;
    private mUrl;
    private mCallBack;
    constructor(mScene: Phaser.Scene, x: number, y: number, texture?: string);
    load(value: string, thisArg?: any, onLoadComplete?: Function): void;
    dragStart(): void;
    dragStop(acceptDrag: IDropable): void;
    dragDrop(dragable: IDragable): void;
    dragOver(dragable: IDragable): void;
    getDragData(): any;
    getDropData(): any;
    getDragImage(): Phaser.GameObjects.Image;
    getVisualDisplay(): Phaser.GameObjects.Image;
    getBound(): Phaser.Geom.Rectangle;
    get resKey(): string;
    destroy(): void;
    get icon(): Phaser.GameObjects.Image;
    setDragType(value: number): void;
    setDropType(value: number): void;
    getDropType(): number;
    getDragType(): number;
}
