import { Element, IElement } from "../element/element";
import { Logger } from "../../utils/log";
import { Rectangle45 } from "../../utils/rectangle45";

/**
 * 显示区域
 */
export class Viewblock {
    // private mElements: IElement[] = [];
    private mElements = new Map<number, IElement>();
    private mInCamera: boolean;
    private mIndex: number;

    constructor(private mRect: Phaser.Geom.Rectangle, index: number) {
        this.mIndex = index;
    }

    public add(element: IElement, miniViewPort?: Rectangle45) {
        // this.mElements.push(element);
        this.mElements.set(element.id, element);
        if (!miniViewPort) {
            return;
        }
        const pos = element.getPosition45();
        element.setRenderable(miniViewPort.contains(pos.x, pos.y) && this.mInCamera);
    }

    public remove(ele: IElement): boolean {
        // const index = this.mElements.indexOf(ele);
        // if (index !== -1) {
        //     this.mElements.splice(index, 1);
        //     return true;
        // }
        return this.mElements.delete(ele.id);
    }

    // tick running... powered by manager.
    public check(bound: Phaser.Geom.Rectangle, miniViewPort: Rectangle45) {
        if (!bound) return;
        const newStat = Phaser.Geom.Intersects.RectangleToRectangle(bound, this.rectangle);
        // if (this.mInCamera !== newStat) {
        //     for (const e of this.mElements) {
        //         根据情况看是否需要提前加载
        //         e.setRenderable(newStat);
        //     }
        // }
        if (!miniViewPort) return;
        if (this.mInCamera) {
            // for (const ele of this.mElements) {
            //     const pos = ele.getPosition45();
            //     ele.setRenderable(miniViewPort.contains(pos.x, pos.y), 1000);
            // }
            this.mElements.forEach((ele) => {
               const pos = ele.getPosition45();
               ele.setRenderable(miniViewPort.contains(pos.x, pos.y), 1000);
            });
        }
        this.mInCamera = newStat;
    }

    getElement(id: number): IElement {
        return this.mElements.get(id);
    }

    get rectangle(): Phaser.Geom.Rectangle | undefined {
        return this.mRect || undefined;
    }

    get inCamera(): boolean {
        return this.mInCamera;
    }
}
