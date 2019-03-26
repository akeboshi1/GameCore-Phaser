import {DisplayLoaderAvatar} from "../../../common/avatar/DisplayLoaderAvatar";
import {IDragable} from "../../drag/interfaces/IDragable";
import {IDropable} from "../../drag/interfaces/IDropable";

export class DragIcon extends DisplayLoaderAvatar implements IDragable {
    public constructor(game: Phaser.Game) {
        super(game);
    }

    public dragStart(): void {
    }

    public dragStop(acceptDrag: IDropable): void {
    }

    public getDragData(): any {
    }

    public getDragImage(): Phaser.BitmapData {
        return undefined;
    }

    public getDragType(): number {
        return 0;
    }

    public getVisualDisplay(): Phaser.Image {
        return undefined;
    }

}