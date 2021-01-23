import { BaseFramesDisplay } from "base";
import { ReferenceArea, RunningAnimation } from "structure";
import { LogicPoint, Position45 } from "utils";
import { SceneEditorCanvas } from "./scene.editor.canvas";
import { EditorTopDisplay } from "./top.display";

export class EditorFramesDisplay extends BaseFramesDisplay {
    protected mReferenceArea: ReferenceArea;
    protected mTopDisplay: EditorTopDisplay;

    constructor(scene: Phaser.Scene, id: number, nodeType: number, private sceneEditor: SceneEditorCanvas) {
        super(scene, id, nodeType);
    }

    selected() {
        this.showRefernceArea();
        this.showNickname();
    }

    unselected() {
        this.hideRefernceArea();
        this.hideNickname();
    }

    showRefernceArea() {
        if (!this.mReferenceArea) {
            this.mReferenceArea = new ReferenceArea(this.scene);
        }
        if (!this.mCurAnimation) {
            return;
        }
        const area = this.mCurAnimation.collisionArea;
        const origin = this.mCurAnimation.originPoint;
        const { tileWidth, tileHeight } = this.sceneEditor.miniRoomSize;
        this.mReferenceArea.draw(area, origin, tileWidth, tileHeight);
        this.addAt(this.mReferenceArea, 0);
    }

    hideRefernceArea() {
        if (this.mReferenceArea) {
            this.mReferenceArea.destroy();
            this.mReferenceArea = undefined;
        }
    }

    showNickname() {
        this.topDisplay.showNickname(this.name);
    }

    hideNickname() {
        this.mTopDisplay.hideNickname();
    }

    setPosition(x?: number, y?: number, z?: number, w?: number) {
        super.setPosition(x, y, z, w);
        if (this.mTopDisplay) {
            this.mTopDisplay.update();
        }
        return this;
    }

    public play(val: RunningAnimation) {
        super.play(val);
        this.fetchProjection();
    }

    protected fetchProjection() {
        if (!this.mCurAnimation) {
            return;
        }
        const miniSize = this.sceneEditor.miniRoomSize;
        const collision = this.mCurAnimation.collisionArea;
        const origin = this.mCurAnimation.originPoint;
        if (!collision) return;
        const rows = collision.length;
        const cols = collision[0].length;
        const width = cols * miniSize.tileWidth / Math.sqrt(2);
        const height = rows * miniSize.tileHeight / Math.sqrt(2);
        const offset = Position45.transformTo90(new LogicPoint(origin.x, origin.y), miniSize);
        this.mProjectionSize = { offset, width, height };
        this.updateSort();
    }

    private get topDisplay() {
        if (!this.mTopDisplay) {
            this.mTopDisplay = new EditorTopDisplay(this.scene, this, 1);
        }
        return this.mTopDisplay;
    }
}
