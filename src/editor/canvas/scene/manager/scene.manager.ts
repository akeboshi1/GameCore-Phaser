import { SkyBoxScene } from "baseRender";
import { BaseSceneManager } from "baseRender";
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
