import "tooqingphaser";
import "dragonbones-runtime";
import { IEditorCanvasConfig, ElementEditorCanvas, AvatarEditorCanvas, SceneEditorCanvas } from "../editor/canvas";
export declare enum EditorCanvasType {
    Element = 0,
    Avatar = 1,
    Scene = 2
}
export declare class EditorLauncher {
    static CreateCanvas(type: EditorCanvasType, config: IEditorCanvasConfig): ElementEditorCanvas | AvatarEditorCanvas | SceneEditorCanvas;
}
