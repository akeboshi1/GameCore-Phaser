import { LogicRectangle, Logger } from "structure";
import { Viewblock } from "./view.block";
var ViewblockManager = /** @class */ (function () {
    function ViewblockManager(cameras) {
        this.mBlocks = [];
        this.mDelay = 0;
        this.mCameras = cameras;
    }
    ViewblockManager.prototype.add = function (e) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this.mCameras) {
                resolve(false);
                return;
            }
            var ePos = e.getPosition();
            if (!ePos) {
                resolve(false);
                return;
            }
            for (var _i = 0, _a = _this.mBlocks; _i < _a.length; _i++) {
                var block = _a[_i];
                var rect = block.rectangle;
                if (rect.contains(ePos.x, ePos.y)) {
                    block.add(e).then(function () {
                        resolve(true);
                    });
                    return;
                }
            }
        });
    };
    ViewblockManager.prototype.remove = function (e) {
        // Logger.getInstance().log("viewblock remove");
        if (!e)
            return;
        for (var _i = 0, _a = this.mBlocks; _i < _a.length; _i++) {
            var block = _a[_i];
            if (block.remove(e)) {
                return;
            }
        }
    };
    ViewblockManager.prototype.check = function (e) {
        if (!e)
            return;
        for (var _i = 0, _a = this.mBlocks; _i < _a.length; _i++) {
            var block = _a[_i];
            if (block.inCamera) {
                var rect = block.rectangle;
                var pos = e.getPosition();
                if (rect.contains(pos.x, pos.y)) {
                    if (!block.getElement(e.id)) {
                        this.remove(e);
                        block.add(e);
                    }
                    return;
                }
            }
        }
    };
    ViewblockManager.prototype.int = function (size) {
        if (!size) {
            return;
        }
        this.mBlocks = [];
        var colSize = 10;
        var viewW = (colSize + colSize) * (size.tileWidth / 2);
        var viewH = (colSize + colSize) * (size.tileHeight / 2);
        var blockW = size.sceneWidth / viewW;
        var blockH = size.sceneHeight / viewH;
        var offsetX = size.rows * (size.tileWidth / 2);
        var index = 0;
        for (var i = 0; i < blockW; i++) {
            for (var j = 0; j < blockH; j++) {
                var block = new Viewblock(new LogicRectangle(i * viewW - offsetX, j * viewH, viewW, viewH), index++);
                this.mBlocks.push(block);
                // this.layerManager.addToAtmosphere(block.drawBoard(this.scene));
            }
        }
    };
    ViewblockManager.prototype.update = function (time, delta) {
        var _this = this;
        // Logger.getInstance().log("viewblock update");
        if (!this.mCameras)
            return;
        this.mDelay = time;
        var promise = this.mCameras.getViewPort();
        if (promise) {
            promise.then(function (obj) {
                var bound = obj;
                for (var _i = 0, _a = _this.mBlocks; _i < _a.length; _i++) {
                    var block = _a[_i];
                    block.check(bound);
                }
                // this.mCameras.getMiniViewPort().then((obj45) => {
                //     const miniViewPort = obj45;
                // });
            }).catch(function (error) {
                Logger.getInstance().error(error);
            });
        }
    };
    ViewblockManager.prototype.destroy = function () {
        this.mDelay = 0;
        if (this.mBlocks) {
            this.mBlocks.length = 0;
            this.mBlocks = [];
        }
    };
    return ViewblockManager;
}());
export { ViewblockManager };
//# sourceMappingURL=viewblock.manager.js.map