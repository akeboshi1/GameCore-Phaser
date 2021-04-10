import { BaseSceneManager } from "baseRender";
import { SceneEditorCanvas } from "../scene.editor.canvas";
export declare class EditorSceneManger extends BaseSceneManager {
    constructor(render: SceneEditorCanvas);
    protected initScene(): void;
}
