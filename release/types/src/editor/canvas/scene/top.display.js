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
import { TopDisplay } from "baseRender";
var EditorTopDisplay = /** @class */ (function (_super) {
    __extends_1(EditorTopDisplay, _super);
    function EditorTopDisplay(scene, owner, dpr) {
        return _super.call(this, scene, owner, dpr, 1) || this;
    }
    EditorTopDisplay.prototype.addToSceneUI = function (obj) {
        if (!this.mOwner || !obj) {
            return;
        }
        this.scene.layerManager.addToLayer("sceneUILayer", obj);
    };
    return EditorTopDisplay;
}(TopDisplay));
export { EditorTopDisplay };
//# sourceMappingURL=top.display.js.map