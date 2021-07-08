var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { BaseFramesDisplay } from "baseRender";
import { Logger, LogicPoint, Position45 } from "structure";
import { EditorTopDisplay } from "./top.display";
import { op_def } from "pixelpai_proto";
import { LayerEnum, Helpers } from "game-capsule";
var EditorFramesDisplay = /** @class */ (function (_super) {
    __extends_1(EditorFramesDisplay, _super);
    function EditorFramesDisplay(sceneEditor, config, sprite) {
        var _this = _super.call(this, sceneEditor.scene, { resPath: config.LOCAL_HOME_PATH, osdPath: config.osd }, sprite.id, sprite.nodeType) || this;
        _this.sceneEditor = sceneEditor;
        _this.mIsMoss = false;
        _this.mOverlapped = false;
        _this.sprite = sprite;
        _this.mLayer = sprite.layer;
        return _this;
    }
    EditorFramesDisplay.prototype.mount = function (display, targetIndex) {
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
            var i = 0;
            while (this.mMountList.get(i)) {
                i++;
                // 理应为互动点数上限
                if (i === 10) {
                    Logger.getInstance().error("mount index is out of control");
                    return;
                }
            }
            targetIndex = i;
            this.mCurAnimation.createMountPoint(targetIndex);
        }
        _super.prototype.mount.call(this, display, targetIndex);
    };
    EditorFramesDisplay.prototype.unmount = function (display) {
        if (!this.mMountContainer) {
            return;
        }
        _super.prototype.unmount.call(this, display);
        // (<any>this.sceneEditor.scene).layerManager.addToLayer(this.mLayer.toString(), display);
    };
    EditorFramesDisplay.prototype.asociate = function () {
    };
    EditorFramesDisplay.prototype.selected = function () {
        this.showNickname();
    };
    EditorFramesDisplay.prototype.unselected = function () {
        this.hideNickname();
    };
    EditorFramesDisplay.prototype.showRefernceArea = function () {
    };
    EditorFramesDisplay.prototype.hideRefernceArea = function () {
        if (this.mReferenceArea) {
            this.mReferenceArea.destroy();
            this.mReferenceArea = undefined;
        }
    };
    EditorFramesDisplay.prototype.showNickname = function () {
        this.topDisplay.showNickname(this.name);
    };
    EditorFramesDisplay.prototype.hideNickname = function () {
        this.mTopDisplay.hideNickname();
    };
    EditorFramesDisplay.prototype.setPosition = function (x, y, z, w) {
        _super.prototype.setPosition.call(this, x, y, z, w);
        if (this.mTopDisplay) {
            this.mTopDisplay.update();
        }
        return this;
    };
    EditorFramesDisplay.prototype.updateSprite = function (sprite) {
        this.setSprite(sprite);
        var displayInfo = sprite.displayInfo;
        if (displayInfo) {
            this.load(displayInfo);
        }
        var pos = sprite.pos;
        if (pos) {
            this.setPosition(pos.x, pos.y, pos.z);
        }
        this.name = sprite.nickname;
        this.play(sprite.currentAnimation);
        this.asociate();
    };
    EditorFramesDisplay.prototype.setSprite = function (sprite) {
        this.sprite = sprite;
        this.defaultLayer();
    };
    EditorFramesDisplay.prototype.setDirection = function (dir) {
        if (dir === this.direction)
            return;
        // this.mDisplayInfo.avatarDir = dir;
        this.direction = dir;
        if (this.sprite) {
            this.sprite.setDirection(dir);
            this.play(this.sprite.currentAnimation);
        }
    };
    /**
     * TODO sprite仅用于和编辑器通信，后期会删除
     * @deprecated
     */
    EditorFramesDisplay.prototype.toSprite = function () {
        if (!this.sprite) {
            return;
        }
        var pos = this.sprite.pos;
        pos.x = this.x;
        pos.y = this.y;
        pos.z = this.z;
        var sprite = this.sprite.toSprite();
        var mountIds = this.getMountIds();
        sprite.mountSprites = mountIds;
        return sprite;
    };
    EditorFramesDisplay.prototype.clear = function () {
        var _this = this;
        this.mMountList.forEach(function (val, key) {
            _this.unmount(val);
        });
        this.mAnimation = null;
        this.mCurAnimation = null;
        this.mPreAnimation = null;
        this.clearDisplay();
        this.mDisplayDatas.clear();
        this.mSprites.forEach(function (display) { return display.destroy(); });
        this.mSprites.clear();
        this.mMountContainer = null;
        // this.mRootMount = null;
    };
    EditorFramesDisplay.prototype.getMountIds = function () {
        var result = [];
        if (this.mMountList) {
            this.mMountList.forEach(function (val, key) {
                var id = val.id;
                if (id)
                    result.push(id);
            });
        }
        return result;
    };
    EditorFramesDisplay.prototype.updateMountPoint = function (ele, x, y) {
        var index = -1;
        this.mMountList.forEach(function (val, key) {
            if (val === ele) {
                index = key;
            }
        });
        if (index > -1) {
            this.mCurAnimation.updateMountPoint(index, x, y);
            var mount = this.mCurAnimation.mountLayer;
            if (mount) {
                var pos = mount.mountPoint;
                if (index < 0 || index >= pos.length) {
                    return;
                }
                ele.setPosition(pos[index].x, pos[index].y);
            }
        }
    };
    EditorFramesDisplay.prototype.play = function (val) {
        _super.prototype.play.call(this, val);
        this.fetchProjection();
        if (this.mReferenceArea) {
            this.showRefernceArea();
        }
    };
    EditorFramesDisplay.prototype.fetchProjection = function () {
        if (!this.mCurAnimation) {
            return;
        }
        var miniSize = this.sceneEditor.miniRoomSize;
        var collision = this.getCollisionArea();
        var origin = this.getOriginPoint();
        if (!collision)
            return;
        var rows = collision.length;
        var cols = collision[0].length;
        var width = cols;
        var height = rows;
        var offset = Position45.transformTo90(new LogicPoint(origin.x, origin.y), miniSize);
        this.mProjectionSize = { offset: offset, width: width, height: height };
        this.updateSort();
    };
    EditorFramesDisplay.prototype.getCollisionArea = function () {
        if (!this.mCurAnimation) {
            return;
        }
        var collision = this.mCurAnimation.collisionArea;
        if (this.mAnimation.flip) {
            collision = Helpers.flipArray(collision);
        }
        return collision;
    };
    EditorFramesDisplay.prototype.getOriginPoint = function () {
        if (!this.mCurAnimation) {
            return;
        }
        var originPoint = this.mCurAnimation.originPoint;
        if (this.mAnimation.flip) {
            return new LogicPoint(originPoint.y, originPoint.x);
        }
        return originPoint;
    };
    Object.defineProperty(EditorFramesDisplay.prototype, "topDisplay", {
        get: function () {
            if (!this.mTopDisplay) {
                this.mTopDisplay = new EditorTopDisplay(this.scene, this, 1);
            }
            return this.mTopDisplay;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EditorFramesDisplay.prototype, "elementManager", {
        get: function () {
            return this.sceneEditor.elementManager;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 兼容没有Layer的情况
     * @deprecated
     */
    EditorFramesDisplay.prototype.defaultLayer = function () {
        if (!this.sprite.layer) {
            if (this.nodeType === op_def.NodeType.TerrainNodeType) {
                this.sprite.layer = LayerEnum.Terrain;
            }
            else {
                this.sprite.layer = LayerEnum.Surface;
            }
        }
    };
    Object.defineProperty(EditorFramesDisplay.prototype, "isMoss", {
        get: function () {
            return this.mIsMoss;
        },
        set: function (val) {
            this.mIsMoss = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EditorFramesDisplay.prototype, "overlapped", {
        set: function (val) {
            if (this.mOverlapped === val) {
                return;
            }
            this.mOverlapped = val;
            if (val) {
                this.showRefernceArea();
            }
            else {
                this.hideRefernceArea();
            }
        },
        enumerable: true,
        configurable: true
    });
    return EditorFramesDisplay;
}(BaseFramesDisplay));
export { EditorFramesDisplay };
//# sourceMappingURL=editor.frames.display.js.map