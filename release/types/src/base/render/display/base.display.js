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
import { ValueResolver, LogicPos } from "structure";
var BaseDisplay = /** @class */ (function (_super) {
    __extends_1(BaseDisplay, _super);
    function BaseDisplay(scene, id) {
        var _this = _super.call(this, scene) || this;
        _this.mAlpha = 1;
        _this.mDirection = 3;
        _this.mMountList = new Map();
        _this.mCreated = false;
        _this.mSprites = new Map();
        _this.mLoadDisplayPromise = null;
        _this.mSortX = 0;
        _this.mSortY = 0;
        _this.mID = 0;
        _this.mHasInteractive = false;
        _this.mID = id;
        return _this;
    }
    BaseDisplay.prototype.destroy = function (fromScene) {
        this.mSprites.forEach(function (sprite) { return sprite.destroy(); });
        this.mSprites.clear();
        if (this.parentContainer) {
            this.parentContainer.remove(this);
        }
        this.mHasInteractive = false;
        _super.prototype.destroy.call(this, fromScene);
    };
    BaseDisplay.prototype.load = function (data) {
        var _this = this;
        this.displayInfo = data;
        if (!this.displayInfo)
            return Promise.reject("displayInfo error");
        this.mLoadDisplayPromise = new ValueResolver();
        return this.mLoadDisplayPromise.promise(function () {
            _this.scene.load.start();
        });
    };
    BaseDisplay.prototype.displayCreated = function () {
        this.mCreated = true;
        if (this.createdHandler) {
            this.createdHandler.runWith(this.displayInfo);
        }
    };
    Object.defineProperty(BaseDisplay.prototype, "created", {
        get: function () {
            return this.mCreated;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseDisplay.prototype, "direction", {
        get: function () {
            return this.mDirection;
        },
        set: function (dir) {
            this.mDirection = dir;
            if (this.mDisplayInfo) {
                this.mDisplayInfo.avatarDir = dir;
                this.play(this.mAnimation);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseDisplay.prototype, "displayInfo", {
        get: function () {
            return this.mDisplayInfo;
        },
        set: function (data) {
            this.mDisplayInfo = data;
        },
        enumerable: true,
        configurable: true
    });
    BaseDisplay.prototype.play = function (animation) {
        this.mAnimation = animation;
    };
    BaseDisplay.prototype.changeAlpha = function (val) {
        if (this.mAlpha === val) {
            return;
        }
        this.alpha = val;
        this.mAlpha = val;
    };
    BaseDisplay.prototype.setDirection = function (dir) {
        if (dir === this.direction)
            return;
        // this.mDisplayInfo.avatarDir = dir;
        this.direction = dir;
        // Logger.getInstance().log("render display ===>", this.direction);
        this.play(this.mAnimation);
    };
    BaseDisplay.prototype.setPosition = function (x, y, z, w) {
        _super.prototype.setPosition.call(this, x, y, z, w);
        this.update();
        return this;
    };
    BaseDisplay.prototype.update = function () {
        this.updateSort();
        if (this.mMountList) {
            this.mMountList.forEach(function (mount) { return mount.update(); });
        }
    };
    BaseDisplay.prototype.getPosition = function () {
        var pos = new LogicPos(this.x, this.y);
        if (this.mRootMount) {
            var rootPos = this.mRootMount.getPosition();
            pos.x += rootPos.x;
            pos.y += rootPos.y;
        }
        return pos;
    };
    BaseDisplay.prototype.setRootMount = function (gameObject) {
        this.mRootMount = gameObject;
        this.update();
    };
    BaseDisplay.prototype.mount = function (display, index) {
    };
    BaseDisplay.prototype.unmount = function (display) {
    };
    BaseDisplay.prototype.destroyMount = function () {
        this.mMountList.forEach(function (mount, index) { return mount.destroy(); });
        this.mMountList.clear();
    };
    BaseDisplay.prototype.fadeIn = function (callback) {
    };
    BaseDisplay.prototype.fadeOut = function (callback) {
    };
    BaseDisplay.prototype.getSprite = function (key) {
        return this.mSprites.get(key);
    };
    BaseDisplay.prototype.getScene = function () {
        return this.scene;
    };
    BaseDisplay.prototype.updateSort = function () {
        if (this.mRootMount)
            return;
        var x = this.x - this.projectionSize.offset.x;
        var y = this.y - this.projectionSize.offset.y;
        this.mSortX = (x + 2 * y) / 30; // 转化为斜45度的格子
        this.mSortY = (2 * y - x) / 30;
    };
    Object.defineProperty(BaseDisplay.prototype, "runningAnimation", {
        get: function () {
            return this.mAnimation;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseDisplay.prototype, "rootMount", {
        get: function () {
            return this.mRootMount;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseDisplay.prototype, "projectionSize", {
        get: function () {
            if (!this.mProjectionSize) {
                this.mProjectionSize = { offset: { x: 0, y: 0 }, width: 0, height: 0 };
            }
            return this.mProjectionSize;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseDisplay.prototype, "sortX", {
        get: function () {
            return this.mSortX;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseDisplay.prototype, "sortY", {
        get: function () {
            return this.mSortY;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseDisplay.prototype, "sortZ", {
        get: function () {
            return this.z || 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseDisplay.prototype, "id", {
        get: function () {
            return this.mID;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseDisplay.prototype, "hasInteractive", {
        get: function () {
            return this.mHasInteractive;
        },
        set: function (val) {
            this.mHasInteractive = val;
        },
        enumerable: true,
        configurable: true
    });
    return BaseDisplay;
}(Phaser.GameObjects.Container));
export { BaseDisplay };
//# sourceMappingURL=base.display.js.map