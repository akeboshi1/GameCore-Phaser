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
import { Logger } from "structure";
var TextureSprite = /** @class */ (function (_super) {
    __extends_1(TextureSprite, _super);
    function TextureSprite(scene, dpr, auto, timeFrame, times) {
        var _this = _super.call(this, scene) || this;
        _this.isPlaying = false;
        _this.indexed = 0;
        _this.dpr = dpr;
        _this.auto = auto || false;
        _this.setAniData(times, timeFrame);
        return _this;
    }
    TextureSprite.prototype.load = function (value, compl, error) {
        if (!this.scene) {
            Logger.getInstance().fatal("Create failed does not exist");
            return;
        }
        this.compl = compl;
        this.error = error;
        this.mUrls = value;
        this.loadUrls = [];
        this.errorUrls = [];
        for (var _i = 0, _a = this.mUrls; _i < _a.length; _i++) {
            var url = _a[_i];
            if (!this.scene.textures.exists(url)) {
                this.scene.load.image(url);
                this.loadUrls.push(url);
            }
        }
        if (this.loadUrls.length > 0) {
            this.scene.load.on(Phaser.Loader.Events.FILE_COMPLETE, this.onLoadComplete, this);
            this.scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onLoadError, this);
            this.scene.load.start();
        }
        else {
            this.onLoadComplete();
        }
    };
    TextureSprite.prototype.setAniData = function (times, timeFrame) {
        this.times = times || -1;
        this.timeFrame = timeFrame || 30;
        this.tempTimes = this.times;
    };
    TextureSprite.prototype.play = function (force) {
        var _this = this;
        if (force) {
            if (this.timerID) {
                clearTimeout(this.timerID);
            }
            this.indexed = 0;
            this.tempTimes = this.times;
        }
        else if (this.isPlaying)
            return;
        var excute = function () {
            _this.frameImg.setTexture(_this.mUrls[_this.indexed]);
            _this.indexed++;
            if (_this.indexed === _this.mUrls.length) {
                _this.indexed = 0;
                if (_this.times > 0) {
                    _this.tempTimes--;
                    if (_this.tempTimes === 0) {
                        _this.playEnd();
                        return;
                    }
                }
            }
            _this.timerID = setTimeout(function () {
                excute();
            }, _this.timeFrame);
        };
        excute();
    };
    TextureSprite.prototype.stop = function () {
        if (this.isPlaying) {
            clearTimeout(this.timerID);
            this.playEnd();
        }
    };
    TextureSprite.prototype.destroy = function (fromScene) {
        if (fromScene === void 0) { fromScene = false; }
        this.compl = undefined;
        this.error = undefined;
        this.mUrls = undefined;
        this.loadUrls = undefined;
        this.errorUrls = undefined;
        if (this.scene) {
            this.scene.load.off(Phaser.Loader.Events.FILE_COMPLETE, this.onLoadComplete, this);
            this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onLoadError, this);
        }
        _super.prototype.destroy.call(this, fromScene);
    };
    Object.defineProperty(TextureSprite.prototype, "playing", {
        get: function () {
            return this.isPlaying;
        },
        enumerable: true,
        configurable: true
    });
    TextureSprite.prototype.playEnd = function () {
        this.isPlaying = false;
        this.tempTimes = this.times;
        this.timerID = undefined;
        this.indexed = 0;
        this.frameImg.setTexture(this.mUrls[this.indexed]);
    };
    TextureSprite.prototype.onLoadComplete = function (file) {
        var index = this.loadUrls.indexOf(file);
        if (index !== -1) {
            this.loadUrls.splice(index, 1);
            if (this.loadUrls.length === 0) {
                if (this.auto)
                    this.play();
                if (this.compl) {
                    this.compl.run();
                    this.compl = undefined;
                }
                this.scene.load.off(Phaser.Loader.Events.FILE_COMPLETE, this.onLoadComplete, this);
                this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onLoadError, this);
            }
        }
    };
    TextureSprite.prototype.onLoadError = function (file) {
        var index = this.loadUrls.indexOf(file.url);
        if (index !== -1) {
            this.loadUrls.splice(index, 1);
            this.errorUrls.push(file.url);
            if (this.loadUrls.length === 0) {
                this.scene.load.off(Phaser.Loader.Events.FILE_COMPLETE, this.onLoadComplete, this);
                this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onLoadError, this);
                if (this.error) {
                    this.error.runWith(this.errorUrls);
                    this.error = undefined;
                }
            }
        }
    };
    return TextureSprite;
}(Phaser.GameObjects.Container));
export { TextureSprite };
//# sourceMappingURL=texture.sprite.js.map