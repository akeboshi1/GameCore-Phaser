import {Element, IElement} from "../element/element";
import {Logger} from "../../utils/log";
import {Rectangle45} from "../../utils/rectangle45";

/**
 * 显示区域
 */
export class Viewblock {
    private mElements: IElement[] = [];
    private mInCamera: boolean;
    private mIndex: number;

    constructor(private mRect: Phaser.Geom.Rectangle, index: number) {
        this.mIndex = index;
    }

    public add(element: IElement) {
        this.mElements.push(element);
        const pos = element.getPosition();
        element.setRenderable(this.rectangle.contains(pos.x, pos.y) && this.mInCamera);
    }

    public remove(ele: IElement): boolean {
        const index = this.mElements.indexOf(ele);
        if (index !== -1) {
            this.mElements.splice(index, 1);
            return true;
        }
        return false;
    }

    // tick running... powered by manager.
    public check(bound: Phaser.Geom.Rectangle, miniViewPort: Rectangle45) {
        if (!bound) return;
        const newStat = Phaser.Geom.Intersects.RectangleToRectangle(bound, this.rectangle);
        if (this.mInCamera !== newStat) {
            for (const e of this.mElements) {
                e.setRenderable(newStat);
            }
        }
        if (!miniViewPort) return;
        // let inView: boolean = false;
        if (this.mInCamera) {
            for (const ele of this.mElements) {
                const pos = ele.getPosition45();
                // inView = miniViewPort.contains(pos.x, pos.y);
                // ele.setRenderable(inView);
                if (miniViewPort.contains(pos.x, pos.y)) {
                    ele.fadeIn();
                    // if (!miniViewPort.contains(pos.x, pos.y)) {
                        // console.log(viewport.width);
                        // const padding = (viewport.width - miniViewPort.height >> 1) + 1;
                        // let dis: number = miniViewPort.y - pos.y;
                        // if (dis > 0) {
                        //     ele.fadeAlpha((padding - dis) * 0.1);
                        // } else {
                        //     ele.fadeAlpha(0);
                        // }
                        // dis = pos.y - (miniViewPort.y + miniViewPort.height);
                        // if (dis > 0) {
                        //     ele.fadeAlpha((padding - dis) * 0.1);
                        // }
                        // dis = miniViewPort.x - pos.x;
                        // if (dis > 0) {
                        //     ele.fadeAlpha((padding - dis) * 0.1);
                        // }
                        // dis = pos.x - (miniViewPort.x + miniViewPort.width);
                        // if (dis > 0) {
                        //     ele.fadeAlpha((padding - dis) * 0.1);
                        // }
                    //     ele.fadeOut();
                    // } else {
                    //     ele.fadeIn();
                    // }
                } else {
                    ele.fadeOut();
                }
            }
        }
        this.mInCamera = newStat;
    }

    get rectangle(): Phaser.Geom.Rectangle | undefined {
        return this.mRect || undefined;
    }
}
