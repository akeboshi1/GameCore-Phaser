import "tooqingphaser";
import "dragonBones";
import { ElementEditorCanvas, AvatarEditorCanvas, SceneEditorCanvas } from "../editor/canvas";
/*
编辑器画布生成器 用于生成编辑器专用的画布 和游戏用的launcher分开

使用方法(以ElementEditorCanvas为例)：
const canvas = EditorLauncher.createCanvas(EditorCanvasType.Element, {width:xx, height:xx, parent:xx});
canvas.start(data);
...
canvas.destroy();
*/
export var EditorCanvasType;
(function (EditorCanvasType) {
    EditorCanvasType[EditorCanvasType["Element"] = 0] = "Element";
    EditorCanvasType[EditorCanvasType["Avatar"] = 1] = "Avatar";
    EditorCanvasType[EditorCanvasType["Scene"] = 2] = "Scene";
})(EditorCanvasType || (EditorCanvasType = {}));
var EditorLauncher = /** @class */ (function () {
    function EditorLauncher() {
    }
    // public static CreateCanvas<T extends EditorCanvas>(type: string, config: IEditorCanvasConfig): T {
    //     var canvas = Object.create(window[type].prototype);
    //     canvas.constructor.apply(canvas, config);
    //     return canvas as T;
    // }
    EditorLauncher.CreateCanvas = function (type, config) {
        switch (type) {
            case EditorCanvasType.Element:
                return new ElementEditorCanvas(config);
            case EditorCanvasType.Avatar:
                return new AvatarEditorCanvas(config);
            case EditorCanvasType.Scene:
                return new SceneEditorCanvas(config);
        }
    };
    return EditorLauncher;
}());
export { EditorLauncher };
//# sourceMappingURL=editor.launcher.js.map