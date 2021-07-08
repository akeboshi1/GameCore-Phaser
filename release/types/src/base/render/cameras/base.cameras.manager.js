import { Logger } from "structure";
var BaseCamerasManager = /** @class */ (function () {
    function BaseCamerasManager() {
        this.zoom = 1;
        this.mCameras = [];
    }
    /**
     * 检测是否在游戏主摄像头内部
     * @param pos
     */
    BaseCamerasManager.prototype.checkContains = function (pos) {
        var rectange = this.mMain.worldView;
        if (rectange)
            return false;
        return rectange.contains(pos.x, pos.y);
    };
    BaseCamerasManager.prototype.startRoomPlay = function (scene) {
        this.mMain = scene.cameras.main;
    };
    BaseCamerasManager.prototype.pan = function (x, y, duration) {
        var _this = this;
        x *= this.zoom;
        y *= this.zoom;
        for (var _i = 0, _a = this.mCameras; _i < _a.length; _i++) {
            var cam = _a[_i];
            cam.pan(x, y, duration);
        }
        return new Promise(function (resolve, reject) {
            _this.mMain.once(Phaser.Cameras.Scene2D.Events.PAN_COMPLETE, function () {
                resolve();
            });
        });
    };
    BaseCamerasManager.prototype.resize = function (width, height) {
    };
    BaseCamerasManager.prototype.setScroll = function (x, y) {
        if (!this.mMain) {
            return;
        }
        x -= this.mMain.width * 0.5;
        y -= this.mMain.height * 0.5;
        for (var _i = 0, _a = this.mCameras; _i < _a.length; _i++) {
            var camera = _a[_i];
            camera.setScroll(x, y);
        }
    };
    BaseCamerasManager.prototype.offsetScroll = function (x, y) {
        if (!this.mMain) {
            return;
        }
        for (var _i = 0, _a = this.mCameras; _i < _a.length; _i++) {
            var camera = _a[_i];
            camera.scrollX += x;
            camera.scrollY += y;
        }
        this.moving = true;
    };
    BaseCamerasManager.prototype.startFollow = function (target) {
        this.mTarget = target;
        if (this.mMain && target) {
            for (var _i = 0, _a = this.mCameras; _i < _a.length; _i++) {
                var camera = _a[_i];
                camera.startFollow(target);
            }
        }
    };
    BaseCamerasManager.prototype.stopFollow = function () {
        this.mTarget = null;
        if (this.mMain) {
            for (var _i = 0, _a = this.mCameras; _i < _a.length; _i++) {
                var camera = _a[_i];
                camera.stopFollow();
            }
        }
    };
    BaseCamerasManager.prototype.addCamera = function (camera) {
        var index = this.mCameras.indexOf(camera);
        if (index === -1) {
            this.mCameras.push(camera);
        }
        if (this.mTarget) {
            camera.startFollow(this.mTarget);
        }
    };
    BaseCamerasManager.prototype.removeCamera = function (camera) {
        var index = this.mCameras.indexOf(camera);
        if (index > -1) {
            this.mCameras.splice(index, 1);
        }
    };
    BaseCamerasManager.prototype.setBounds = function (x, y, width, height, centerOn) {
        if (!this.mMain) {
            Logger.getInstance().error("camera does not exist");
            return;
        }
        for (var _i = 0, _a = this.mCameras; _i < _a.length; _i++) {
            var camera = _a[_i];
            camera.setBounds(x, y, width, height, centerOn);
        }
        // this.mMain.setBounds(x, y, width, height, centerOn);
    };
    BaseCamerasManager.prototype.setPosition = function (x, y) {
        if (!this.mMain) {
            return;
        }
        for (var _i = 0, _a = this.mCameras; _i < _a.length; _i++) {
            var camera = _a[_i];
            camera.setPosition(x, y);
        }
        // this.mMain.setPosition(x, y);
    };
    BaseCamerasManager.prototype.scrollTargetPoint = function (x, y, effect) {
        if (!this.mMain) {
            return;
        }
        this.stopFollow();
        if (effect) {
            this.pan(x, y, 1000);
        }
        else {
            this.setScroll(x, y);
        }
    };
    BaseCamerasManager.prototype.destroy = function () {
        Logger.getInstance().log("camerasmanager destroy");
        this.mMain = undefined;
        this.mTarget = undefined;
        this.mCameras = [];
    };
    Object.defineProperty(BaseCamerasManager.prototype, "moving", {
        get: function () {
            return this.mMoving;
        },
        set: function (val) {
            this.mMoving = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseCamerasManager.prototype, "targetFollow", {
        get: function () {
            return this.mTarget;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseCamerasManager.prototype, "camera", {
        get: function () {
            return this.mMain;
        },
        set: function (camera) {
            this.mMain = camera;
            this.addCamera(camera);
        },
        enumerable: true,
        configurable: true
    });
    return BaseCamerasManager;
}());
export { BaseCamerasManager };
//# sourceMappingURL=base.cameras.manager.js.map