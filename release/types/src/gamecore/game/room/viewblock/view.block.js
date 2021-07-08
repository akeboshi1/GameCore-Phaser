import { Intersects } from "structure";
/**
 * 显示区域
 */
var Viewblock = /** @class */ (function () {
    function Viewblock(mRect, index) {
        this.mRect = mRect;
        // private mElements: IElement[] = [];
        this.mElements = new Map();
        this.mIndex = index;
    }
    Viewblock.prototype.add = function (element, miniViewPort) {
        this.mElements.set(element.id, element);
        return element.setRenderable(this.mInCamera);
    };
    Viewblock.prototype.remove = function (ele) {
        // const index = this.mElements.indexOf(ele);
        // if (index !== -1) {
        //     this.mElements.splice(index, 1);
        //     return true;
        // }
        return this.mElements.delete(ele.id);
    };
    // tick running... powered by manager.
    Viewblock.prototype.check = function (bound) {
        var _this = this;
        if (!bound)
            return;
        var newStat = Intersects.RectangleToRectangle(bound, this.rectangle);
        // if (this.mInCamera !== newStat) {
        //     for (const e of this.mElements) {
        //         根据情况看是否需要提前加载
        //         e.setRenderable(newStat);
        //     }
        // }
        // if (!miniViewPort) return;
        // if (this.mInCamera) {
        // for (const ele of this.mElements) {
        //     const pos = ele.getPosition45();
        //     ele.setRenderable(miniViewPort.contains(pos.x, pos.y), 1000);
        // }
        this.mElements.forEach(function (ele) {
            // const pos = ele.getPosition45();
            ele.setRenderable(_this.mInCamera, 0);
        });
        // }
        this.mInCamera = newStat;
    };
    Viewblock.prototype.getElement = function (id) {
        return this.mElements.get(id);
    };
    Object.defineProperty(Viewblock.prototype, "rectangle", {
        get: function () {
            return this.mRect || undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Viewblock.prototype, "inCamera", {
        get: function () {
            return this.mInCamera;
        },
        enumerable: true,
        configurable: true
    });
    return Viewblock;
}());
export { Viewblock };
//# sourceMappingURL=view.block.js.map