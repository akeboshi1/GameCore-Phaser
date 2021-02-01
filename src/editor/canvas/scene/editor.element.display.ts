import { EditorFramesDisplay } from "./editor.frames.display";
import { SceneEditorCanvas } from "./scene.editor.canvas";
import { ReferenceArea } from "baseRender";
import { Sprite } from "baseModel";

export class EditorElementDisplay extends EditorFramesDisplay {
    constructor(sceneEditor: SceneEditorCanvas, sprite: Sprite) {
        super(sceneEditor, sprite);
    }

    selected() {
        super.selected();
        this.removeFromMap();
        this.showRefernceArea();
    }

    unselected() {
        super.unselected();
        this.hideRefernceArea();
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

    setSprite(sprite: Sprite) {
        this.removeFromMap();
        this.sprite = sprite;
        this.defaultLayer();
        this.addToMap();
    }

    destroy() {
        this.removeFromMap();
        super.destroy();
    }

    protected addToMap() {
        const elementManager = this.elementManager;
        this.overlapped = elementManager.addToMap(this.sprite);
    }

    protected removeFromMap() {
        const elementManager = this.elementManager;
        this.overlapped = elementManager.removeFromMap(this.sprite);
    }
}
