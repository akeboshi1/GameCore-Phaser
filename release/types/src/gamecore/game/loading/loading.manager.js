var LoadingManager = /** @class */ (function () {
    function LoadingManager(game) {
        this.mGame = game;
        this.mResources = [];
    }
    LoadingManager.prototype.start = function (state, data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.mGame.peer.render.showLoading({ "dpr": _this.mGame.getGameConfig().scale_ratio, state: state, data: data }).then(function () {
                resolve(null);
            });
        });
    };
    LoadingManager.prototype.sceneCallback = function () {
        if (this.mResources.length > 0) {
            return this.addAssets(this.mResources);
        }
    };
    LoadingManager.prototype.addAssets = function (assets) {
        if (!assets) {
            return;
        }
        for (var _i = 0, assets_1 = assets; _i < assets_1.length; _i++) {
            var asset = assets_1[_i];
            this.loadAsset(asset);
        }
        return this.startup();
    };
    LoadingManager.prototype.startup = function () {
        // this.scene = scene;
        // this.scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
        //     this.mLoading = false;
        //     this.mResources = [];
        //     // this.game.scene.remove(LoadingScene.name);
        //     return Promise.resolve();
        // });
        for (var _i = 0, _a = this.mResources; _i < _a.length; _i++) {
            var asset = _a[_i];
            this.loadAsset(asset);
        }
        // this.scene.load.start();
        // this.mGame.peer.render.sceneStartLoad(SceneName.LOADING_SCENE);
        this.mLoading = true;
    };
    LoadingManager.prototype.destroy = function () {
        if (this.mResources) {
            this.mResources = [];
        }
    };
    LoadingManager.prototype.loadAsset = function (asset) {
        var type = this.getLoadType(asset.type);
        // this.mGame.peer.render.sceneAddLoadRes(SceneName.LOADING_SCENE, type, asset.key, asset.source);
        // if (this.scene.load[type]) {
        //     this.scene.load[type](asset.key, asset.source);
        // }
    };
    Object.defineProperty(LoadingManager.prototype, "game", {
        get: function () {
            if (!this.mGame) {
                return null;
            }
            return this.mGame;
        },
        enumerable: true,
        configurable: true
    });
    LoadingManager.prototype.getLoadType = function (fileType) {
        if (fileType === "mp3" || fileType === "wmv" || fileType === "ogg") {
            return "audio";
        }
        return fileType;
    };
    return LoadingManager;
}());
export { LoadingManager };
//# sourceMappingURL=loading.manager.js.map