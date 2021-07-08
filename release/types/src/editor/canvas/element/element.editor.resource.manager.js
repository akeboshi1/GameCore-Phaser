import * as path from "path";
import { MaxRectsPacker } from "maxrects-packer";
import { ElementEditorEmitType } from "./element.editor.type";
import { Logger, Atlas } from "structure";
export var WEB_HOME_PATH = "https://osd.tooqing.com/";
export var SPRITE_SHEET_KEY = "ELEMENT_EDITOR_SPRITE_SHEET_KEY";
export var IMAGE_BLANK_KEY = "blank";
var ElementEditorResourceManager = /** @class */ (function () {
    function ElementEditorResourceManager(data, emitter, localHomePath) {
        this.mResourcesChangeListeners = [];
        this.mElementNode = data;
        this.mEmitter = emitter;
        this.mLocalHomePath = localHomePath;
    }
    ElementEditorResourceManager.prototype.init = function (scene) {
        this.mScene = scene;
        this.loadResources();
    };
    ElementEditorResourceManager.prototype.addResourcesChangeListener = function (listener) {
        this.mResourcesChangeListeners.push(listener);
    };
    ElementEditorResourceManager.prototype.removeResourcesChangeListener = function (listener) {
        var idx = this.mResourcesChangeListeners.indexOf(listener);
        if (idx !== -1) {
            this.mResourcesChangeListeners.splice(idx, 1);
        }
    };
    ElementEditorResourceManager.prototype.loadResources = function () {
        if (!this.mScene) {
            Logger.getInstance().warn("ResourceManager not inited");
            return;
        }
        if (!this.mElementNode ||
            !this.mElementNode.animations.display.texturePath ||
            this.mElementNode.animations.display.texturePath === "" ||
            !this.mElementNode.animations.display.dataPath ||
            this.mElementNode.animations.display.dataPath === "") {
            this.mEmitter.emit(ElementEditorEmitType.Resource_Loaded, false, "DisplayNode is empty");
            return;
        }
        this.clearResource();
        var val = this.mElementNode.animations.display;
        this.mScene.load.addListener(Phaser.Loader.Events.COMPLETE, this.imageLoaded, this);
        this.mScene.load.atlas(SPRITE_SHEET_KEY, path.join(this.mLocalHomePath, val.texturePath), // this.mLocalHomePath WEB_HOME_PATH
        path.join(this.mLocalHomePath, val.dataPath) // this.mLocalHomePath WEB_HOME_PATH
        ).on("loaderror", this.imageLoadError, this);
        Logger.getInstance().debug("loadResources ", path.join(this.mLocalHomePath, val.texturePath));
        this.mScene.load.start();
    };
    ElementEditorResourceManager.prototype.generateSpriteSheet = function (images) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this.mScene) {
                Logger.getInstance().warn("ResourceManager not inited");
                reject(null);
                return;
            }
            var imgCount = 0;
            for (var _i = 0, images_1 = images; _i < images_1.length; _i++) {
                var image = images_1[_i];
                // if (image.name === this.IMAGE_BLANK_KEY) continue;
                imgCount++;
                if (!_this.mScene.textures.exists(image.key)) {
                    _this.mScene.textures.addBase64(image.key, image.url);
                }
            }
            if (imgCount === 0) {
                Logger.getInstance().warn("no image data");
                reject(null);
                return;
            }
            var _imgs = [].concat(images);
            var onLoadFunc = function () {
                var allLoaded = true;
                _imgs.forEach(function (img) {
                    // if (img.name === this.IMAGE_BLANK_KEY) return;
                    if (!_this.mScene.textures.exists(img.key)) {
                        allLoaded = false;
                    }
                });
                if (!allLoaded)
                    return;
                var atlas = new Atlas();
                var packer = new MaxRectsPacker();
                packer.padding = 2;
                for (var _i = 0, _imgs_1 = _imgs; _i < _imgs_1.length; _i++) {
                    var image = _imgs_1[_i];
                    var f = _this.mScene.textures.getFrame(image.key, "__BASE");
                    packer.add(f.width, f.height, { name: image.key });
                }
                var _a = packer.bins[0], width = _a.width, height = _a.height;
                var canvas = _this.mScene.textures.createCanvas("GenerateSpriteSheet", width, height);
                packer.bins.forEach(function (bin) {
                    bin.rects.forEach(function (rect) {
                        canvas.drawFrame(rect.data.name, "__BASE", rect.x, rect.y);
                        atlas.addFrame(rect.data.name, rect);
                    });
                });
                var url = canvas.canvas.toDataURL("image/png", 1);
                canvas.destroy();
                // remove imgs
                _imgs.forEach(function (one) {
                    if (_this.mScene.textures.exists(one.key)) {
                        _this.mScene.textures.remove(one.key);
                        _this.mScene.textures.removeKey(one.key);
                    }
                });
                Logger.getInstance().debug("generate sprite sheet: ", url, atlas.toString());
                resolve({ url: url, json: atlas.toString() });
                // remove listener
                _this.mScene.textures.off("onload", onLoadFunc, _this, false);
            };
            _this.mScene.textures.on("onload", onLoadFunc, _this);
        });
    };
    /**
     * 解析sprite sheet
     */
    ElementEditorResourceManager.prototype.deserializeDisplay = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this.mScene.textures.exists(SPRITE_SHEET_KEY)) {
                reject([]);
            }
            else {
                var atlasTexture = _this.mScene.textures.get(SPRITE_SHEET_KEY);
                var frames_1 = atlasTexture.frames;
                var frameNames = atlasTexture.getFrameNames(false);
                var frame = null;
                var imgs = [];
                for (var _i = 0, frameNames_1 = frameNames; _i < frameNames_1.length; _i++) {
                    var frameName = frameNames_1[_i];
                    frame = frames_1[frameName];
                    var imgName = "NAME_ERROR";
                    var imgHash = frameName.split("?t=");
                    if (imgHash.length > 0)
                        imgName = imgHash[0];
                    var canvas = _this.mScene.textures.createCanvas("DeserializeSpriteSheet", frame.width, frame.height);
                    canvas.drawFrame(SPRITE_SHEET_KEY, frameName);
                    var url = canvas.canvas.toDataURL("image/png", 1);
                    imgs.push({ key: frameName, name: imgName, url: url });
                    canvas.destroy();
                }
                Logger.getInstance().debug("deserialize sprite sheet: ", imgs);
                resolve(imgs);
            }
        });
    };
    ElementEditorResourceManager.prototype.clearResource = function () {
        if (this.mScene.textures.exists(SPRITE_SHEET_KEY)) {
            this.mResourcesChangeListeners.forEach(function (listener) {
                listener.onResourcesCleared();
            });
            this.mScene.textures.remove(SPRITE_SHEET_KEY);
            this.mScene.textures.removeKey(SPRITE_SHEET_KEY);
            this.mScene.cache.json.remove(SPRITE_SHEET_KEY);
        }
    };
    ElementEditorResourceManager.prototype.destroy = function () {
        this.clearResource();
        this.mResourcesChangeListeners.length = 0;
    };
    ElementEditorResourceManager.prototype.imageLoaded = function () {
        if (!this.mScene.textures.exists(SPRITE_SHEET_KEY)) {
            return;
        }
        this.mScene.load.removeListener(Phaser.Loader.Events.COMPLETE, this.imageLoaded, this);
        this.mResourcesChangeListeners.forEach(function (listener) {
            listener.onResourcesLoaded();
        });
        // Logger.getInstance().debug("imageLoaded");
        this.mEmitter.emit(ElementEditorEmitType.Resource_Loaded, true, "DisplayNode load success");
    };
    ElementEditorResourceManager.prototype.imageLoadError = function () {
        this.mEmitter.emit(ElementEditorEmitType.Resource_Loaded, false, "DisplayNode load error");
    };
    return ElementEditorResourceManager;
}());
export default ElementEditorResourceManager;
//# sourceMappingURL=element.editor.resource.manager.js.map