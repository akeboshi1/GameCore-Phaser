import { IDropable } from "./idropable";
import { IDragable } from "./idragable";
import { ResUtils, Url } from "../../game/core/utils/resUtil";
import { DynamicImage } from "../components/dynamic.image";

export class DragDropIcon extends Phaser.GameObjects.Container implements IDragable, IDropable {
    protected mDropType: number;
    protected mDragType: number;
    private mIcon: DynamicImage;
    private mUrl: string;
    private mCallBack: Function;
    constructor(private mScene: Phaser.Scene, x: number, y: number, texture?: string) {
        super(mScene, x, y);
        this.mIcon = new DynamicImage(this.mScene, 0, 0); // this.mScene.make.image(undefined, false);
        this.add(this.mIcon);
    }

    public load(value: string, thisArg?: any, onLoadComplete?: Function) {
        this.mUrl = value;
        const key: string = this.resKey;
        this.mIcon.load(Url.getOsdRes(this.mUrl), () => {
            if (this.mCallBack) this.mCallBack();
        });
        // if (!this.mScene.cache.obj.has(key)) {
        //     this.mScene.load.image(key, Url.getOsdRes(this.mUrl));
        //     this.mScene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
        //     this.mScene.load.start();
        // } else {
        //     this.onLoadCompleteHandler();
        // }
        this.mCallBack = onLoadComplete;
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
        const key: string = Url.getOsdRes((this.mUrl)); // Load.Image.getKey(this.mUrl);
        return key;
    }

    public destroy() {
        this.mCallBack = null;
        super.destroy(true);
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

    // private onLoadCompleteHandler() {
    //     const key: string = this.resKey;
    //     this.mIcon.setTexture(key);
    //     if (this.mCallBack) this.mCallBack();
    // }
}
