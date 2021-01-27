import { EditorFramesDisplay } from "./editor.frames.display";
import { SceneEditorCanvas } from "./scene.editor.canvas";
import { op_def } from "pixelpai_proto";
import { ReferenceArea } from "baseRender";
import { Sprite } from "baseModel";

export class EditorElementDisplay extends EditorFramesDisplay {
    constructor(sceneEditor: SceneEditorCanvas, sprite: Sprite) {
        super(sceneEditor, sprite);
    }

    selected() {
        super.selected();
        if (this.mNodeType === op_def.NodeType.ElementNodeType) {
            this.elementManager.removeFromMap(this.sprite);
        }
        this.showRefernceArea();
    }

    unselected() {
        super.unselected();
        this.hideRefernceArea();
        // TODO 添加Element Display区分类型
        if (this.mNodeType === op_def.NodeType.ElementNodeType) {
            this.elementManager.addToMap(this.sprite);
        }
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
        const elementManager = this.elementManager;
        elementManager.removeFromMap(sprite);
        this.sprite = sprite;
        elementManager.addToMap(sprite);
    }

    updateSprite(sprite: Sprite) {
        const elementManager = this.elementManager;
        elementManager.removeFromMap(this.sprite);
        super.updateSprite(sprite);
        elementManager.addToMap(this.sprite);
    }

    destroy() {
        const elementManager = this.elementManager;
        elementManager.removeFromMap(this.sprite);
        super.destroy();
    }
}
