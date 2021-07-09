import "tooqingphaser";
import { ElementEditorCanvas, AvatarEditorCanvas, SceneEditorCanvas } from "../editor/canvas";
export var EditorCanvasType;
(function(EditorCanvasType2) {
  EditorCanvasType2[EditorCanvasType2["Element"] = 0] = "Element";
  EditorCanvasType2[EditorCanvasType2["Avatar"] = 1] = "Avatar";
  EditorCanvasType2[EditorCanvasType2["Scene"] = 2] = "Scene";
})(EditorCanvasType || (EditorCanvasType = {}));
export class EditorLauncher {
  static CreateCanvas(type, config) {
    switch (type) {
      case 0:
        return new ElementEditorCanvas(config);
      case 1:
        return new AvatarEditorCanvas(config);
      case 2:
        return new SceneEditorCanvas(config);
    }
  }
}
