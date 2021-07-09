import { EditorFramesDisplay } from "./editor.frames.display";
import { ReferenceArea } from "baseRender";
export class EditorElementDisplay extends EditorFramesDisplay {
  constructor(sceneEditor, config, sprite) {
    super(sceneEditor, config, sprite);
  }
  selected() {
    super.selected();
    if (!this.rootMount)
      this.removeFromMap();
    this.showRefernceArea();
  }
  unselected() {
    super.unselected();
    this.hideRefernceArea();
    if (!this.rootMount)
      this.addToMap();
  }
  showRefernceArea() {
    if (!this.mReferenceArea) {
      this.mReferenceArea = new ReferenceArea(this.scene);
    }
    if (!this.mCurAnimation) {
      return;
    }
    const area = this.getCollisionArea();
    const origin = this.getOriginPoint();
    const { tileWidth, tileHeight } = this.sceneEditor.miniRoomSize;
    this.mReferenceArea.draw(area, origin, tileWidth, tileHeight);
    this.addAt(this.mReferenceArea, 0);
  }
  setSprite(sprite) {
    this.removeFromMap();
    this.sprite = sprite;
    this.defaultLayer();
    this.addToMap();
  }
  asociate() {
    const mounts = this.sprite.mountSprites;
    if (mounts && mounts.length > 0) {
      for (let i = 0; i < mounts.length; i++) {
        const ele = this.sceneEditor.displayObjectPool.get(mounts[i].toString());
        if (ele) {
          this.mount(ele, i);
        }
      }
    }
  }
  displayCreated() {
    super.displayCreated();
    this.asociate();
  }
  destroy() {
    this.removeFromMap();
    super.destroy();
  }
  addToMap() {
    const elementManager = this.elementManager;
    this.overlapped = elementManager.addToMap(this.sprite);
  }
  removeFromMap() {
    const elementManager = this.elementManager;
    this.overlapped = elementManager.removeFromMap(this.sprite);
  }
}
