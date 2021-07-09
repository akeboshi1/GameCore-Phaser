import { TopDisplay } from "baseRender";
export class EditorTopDisplay extends TopDisplay {
  constructor(scene, owner, dpr) {
    super(scene, owner, dpr, 1);
  }
  addToSceneUI(obj) {
    if (!this.mOwner || !obj) {
      return;
    }
    this.scene.layerManager.addToLayer("sceneUILayer", obj);
  }
}
