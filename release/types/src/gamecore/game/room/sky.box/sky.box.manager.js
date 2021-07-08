var SkyBoxManager = /** @class */ (function () {
    function SkyBoxManager(room) {
        this.mRoom = room;
        this.mGame = room.game;
        this.mScenetys = new Map();
    }
    SkyBoxManager.prototype.add = function (scenery) {
        // const blockManager = new BlockManager(scenery, this.mRoom);
        this.mScenetys.set(scenery.id, scenery);
        this.mGame.renderPeer.addSkybox(scenery);
        // if (this.mStateMap) {
        //   blockManager.setState(this.mStateMap);
        // }
    };
    SkyBoxManager.prototype.update = function (scenery) {
        // const block = this.mScenetys.get(scenery.id);
        // if (block) {
        //   block.update(scenery);
        // }
    };
    SkyBoxManager.prototype.remove = function (id) {
        var block = this.mScenetys.get(id);
        if (block) {
            // block.destroy();
        }
    };
    SkyBoxManager.prototype.resize = function (width, height) {
        if (!this.mScenetys) {
            return;
        }
        this.mScenetys.forEach(function (scenety) {
            // scenety.resize(width, height);
        });
    };
    SkyBoxManager.prototype.destroy = function () {
        var _this = this;
        // this.mScenetys.forEach((scenery: BlockManager) => scenery.destroy());
        this.mScenetys.forEach(function (scenery) { return _this.mGame.renderPeer.removeSkybox(scenery.id); });
        this.mScenetys.clear();
    };
    Object.defineProperty(SkyBoxManager.prototype, "scenery", {
        get: function () {
            return Array.from(this.mScenetys.values());
        },
        enumerable: true,
        configurable: true
    });
    return SkyBoxManager;
}());
export { SkyBoxManager };
//# sourceMappingURL=sky.box.manager.js.map