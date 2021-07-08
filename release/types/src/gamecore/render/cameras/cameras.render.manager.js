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
import { BaseCamerasManager } from "baseRender";
import { Logger } from "structure";
var CamerasRenderManager = /** @class */ (function (_super) {
    __extends_1(CamerasRenderManager, _super);
    function CamerasRenderManager(render) {
        var _this = _super.call(this) || this;
        _this.render = render;
        _this.MINI_VIEW_SIZE = 50;
        _this.VIEW_PORT_SIZE = 50;
        _this.viewPort = new Phaser.Geom.Rectangle();
        _this.miniViewPort = new Phaser.Geom.Rectangle();
        _this.mCameras = [];
        _this.zoom = _this.render.scaleRatio;
        return _this;
    }
    CamerasRenderManager.prototype.startRoomPlay = function (scene) {
        this.mMain = scene.cameras.main;
    };
    CamerasRenderManager.prototype.pan = function (x, y, duration, ease, force, callback, context) {
        var _this = this;
        x *= this.zoom;
        y *= this.zoom;
        for (var _i = 0, _a = this.mCameras; _i < _a.length; _i++) {
            var cam = _a[_i];
            cam.pan(x, y, duration, ease, force, callback, context);
        }
        return new Promise(function (resolve, reject) {
            _this.mMain.once(Phaser.Cameras.Scene2D.Events.PAN_COMPLETE, function () {
                resolve();
            });
        });
    };
    Object.defineProperty(CamerasRenderManager.prototype, "camera", {
        get: function () {
            return this.mMain;
        },
        set: function (camera) {
            this.mMain = camera;
            this.addCamera(camera);
            this.setViewPortSize();
        },
        enumerable: true,
        configurable: true
    });
    CamerasRenderManager.prototype.resize = function (width, height) {
        Logger.getInstance().debug("resize");
        this.resetCameraSize(width, height);
        Logger.getInstance().debug("camera ===== resize");
        if (this.mTarget) {
            Logger.getInstance().debug("target ===== resize");
            this.startFollow(this.mTarget);
        }
    };
    CamerasRenderManager.prototype.scrollTargetPoint = function (x, y, effect) {
        var _this = this;
        if (!this.mMain) {
            return;
        }
        this.stopFollow();
        if (effect) {
            this.pan(x, y, 1000).then(function () {
                _this.render.syncCameraScroll();
            });
        }
        else {
            this.setScroll(x, y);
            this.render.syncCameraScroll();
        }
    };
    CamerasRenderManager.prototype.destroy = function () {
        Logger.getInstance().debug("camerasmanager destroy");
        this.mMain = undefined;
        this.mTarget = undefined;
        this.mCameras = [];
    };
    CamerasRenderManager.prototype.resetCameraSize = function (width, height) {
        Logger.getInstance().debug("resetCamerSize");
        this.render.mainPeer.resetGameraSize(width, height);
    };
    CamerasRenderManager.prototype.setViewPortSize = function () {
        if (!this.mMain) {
            Logger.getInstance().error("camera does not exist");
            return;
        }
        var size = this.render.getCurrentRoomSize();
        if (!size) {
            Logger.getInstance().error("room size does not exist");
            return;
        }
        var viewW = (this.VIEW_PORT_SIZE + this.VIEW_PORT_SIZE) * (size.tileWidth / 2);
        var viewH = (this.VIEW_PORT_SIZE + this.VIEW_PORT_SIZE) * (size.tileHeight / 2);
        // const viewW = this.mMain.width * 2;
        // const viewH = this.mMain.height * 2;
        this.viewPort.setSize(viewW, viewH);
        var miniViewW = (this.MINI_VIEW_SIZE + this.MINI_VIEW_SIZE) * (size.tileWidth / 2);
        var miniviewH = (this.MINI_VIEW_SIZE + this.MINI_VIEW_SIZE) * (size.tileHeight / 2);
        this.miniViewPort.setSize(miniViewW, miniviewH);
    };
    return CamerasRenderManager;
}(BaseCamerasManager));
export { CamerasRenderManager };
//# sourceMappingURL=cameras.render.manager.js.map