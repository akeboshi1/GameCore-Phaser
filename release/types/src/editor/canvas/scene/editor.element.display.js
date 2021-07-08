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
import { EditorFramesDisplay } from "./editor.frames.display";
import { ReferenceArea } from "baseRender";
var EditorElementDisplay = /** @class */ (function (_super) {
    __extends_1(EditorElementDisplay, _super);
    function EditorElementDisplay(sceneEditor, config, sprite) {
        return _super.call(this, sceneEditor, config, sprite) || this;
    }
    EditorElementDisplay.prototype.selected = function () {
        _super.prototype.selected.call(this);
        if (!this.rootMount)
            this.removeFromMap();
        this.showRefernceArea();
    };
    EditorElementDisplay.prototype.unselected = function () {
        _super.prototype.unselected.call(this);
        this.hideRefernceArea();
        if (!this.rootMount)
            this.addToMap();
    };
    EditorElementDisplay.prototype.showRefernceArea = function () {
        if (!this.mReferenceArea) {
            this.mReferenceArea = new ReferenceArea(this.scene);
        }
        if (!this.mCurAnimation) {
            return;
        }
        var area = this.getCollisionArea();
        var origin = this.getOriginPoint();
        var _a = this.sceneEditor.miniRoomSize, tileWidth = _a.tileWidth, tileHeight = _a.tileHeight;
        this.mReferenceArea.draw(area, origin, tileWidth, tileHeight);
        this.addAt(this.mReferenceArea, 0);
    };
    EditorElementDisplay.prototype.setSprite = function (sprite) {
        this.removeFromMap();
        this.sprite = sprite;
        this.defaultLayer();
        this.addToMap();
    };
    EditorElementDisplay.prototype.asociate = function () {
        var mounts = this.sprite.mountSprites;
        if (mounts && mounts.length > 0) {
            for (var i = 0; i < mounts.length; i++) {
                var ele = this.sceneEditor.displayObjectPool.get(mounts[i].toString());
                if (ele) {
                    this.mount(ele, i);
                }
            }
        }
    };
    EditorElementDisplay.prototype.displayCreated = function () {
        _super.prototype.displayCreated.call(this);
        this.asociate();
    };
    EditorElementDisplay.prototype.destroy = function () {
        this.removeFromMap();
        _super.prototype.destroy.call(this);
    };
    EditorElementDisplay.prototype.addToMap = function () {
        var elementManager = this.elementManager;
        this.overlapped = elementManager.addToMap(this.sprite);
    };
    EditorElementDisplay.prototype.removeFromMap = function () {
        var elementManager = this.elementManager;
        this.overlapped = elementManager.removeFromMap(this.sprite);
    };
    return EditorElementDisplay;
}(EditorFramesDisplay));
export { EditorElementDisplay };
//# sourceMappingURL=editor.element.display.js.map