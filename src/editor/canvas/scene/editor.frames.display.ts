import { Sprite } from "baseModel";
import { BaseFramesDisplay, ReferenceArea } from "baseRender";
import { IFramesModel, RunningAnimation } from "structure";
import { Helpers, Logger, LogicPoint, Position45 } from "utils";
import { SceneEditorCanvas } from "./scene.editor.canvas";
import { EditorTopDisplay } from "./top.display";
import { op_def } from "pixelpai_proto";
import { LayerEnum } from "game-capsule";

export class EditorFramesDisplay extends BaseFramesDisplay {

    public sprite: Sprite;
    protected mReferenceArea: ReferenceArea;
    protected mTopDisplay: EditorTopDisplay;
    protected mIsMoss: boolean = false;
    protected mOverlapped: boolean = false;

    constructor(protected sceneEditor: SceneEditorCanvas, sprite: Sprite) {
        super(sceneEditor.scene, sprite.id, sprite.nodeType);
    }

    selected() {
        this.showNickname();
    }

    unselected() {
        this.hideNickname();
    }

    showRefernceArea() {
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

    updateSprite(sprite: Sprite) {
        this.setSprite(sprite);
        const displayInfo = sprite.displayInfo;
        if (displayInfo) {
            this.load(<IFramesModel>displayInfo);
        }
        const pos = sprite.pos;
        if (pos) {
            this.setPosition(pos.x, pos.y, pos.z);
        }
        this.name = sprite.nickname;
        this.play(sprite.currentAnimation);
    }

    setSprite(sprite: Sprite) {
        this.sprite = sprite;
        this.defaultLayer();
    }

    /**
     * TODO sprite仅用于和编辑器通信，后期会删除
     * @deprecated
     */
    toSprite() {
        if (!this.sprite) {
            return;
        }
        const pos = this.sprite.pos;
        pos.x = this.x;
        pos.y = this.y;
        pos.z = this.z;
        return this.sprite.toSprite();
    }

    public play(val: RunningAnimation) {
        super.play(val);
        this.fetchProjection();
        if (this.mReferenceArea) {
            this.showRefernceArea();
        }
    }

    protected fetchProjection() {
        if (!this.mCurAnimation) {
            return;
        }

        const miniSize = this.sceneEditor.miniRoomSize;
        const collision = this.getCollisionArea();
        const origin = this.getOriginPoint();
        if (!collision) return;
        const rows = collision.length;
        const cols = collision[0].length;
        const width = cols;
        const height = rows;
        const offset = Position45.transformTo90(new LogicPoint(origin.x, origin.y), miniSize);
        this.mProjectionSize = { offset, width, height };
        this.updateSort();
    }

    protected getCollisionArea() {
        if (!this.mCurAnimation) {
            return;
        }
        let collision = this.mCurAnimation.collisionArea;
        if (this.mAnimation.flip) {
            collision = Helpers.flipArray(collision);
        }
        return collision;
    }

    protected getOriginPoint() {
        if (!this.mCurAnimation) {
            return;
        }
        const originPoint = this.mCurAnimation.originPoint;
        if (this.mAnimation.flip) {
            return new LogicPoint(originPoint.y, originPoint.x);
        }
        return originPoint;
    }

    protected get topDisplay() {
        if (!this.mTopDisplay) {
            this.mTopDisplay = new EditorTopDisplay(this.scene, this, 1);
        }
        return this.mTopDisplay;
    }

    protected get elementManager() {
        return this.sceneEditor.elementManager;
    }

    /**
     * 兼容没有Layer的情况
     * @deprecated
     */
    protected defaultLayer() {
        if (!this.sprite.layer) {
            if (this.nodeType === op_def.NodeType.TerrainNodeType) {
                this.sprite.layer = LayerEnum.Terrain;
            } else {
                this.sprite.layer = LayerEnum.Surface;
            }
        }
    }

    set isMoss(val: boolean) {
        this.mIsMoss = val;
    }

    get isMoss() {
        return this.mIsMoss;
    }

    set overlapped(val: boolean) {
        if (this.mOverlapped === val) {
            return;
        }
        this.mOverlapped = val;
        if (val) {
            this.showRefernceArea();
        } else {
            this.hideRefernceArea();
        }
    }
}
