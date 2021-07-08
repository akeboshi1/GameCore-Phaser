var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { DynamicImage } from "baseRender";
var DragDropIcon = /** @class */ (function (_super) {
    __extends_1(DragDropIcon, _super);
    function DragDropIcon(mScene, render, x, y, texture) {
        var _this = _super.call(this, mScene, x, y) || this;
        _this.mScene = mScene;
        _this.render = render;
        _this.mIcon = new DynamicImage(_this.mScene, 0, 0); // this.mScene.make.image(undefined, false);
        _this.add(_this.mIcon);
        return _this;
    }
    DragDropIcon.prototype.load = function (value, thisArg, onLoadComplete) {
        var _this = this;
        this.mUrl = value;
        var key = this.resKey;
        this.mIcon.load(this.render.url.getOsdRes(this.mUrl), function () {
            if (_this.mCallBack)
                _this.mCallBack();
        });
        // if (!this.mScene.cache.obj.has(key)) {
        //     this.mScene.load.image(key, Url.getOsdRes(this.mUrl));
        //     this.mScene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
        //     this.mScene.load.start();
        // } else {
        //     this.onLoadCompleteHandler();
        // }
        this.mCallBack = onLoadComplete;
    };
    DragDropIcon.prototype.dragStart = function () {
    };
    DragDropIcon.prototype.dragStop = function (acceptDrag) {
    };
    DragDropIcon.prototype.dragDrop = function (dragable) {
    };
    DragDropIcon.prototype.dragOver = function (dragable) {
    };
    DragDropIcon.prototype.getDragData = function () {
    };
    DragDropIcon.prototype.getDropData = function () {
    };
    DragDropIcon.prototype.getDragImage = function () {
        return this.mIcon;
    };
    DragDropIcon.prototype.getVisualDisplay = function () {
        return undefined;
    };
    DragDropIcon.prototype.getBound = function () {
        var bound = this.getBounds();
        return new Phaser.Geom.Rectangle(bound.x, bound.y, bound.width, bound.height);
    };
    Object.defineProperty(DragDropIcon.prototype, "resKey", {
        get: function () {
            if (this.mUrl === undefined)
                return "";
            var key = this.render.url.getOsdRes((this.mUrl)); // Load.Image.getKey(this.mUrl);
            return key;
        },
        enumerable: true,
        configurable: true
    });
    DragDropIcon.prototype.destroy = function () {
        this.mCallBack = null;
        _super.prototype.destroy.call(this, true);
    };
    Object.defineProperty(DragDropIcon.prototype, "icon", {
        get: function () {
            return this.mIcon;
        },
        enumerable: true,
        configurable: true
    });
    DragDropIcon.prototype.setDragType = function (value) {
        this.mDragType = value;
    };
    DragDropIcon.prototype.setDropType = function (value) {
        this.mDropType = value;
    };
    DragDropIcon.prototype.getDropType = function () {
        return this.mDropType;
    };
    DragDropIcon.prototype.getDragType = function () {
        return this.mDragType;
    };
    return DragDropIcon;
}(Phaser.GameObjects.Container));
export { DragDropIcon };
//# sourceMappingURL=dragDropIcon.js.map