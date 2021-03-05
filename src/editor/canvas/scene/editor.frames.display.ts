import { Sprite } from "baseModel";
import { BaseDragonbonesDisplay, BaseFramesDisplay, ReferenceArea } from "baseRender";
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
    protected mLayer: number;

    constructor(protected sceneEditor: SceneEditorCanvas, sprite: Sprite) {
        super(sceneEditor.scene, sprite.id, sprite.nodeType);
        this.mLayer = sprite.layer;
    }

    mount(display: BaseFramesDisplay | BaseDragonbonesDisplay, targetIndex?: number) {
        if (!this.mCurAnimation) {
            return;
        }
        // const rootMount: BaseFramesDisplay = <BaseFramesDisplay>display.rootMount;
        // if (rootMount) {
        //     if (rootMount === this) {
        //         return;
        //     } else {
        //         rootMount.unmount(display);
        //     }
        // }
        if (targetIndex === undefined) {
            targetIndex = this.mMountList.length;
            this.mCurAnimation.createMountPoint(targetIndex);
        }
        super.mount(display, targetIndex);
    }

    unmount(display: BaseFramesDisplay | BaseDragonbonesDisplay) {
        if (!this.mMountContainer) {
            return;
        }
        super.unmount(display);
        // (<any>this.sceneEditor.scene).layerManager.addToLayer(this.mLayer.toString(), display);
    }

    asociate() {
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
        this.asociate();
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
        const sprite = this.sprite.toSprite();
        const mountIds = this.getMountIds();
        sprite.mountSprites = mountIds;
        return sprite;
    }

    clear() {
        for (const display of this.mMountList) {
            this.unmount(<BaseFramesDisplay>display);
        }
        this.mAnimation = null;
        this.mCurAnimation = null;
        this.mPreAnimation = null;
        this.clearDisplay();
        this.mDisplayDatas.clear();
        this.mSprites.forEach((display) => display.destroy());
        this.mSprites.clear();
        this.mMountContainer = null;
        // this.mRootMount = null;
    }

    getMountIds() {
        const result = [];
        if (this.mMountList) {
            for (const mount of this.mMountList) {
                const id = (<BaseFramesDisplay>mount).id;
                if (id) result.push(id);
            }
        }
        return result;
    }

    updateMountPoint(ele: EditorFramesDisplay, x: number, y: number) {
        const index = this.mMountList.indexOf(ele);
        if (index > -1) {
            this.mCurAnimation.updateMountPoint(index, x, y);
            const mount = this.mCurAnimation.mountLayer;
            if (mount) {
                const pos = mount.mountPoint;
                if (index < 0 || index >= pos.length) {
                    return;
                }

                ele.setPosition(pos[index].x, pos[index].y);
            }
        }
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
