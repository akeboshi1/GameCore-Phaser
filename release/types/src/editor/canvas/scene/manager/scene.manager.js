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
import { SkyBoxScene, BaseSceneManager } from "baseRender";
var EditorSceneManger = /** @class */ (function (_super) {
    __extends_1(EditorSceneManger, _super);
    function EditorSceneManger(render) {
        return _super.call(this, render) || this;
    }
    EditorSceneManger.prototype.initScene = function () {
        this.sceneClass = {
            "SkyBoxScene": SkyBoxScene,
        };
    };
    return EditorSceneManger;
}(BaseSceneManager));
export { EditorSceneManger };
//# sourceMappingURL=scene.manager.js.map