import { Logger } from "structure";
var EditorModeDebugger = /** @class */ (function () {
    function EditorModeDebugger(render) {
        this.render = render;
        this.isDebug = false;
        EditorModeDebugger._instance = this;
    }
    EditorModeDebugger.getInstance = function () {
        if (!EditorModeDebugger._instance) {
            Logger.getInstance().error("SortDebugger not created");
        }
        return EditorModeDebugger._instance;
    };
    // export
    EditorModeDebugger.prototype.getIsDebug = function () {
        return this.isDebug;
    };
    EditorModeDebugger.prototype.q = function () {
        if (this.isDebug) {
            this.render.mainPeer.elementsHideReferenceArea();
        }
        this.isDebug = false;
    };
    EditorModeDebugger.prototype.v = function () {
        if (!this.isDebug) {
            this.render.mainPeer.elementsShowReferenceArea();
        }
        this.isDebug = true;
    };
    return EditorModeDebugger;
}());
export { EditorModeDebugger };
//# sourceMappingURL=editor.mode.debugger.js.map