import "tooqinggamephaser";
import "dragonBones";
import { IEditorCanvasConfig } from "./canvas/editor.canvas";
import { ElementEditorCanvas } from "./canvas/element/element.editor.canvas";
import { AvatarEditorCanvas } from "./canvas/avatar/avatar.editor.canvas";
import { SceneEditorCanvas } from "./canvas/scene/scene.editor.canvas";
export declare enum EditorCanvasType {
    Element = 0,
    Avatar = 1,
    Scene = 2
}
export declare class EditorLauncher {
    static CreateCanvas(type: EditorCanvasType, config: IEditorCanvasConfig): SceneEditorCanvas | ElementEditorCanvas | AvatarEditorCanvas;
}
