import { EditorFramesDisplay } from "./editor.frames.display";
import { SceneEditorCanvas } from "./scene.editor.canvas";
import { ReferenceArea } from "baseRender";
import { Sprite } from "baseGame";
import { IEditorCanvasConfig } from "../editor.canvas";

export class EditorElementDisplay extends EditorFramesDisplay {
    constructor(sceneEditor: SceneEditorCanvas, config: IEditorCanvasConfig, sprite: Sprite) {
        super(sceneEditor, config, sprite);
    }

    selected() {
        super.selected();
        if (!this.rootMount) this.removeFromMap();
        this.showRefernceArea();
    }

    unselected() {
        super.unselected();
        this.hideRefernceArea();
        if (!this.rootMount) this.addToMap();
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
        if (!area || !origin) return;
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

    protected addToMap() {
        const elementManager = this.elementManager;
        this.overlapped = elementManager.addToMap(this.sprite);
    }

    protected removeFromMap() {
        const elementManager = this.elementManager;
        this.overlapped = elementManager.removeFromMap(this.sprite);
    }
}
