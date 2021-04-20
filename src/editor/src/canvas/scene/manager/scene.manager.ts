import { SkyBoxScene, BaseSceneManager } from "baserender";
import { SceneEditorCanvas } from "../scene.editor.canvas";

export class EditorSceneManger extends BaseSceneManager {
    constructor(render: SceneEditorCanvas) {
        super(render);
    }

    protected initScene() {
        this.sceneClass = {
            "SkyBoxScene": SkyBoxScene,
        };
    }
}
