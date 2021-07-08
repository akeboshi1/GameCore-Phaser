var GuideManager = /** @class */ (function () {
    function GuideManager(render) {
        this.render = render;
        this.guideMap = new Map();
    }
    Object.defineProperty(GuideManager.prototype, "curGuide", {
        get: function () {
            return this.mGurGuide;
        },
        enumerable: true,
        configurable: true
    });
    GuideManager.prototype.canInteractive = function (data) {
        if (!this.mGurGuide)
            return false;
        var boo = data ? this.mGurGuide.checkInteractive(data) : true;
        return boo;
    };
    GuideManager.prototype.init = function (data) {
    };
    GuideManager.prototype.destroy = function () {
        this.guideMap.forEach(function (guide) {
            guide.destroy();
        });
        this.guideMap.clear();
        this.guideMap = null;
    };
    GuideManager.prototype.startGuide = function (guide) {
        this.mGurGuide = guide;
    };
    GuideManager.prototype.stopGuide = function () {
        this.mGurGuide = null;
    };
    return GuideManager;
}());
export { GuideManager };
//# sourceMappingURL=guide.manager.js.map