import {Element, IElement} from "../element/element";
import {Logger} from "../../utils/log";

/**
 * 显示区域
 */
export class Viewblock {
    private mElements: IElement[] = [];
    private mInCamera: boolean;
    private mIndex: number;
    private mDebug: boolean;

    constructor(private mRect: Phaser.Geom.Rectangle, index: number, debug?: boolean) {
        this.mIndex = index;
        this.mDebug = debug;
    }

    public add(element: IElement) {
        this.mElements.push(element);
        const pos = element.getPosition();
        element.setRenderable(this.rectangle.contains(pos.x, pos.y));
    }

    public remove(ele: IElement) {
        const index = this.mElements.indexOf(ele);
        if (index !== -1) {
            this.mElements.splice(index, 1);
        }
    }

    // tick running... powered by manager.
    public check(bound: Phaser.Geom.Rectangle) {
        if (!bound) return;
        const newStat = Phaser.Geom.Intersects.RectangleToRectangle(bound, this.rectangle);
        if (this.mInCamera !== newStat) {
            for (const e of this.mElements) {
                e.setRenderable(newStat);
            }
        }
        this.mInCamera = newStat;
    }

    get rectangle(): Phaser.Geom.Rectangle | undefined {
        return this.mRect || undefined;
    }
}
