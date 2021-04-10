import { BaseCamerasManager } from "baseRender";
import { SceneEditorCanvas } from "../scene.editor.canvas";
export declare class EditorCamerasManager extends BaseCamerasManager {
    private sceneEditor;
    private connection;
    constructor(sceneEditor: SceneEditorCanvas);
    centerCamera(): void;
    syncCameraScroll(): void;
}
