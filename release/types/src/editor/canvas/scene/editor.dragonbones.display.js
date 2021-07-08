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
import { BaseDragonbonesDisplay } from "baseRender";
import { LayerEnum } from "game-capsule";
import { EditorTopDisplay } from "./top.display";
var EditorDragonbonesDisplay = /** @class */ (function (_super) {
    __extends_1(EditorDragonbonesDisplay, _super);
    function EditorDragonbonesDisplay(scene, config, sprite) {
        var _this = _super.call(this, scene, { resPath: config.LOCAL_HOME_PATH, osdPath: config.osd }, sprite.id) || this;
        _this.setSprite(sprite);
        _this.mNodeType = sprite.nodeType;
        return _this;
    }
    EditorDragonbonesDisplay.prototype.asociate = function () {
    };
    EditorDragonbonesDisplay.prototype.selected = function () {
        this.showNickname();
    };
    EditorDragonbonesDisplay.prototype.unselected = function () {
        this.hideNickname();
    };
    EditorDragonbonesDisplay.prototype.showRefernceArea = function () {
    };
    EditorDragonbonesDisplay.prototype.hideRefernceArea = function () {
        if (this.mReferenceArea) {
            this.mReferenceArea.destroy();
            this.mReferenceArea = undefined;
        }
    };
    EditorDragonbonesDisplay.prototype.showNickname = function () {
        this.topDisplay.showNickname(this.name);
    };
    EditorDragonbonesDisplay.prototype.hideNickname = function () {
        this.mTopDisplay.hideNickname();
    };
    EditorDragonbonesDisplay.prototype.setPosition = function (x, y, z, w) {
        _super.prototype.setPosition.call(this, x, y, z, w);
        if (this.mTopDisplay) {
            this.mTopDisplay.update();
        }
        return this;
    };
    EditorDragonbonesDisplay.prototype.updateSprite = function (sprite) {
        this.setSprite(sprite);
        var displayInfo = sprite.displayInfo;
        if (displayInfo) {
            this.load(displayInfo, undefined, false);
        }
        var pos = sprite.pos;
        if (pos) {
            this.setPosition(pos.x, pos.y, pos.z);
        }
        this.name = sprite.nickname;
        this.play(sprite.currentAnimation);
        this.asociate();
    };
    EditorDragonbonesDisplay.prototype.setSprite = function (sprite) {
        this.sprite = sprite;
        if (!sprite.currentAnimationName) {
            sprite.setAnimationName("idle");
        }
        this.defaultLayer();
    };
    EditorDragonbonesDisplay.prototype.clear = function () {
        var _this = this;
        this.mMountList.forEach(function (val, key) {
            _this.unmount(val);
        });
    };
    EditorDragonbonesDisplay.prototype.getMountIds = function () {
        // const result = [];
        // if (this.mMountList) {
        //     this.mMountList.forEach((val, key) => {
        //         const id = (<BaseDragonbonesDisplay> val).id;
        //         if (id) result.push(id);
        //     });
        // }
        return [];
    };
    EditorDragonbonesDisplay.prototype.toSprite = function () {
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
    EditorDragonbonesDisplay.prototype.createArmatureDisplay = function () {
        _super.prototype.createArmatureDisplay.call(this);
        this.setData("id", this.sprite.id);
    };
    Object.defineProperty(EditorDragonbonesDisplay.prototype, "isMoss", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EditorDragonbonesDisplay.prototype, "nodeType", {
        get: function () {
            return this.mNodeType;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 兼容没有Layer的情况
     * @deprecated
     */
    EditorDragonbonesDisplay.prototype.defaultLayer = function () {
        if (!this.sprite.layer) {
            this.sprite.layer = LayerEnum.Surface;
        }
    };
    Object.defineProperty(EditorDragonbonesDisplay.prototype, "topDisplay", {
        get: function () {
            if (!this.mTopDisplay) {
                this.mTopDisplay = new EditorTopDisplay(this.scene, this, 1);
            }
            return this.mTopDisplay;
        },
        enumerable: true,
        configurable: true
    });
    return EditorDragonbonesDisplay;
}(BaseDragonbonesDisplay));
export { EditorDragonbonesDisplay };
//# sourceMappingURL=editor.dragonbones.display.js.map