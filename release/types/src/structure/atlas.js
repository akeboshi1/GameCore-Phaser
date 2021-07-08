var Atlas = /** @class */ (function () {
    function Atlas() {
        this.frames = [];
        this.atlas = { frames: this.frames };
    }
    Atlas.prototype.addFrame = function (name, rect) {
        this.frames.push({
            filename: name,
            frame: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
            rotated: false,
            trimmed: false,
            spriteSourceSize: { x: 0, y: 0, w: rect.width, h: rect.height },
            sourceSize: { w: rect.width, h: rect.height }
        });
    };
    Atlas.prototype.setFrame = function (frame) {
        this.frames = frame;
        this.atlas = { frames: this.frames };
    };
    Atlas.prototype.removeFrame = function (name) {
        this.frames[name] = null;
        delete this.frames[name];
    };
    Atlas.prototype.clearFrames = function () {
        this.frames.length = 0;
    };
    Atlas.prototype.toString = function () {
        return JSON.stringify(this.atlas);
    };
    return Atlas;
}());
export { Atlas };
//# sourceMappingURL=atlas.js.map