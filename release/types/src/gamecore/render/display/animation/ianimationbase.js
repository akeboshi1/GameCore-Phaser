var AnimationUrlData = /** @class */ (function () {
    function AnimationUrlData() {
    }
    AnimationUrlData.prototype.setData = function (resName, textureUrl, jsonUrl, boneUrl, extension) {
        if (extension === void 0) { extension = ".json"; }
        this.resName = resName;
        this.pngUrl = textureUrl;
        this.jsonUrl = jsonUrl;
        this.boneUrl = boneUrl;
        this.responseType = extension === ".dbbin" ? "arraybuffer" : null;
        this.boneXhrSettings = this.responseType ? { responseType: "arraybuffer" } : null;
    };
    AnimationUrlData.prototype.setDisplayData = function (pngUrl, jsonUrl, extension) {
        if (extension === void 0) { extension = ".json"; }
        this.pngUrl = pngUrl;
        this.jsonUrl = jsonUrl;
        this.responseType = extension === ".dbbin" ? "arraybuffer" : null;
        this.boneXhrSettings = this.responseType ? { responseType: "arraybuffer" } : null;
    };
    AnimationUrlData.prototype.dispose = function () {
        this.textureXhrSettings = null;
        this.atlasXhrSettings = null;
        this.boneXhrSettings = null;
    };
    return AnimationUrlData;
}());
export { AnimationUrlData };
//# sourceMappingURL=ianimationbase.js.map