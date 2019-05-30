import {DisplayLoaderAvatar} from "../../../common/avatar/DisplayLoaderAvatar";
import {IDragable} from "../../drag/interfaces/IDragable";
import {IDropable} from "../../drag/interfaces/IDropable";
import {BaseIcon} from "./BaseIcon";

export class DragDropIcon extends BaseIcon implements IDragable, IDropable {
    protected m_DropType: number;
    protected m_DragType: number;
    public constructor(game: Phaser.Game) {
        super(game);
    }

    public setDragType(value: number): void {
        this.m_DragType = value;
    }

    public setDropType(value: number): void {
        this.m_DropType = value;
    }

    public dragDrop(dragable: IDragable): void {
    }

    public dragOver(dragable: IDragable): void {
    }

    public getDropData(): any {
    }

    public getDropType(): number {
        return this.m_DropType;
    }

    public dragStart(): void {
    }

    public dragStop(acceptDrag: IDropable): void {
    }

    public getDragData(): any {
    }

    public getDragImage(): Phaser.Image {
        return this.icon;
    }

    public getDragType(): number {
        return this.m_DragType;
    }

    public getVisualDisplay(): Phaser.Image {
        return undefined;
    }

    public getBound(): Phaser.Rectangle {
        let bound = this.getBounds();
        return new Phaser.Rectangle(bound.x, bound.y, bound.width, bound.height);
    }
}