import { Intersects, LogicRectangle, LogicRectangle45 } from "utils";
import { IBlockObject } from "../block/iblock.object";

/**
 * 显示区域
 */
export class Viewblock {
    // private mElements: IElement[] = [];
    private mElements = new Map<number, IBlockObject>();
    private mInCamera: boolean;
    private mIndex: number;

    constructor(private mRect: LogicRectangle, index: number) {
        this.mIndex = index;
    }

    public add(element: IBlockObject, miniViewPort?: LogicRectangle45) {
        // this.mElements.push(element);
        this.mElements.set(element.id, element);
        if (!miniViewPort) {
            return;
        }
        const pos = element.getPosition45();
        element.setRenderable(miniViewPort.contains(pos.x, pos.y) && this.mInCamera);
    }

    public remove(ele: IBlockObject): boolean {
        // const index = this.mElements.indexOf(ele);
        // if (index !== -1) {
        //     this.mElements.splice(index, 1);
        //     return true;
        // }
        return this.mElements.delete(ele.id);
    }

    // tick running... powered by manager.
    public check(bound: LogicRectangle, miniViewPort: LogicRectangle45) {
        if (!bound) return;
        const newStat = Intersects.RectangleToRectangle(bound, this.rectangle);
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
                ele.setRenderable(miniViewPort.contains(pos.x, pos.y), 0);
            });
        }
        this.mInCamera = newStat;
    }

    getElement(id: number): IBlockObject {
        return this.mElements.get(id);
    }

    get rectangle(): LogicRectangle | undefined {
        return this.mRect || undefined;
    }

    get inCamera(): boolean {
        return this.mInCamera;
    }
}
