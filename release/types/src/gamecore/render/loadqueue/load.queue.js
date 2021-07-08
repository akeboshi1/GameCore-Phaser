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
export var LoadType;
(function (LoadType) {
    LoadType[LoadType["IMAGE"] = 0] = "IMAGE";
    LoadType[LoadType["JSON"] = 1] = "JSON";
    LoadType[LoadType["ALTAS"] = 2] = "ALTAS";
    LoadType[LoadType["DRAGONBONES"] = 3] = "DRAGONBONES";
})(LoadType || (LoadType = {}));
var LoadState;
(function (LoadState) {
    LoadState[LoadState["NONE"] = 0] = "NONE";
    LoadState[LoadState["PRELOAD"] = 1] = "PRELOAD";
    LoadState[LoadState["PROGRESS"] = 2] = "PROGRESS";
    LoadState[LoadState["COMPLETE"] = 3] = "COMPLETE";
    LoadState[LoadState["ERROR"] = 4] = "ERROR";
    LoadState[LoadState["RETRY"] = 5] = "RETRY";
})(LoadState || (LoadState = {}));
var LoadQueue = /** @class */ (function (_super) {
    __extends_1(LoadQueue, _super);
    function LoadQueue(scene) {
        var _this = _super.call(this) || this;
        _this.scene = scene;
        _this.mQueue = [];
        return _this;
    }
    LoadQueue.prototype.add = function (list) {
        var _this = this;
        list.forEach(function (loadObject) {
            if (loadObject) {
                var type = loadObject.type;
                var key = loadObject.key;
                var altasUrl = loadObject.altasUrl, textureUrl = loadObject.textureUrl, jsonUrl = loadObject.jsonUrl, boneUrl = loadObject.boneUrl;
                switch (type) {
                    case LoadType.ALTAS:
                        _this.scene.load.atlas(key, altasUrl);
                        break;
                    case LoadType.IMAGE:
                        _this.scene.load.image(key, textureUrl);
                        break;
                    case LoadType.JSON:
                        _this.scene.load.json(key, jsonUrl);
                        break;
                    case LoadType.DRAGONBONES:
                        _this.scene.load.dragonbone(key, textureUrl, jsonUrl, boneUrl, null, null, { responseType: "arraybuffer" });
                        break;
                }
                _this.mQueue.push(loadObject);
                // 如果load没有在加载，且load状态处于准备状态，可自动开启startLoad
                // if (!this.scene.load.isLoading() && this.scene.load.isReady()) {
                //     this.startLoad();
                // }
            }
        });
    };
    // 现改为add自动调用，可外部手动调用
    LoadQueue.prototype.startLoad = function () {
        this.mQueue.forEach(function (loadObject) {
            loadObject.state = LoadState.PROGRESS;
        });
        this.addListen();
        this.scene.load.start();
    };
    LoadQueue.prototype.destroy = function () {
        this.removeListen();
        if (this.mQueue)
            this.mQueue = null;
        _super.prototype.destroy.call(this);
    };
    LoadQueue.prototype.addListen = function () {
        // 默认先清理下该loadqueue下的load监听，防止多次监听
        this.removeListen();
        this.scene.load.on(Phaser.Loader.Events.FILE_COMPLETE, this.fileComplete, this);
        this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.totalComplete, this);
        this.scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, this.fileLoadError, this);
    };
    LoadQueue.prototype.removeListen = function () {
        this.scene.load.off(Phaser.Loader.Events.FILE_COMPLETE, this.fileComplete, this);
        this.scene.load.off(Phaser.Loader.Events.COMPLETE, this.totalComplete, this);
        this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, this.fileLoadError, this);
    };
    LoadQueue.prototype.totalComplete = function () {
        this.emit("QueueComplete");
        this.clearQueue();
    };
    LoadQueue.prototype.fileComplete = function (key, type) {
        this.emit("QueueProgress", this.scene.load.progress, key, type);
    };
    LoadQueue.prototype.fileLoadError = function (file) {
        // Logger.getInstance().log("queue load error", file);
        this.emit("QueueError", file.key);
    };
    LoadQueue.prototype.clearQueue = function () {
        this.removeListen();
        if (!this.mQueue)
            return;
        this.mQueue.length = 0;
        this.mQueue = [];
    };
    return LoadQueue;
}(Phaser.Events.EventEmitter));
export { LoadQueue };
//# sourceMappingURL=load.queue.js.map