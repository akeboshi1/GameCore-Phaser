import { Sprite } from "baseModel";
import { BaseFramesDisplay, ReferenceArea } from "baseRender";
import { IFramesModel, RunningAnimation } from "structure";
import { Helpers, LogicPoint, Position45 } from "utils";
import { SceneEditorCanvas } from "./scene.editor.canvas";
import { EditorTopDisplay } from "./top.display";

export class EditorFramesDisplay extends BaseFramesDisplay {

    public sprite: Sprite;
    protected mReferenceArea: ReferenceArea;
    protected mTopDisplay: EditorTopDisplay;
    protected mIsMoss: boolean = false;

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
        const area = this.getCollisionArea();
        const origin = this.getOriginPoint();
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

    updateSprite(sprite: Sprite) {
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
        const width = cols * miniSize.tileWidth / Math.sqrt(2);
        const height = rows * miniSize.tileHeight / Math.sqrt(2);
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

    private get topDisplay() {
        if (!this.mTopDisplay) {
            this.mTopDisplay = new EditorTopDisplay(this.scene, this, 1);
        }
        return this.mTopDisplay;
    }

    set isMoss(val: boolean) {
        this.mIsMoss = val;
    }

    get isMoss() {
        return this.mIsMoss;
    }
}
