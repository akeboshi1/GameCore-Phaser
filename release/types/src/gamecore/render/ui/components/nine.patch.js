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
import { normalizePatchesConfig } from "./patches.config";
var NinePatch = /** @class */ (function (_super) {
    __extends_1(NinePatch, _super);
    function NinePatch(scene, x, y, width, height, key, frame, config) {
        var _this = _super.call(this, scene, x, y) || this;
        _this.config = config || _this.scene.cache.custom.ninePatch.get(frame ? "" + frame : key);
        // 对于config进行取整
        _this.patchKey = Math.random() * 1000 + "";
        _this.config.top = Math.round(_this.config.top);
        if (_this.config.right)
            _this.config.right = Math.round(_this.config.right);
        if (_this.config.bottom)
            _this.config.bottom = Math.round(_this.config.bottom);
        if (_this.config.left)
            _this.config.left = Math.round(_this.config.left);
        normalizePatchesConfig(_this.config);
        _this.setSize(width, height);
        _this.setTexture(key, frame);
        return _this;
    }
    NinePatch.prototype.resize = function (width, height) {
        width = Math.round(width);
        height = Math.round(height);
        if (!this.config) {
            return this;
        }
        if (this.width === width && this.height === height) {
            return this;
        }
        // 增加中间区域尺寸 1
        width = Math.max(width, this.config.left + this.config.right + 1);
        height = Math.max(height, this.config.top + this.config.bottom + 1);
        this.setSize(width, height);
        this.drawPatches();
        return;
    };
    NinePatch.prototype.setTexture = function (key, frame) {
        this.originTexture = this.scene.textures.get(key);
        this.setFrame(frame);
        this.originTexture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        return this;
    };
    NinePatch.prototype.setFrame = function (frame) {
        this.originFrame = this.originTexture.frames[frame] || this.originTexture.frames[NinePatch.__BASE];
        this.createPatches();
        this.drawPatches();
        return this;
    };
    NinePatch.prototype.setSize = function (width, height) {
        _super.prototype.setSize.call(this, width, height);
        this.finalXs = [0, this.config.left, this.width - this.config.right, this.width];
        this.finalYs = [0, this.config.top, this.height - this.config.bottom, this.height];
        return this;
    };
    NinePatch.prototype.setTint = function (tint) {
        this.tint = tint;
        return this;
    };
    NinePatch.prototype.setTintFill = function (tint) {
        this.tint = tint;
        this.tintFill = true;
        return this;
    };
    Object.defineProperty(NinePatch.prototype, "tintFill", {
        get: function () {
            return this.first && this.first.tintFill;
        },
        set: function (value) {
            this.each(function (patch) { return patch.tintFill = value; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NinePatch.prototype, "tint", {
        set: function (value) {
            this.each(function (patch) { return patch.setTintFill(value); });
            this.internalTint = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NinePatch.prototype, "isTinted", {
        get: function () {
            return this.first && this.first.isTinted;
        },
        enumerable: true,
        configurable: true
    });
    NinePatch.prototype.clearTint = function () {
        this.each(function (patch) { return patch.clearTint(); });
        this.internalTint = undefined;
        this.tintFill = false;
    };
    NinePatch.prototype.destroy = function () {
        if (this.originTexture) {
            var patchIndex = 0;
            for (var yi = 0; yi < 3; yi++) {
                for (var xi = 0; xi < 3; xi++) {
                    var patch = this.getPatchNameByIndex(patchIndex);
                    if (this.originTexture.frames.hasOwnProperty(patch)) {
                        this.originTexture.remove(patch);
                    }
                    ++patchIndex;
                }
            }
        }
        _super.prototype.destroy.call(this);
    };
    NinePatch.prototype.getPatchNameByIndex = function (index) {
        return this.originFrame.name + NinePatch.patches[index] + this.patchKey;
    };
    NinePatch.prototype.createPatches = function () {
        // The positions we want from the base texture
        var textureXs = [0, this.config.left, this.originFrame.width - this.config.right, this.originFrame.width];
        var textureYs = [0, this.config.top, this.originFrame.height - this.config.bottom, this.originFrame.height];
        var patchIndex = 0;
        for (var yi = 0; yi < 3; yi++) {
            for (var xi = 0; xi < 3; xi++) {
                this.createPatchFrame(this.getPatchNameByIndex(patchIndex), textureXs[xi], // x
                textureYs[yi], // y
                textureXs[xi + 1] - textureXs[xi], // width
                textureYs[yi + 1] - textureYs[yi] // height
                );
                ++patchIndex;
            }
        }
    };
    // private drawPatches(): void {
    //     const tintFill = this.tintFill;
    //     this.removeAll(true);
    //     let patchIndex = 0;
    //     for (let yi = 0; yi < 3; yi++) {
    //         for (let xi = 0; xi < 3; xi++) {
    //             const patch: Phaser.Textures.Frame = this.originTexture.frames[this.getPatchNameByIndex(patchIndex)];
    //             const patchImg = new Phaser.GameObjects.Image(this.scene, 0, 0, patch.texture.key, patch.name);
    //             patchImg.setOrigin(0);
    //             patchImg.setPosition(this.finalXs[xi] - this.width * this.originX, this.finalYs[yi] - this.height * this.originY);
    //             patchImg.setScale(
    //                 (this.finalXs[xi + 1] - this.finalXs[xi]) / patch.width,
    //                 (this.finalYs[yi + 1] - this.finalYs[yi]) / patch.height
    //             );
    //             this.add(patchImg);
    //             patchImg.setTint(this.internalTint);
    //             patchImg.tintFill = tintFill;
    //             ++patchIndex;
    //         }
    //     }
    // }
    NinePatch.prototype.drawPatches = function () {
        var tintFill = this.tintFill;
        this.removeAll(true);
        var patchIndex = 0;
        // const info = [];
        for (var yi = 0; yi < 3; yi++) {
            for (var xi = 0; xi < 3; xi++) {
                var patch = this.originTexture.frames[this.getPatchNameByIndex(patchIndex)];
                var patchImg = new Phaser.GameObjects.Image(this.scene, 0, 0, patch.texture.key, patch.name);
                patchImg.setOrigin(0);
                patchImg.setPosition((this.finalXs[xi] * 1000 - this.width * this.originX * 1000) / 1000, (this.finalYs[yi] * 1000 - this.height * this.originY * 1000) / 1000);
                // patchImg.setScale(
                //     (this.finalXs[xi + 1] * 1000 - this.finalXs[xi] * 1000) / patch.width / 1000,
                //     (this.finalYs[yi + 1] * 1000 - this.finalYs[yi] * 1000) / patch.height / 1000
                // );
                // 直接设置displayWidth即最终显示宽度
                patchImg.displayWidth = this.finalXs[xi + 1] - this.finalXs[xi];
                patchImg.displayHeight = this.finalYs[yi + 1] - this.finalYs[yi];
                this.add(patchImg);
                if (this.internalTint)
                    patchImg.setTint(this.internalTint);
                patchImg.tintFill = tintFill;
                patchImg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
                ++patchIndex;
                // info.push({ x: patchImg.x, y: patchImg.y, w: patchImg.width, h: patchImg.height, s: patchImg.scale, sx: patchImg.scaleX, sy: patchImg.scaleY });
            }
        }
    };
    NinePatch.prototype.createPatchFrame = function (patch, x, y, width, height) {
        if (this.originTexture.frames.hasOwnProperty(patch)) {
            return;
        }
        this.originTexture.add(patch, this.originFrame.sourceIndex, this.originFrame.cutX + x, this.originFrame.cutY + y, width, height);
    };
    NinePatch.__BASE = "__BASE";
    NinePatch.patches = ["[0][0]", "[1][0]", "[2][0]", "[0][1]", "[1][1]", "[2][1]", "[0][2]", "[1][2]", "[2][2]"];
    return NinePatch;
}(Phaser.GameObjects.Container));
export { NinePatch };
//# sourceMappingURL=nine.patch.js.map