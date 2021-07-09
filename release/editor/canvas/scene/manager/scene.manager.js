import { SkyBoxScene, BaseSceneManager } from "baseRender";
export class EditorSceneManger extends BaseSceneManager {
  constructor(render) {
    super(render);
  }
  initScene() {
    this.sceneClass = {
      "SkyBoxScene": SkyBoxScene
    };
  }
}
