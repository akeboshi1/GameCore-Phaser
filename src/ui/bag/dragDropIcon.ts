import { IDropable } from "./idropable";
import { IDragable } from "./idragable";
import { ResUtils, Url } from "../../utils/resUtil";

export class DragDropIcon extends Phaser.GameObjects.Container implements IDragable, IDropable {
    protected mDropType: number;
    protected mDragType: number;
    private mIcon: Phaser.GameObjects.Image;
    private mUrl: string;
    constructor(private mScene: Phaser.Scene, x: number, y: number, texture?: string) {
        super(mScene, x, y);
        this.mIcon = this.mScene.make.image(undefined, false);
        this.add(this.mIcon);
    }

    public load(value: string, thisArg?: any, onLoadComplete?: Function) {
        this.mUrl = value;
        const key: string = this.resKey;
        if (!this.mScene.cache.obj.has(key)) {
            this.mScene.load.image(key, Url.getRes(this.mUrl));
            this.mScene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
            this.mScene.load.start();
        } else {
            this.onLoadCompleteHandler();
        }
    }

    public dragStart(): void {
    }

    public dragStop(acceptDrag: IDropable): void {
    }

    public dragDrop(dragable: IDragable): void {
    }

    public dragOver(dragable: IDragable): void {
    }

    public getDragData(): any {
    }

    public getDropData(): any {
    }

    public getDragImage(): Phaser.GameObjects.Image {
        return this.mIcon;
    }

    public getVisualDisplay(): Phaser.GameObjects.Image {
        return undefined;
    }

    public getBound(): Phaser.Geom.Rectangle {
        const bound = this.getBounds();
        return new Phaser.Geom.Rectangle(bound.x, bound.y, bound.width, bound.height);
    }

    public get resKey(): string {
        if (this.mUrl === undefined) return "";
        const key: string = Url.getRes(this.mUrl); // Load.Image.getKey(this.mUrl);
        return key;
    }

    public destroy() {
        super.destroy();
    }

    public get icon(): Phaser.GameObjects.Image {
        return this.mIcon;
    }

    public setDragType(value: number): void {
        this.mDragType = value;
    }

    public setDropType(value: number): void {
        this.mDropType = value;
    }

    public getDropType(): number {
        return this.mDropType;
    }

    public getDragType(): number {
        return this.mDragType;
    }

    private onLoadCompleteHandler() {

    }
}
