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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Logger, Fit } from "structure";
import { DynamicImage } from "../ui/components/dynamic.image";
var BlockManager = /** @class */ (function () {
    function BlockManager(scenery, render) {
        this.render = render;
        this.mRows = 1;
        this.mCols = 1;
        this.mSceneName = "";
        this.mGrids = [];
        this.mScenery = scenery;
        this.mUris = scenery.uris;
        this.mCameras = render.camerasManager;
        this.mMainCamera = this.mCameras.camera;
        this._bound = this.mMainCamera.getBounds();
        this.mScaleRatio = this.render.scaleRatio;
        this.setSize(scenery.width, scenery.height);
        var playScene = render.getMainScene();
        if (!playScene) {
            Logger.getInstance().fatal(BlockManager.name + " scene does not exist");
            return;
        }
        this.mSceneName = "SkyBoxScene" + ("_" + scenery.id);
        // 注册skyboxscene，必须存在，否则获取不到skyboxscene
        // const scene = this.render.game.scene.add(this.mSceneName, SkyBoxScene, false);
        // playScene.scene.launch(this.mSceneName, this);
        var sceneManager = this.render.sceneManager;
        if (!sceneManager) {
            Logger.getInstance().fatal("scene manager does not exist");
        }
        sceneManager.launchScene(sceneManager.getMainScene(), this.mSceneName, "SkyBoxScene", this);
        this.updateDepth();
    }
    BlockManager.prototype.startPlay = function (scene) {
        var _this = this;
        this.scene = scene;
        this.initBlock();
        if (this.mStateMap) {
            this.mStateMap.forEach(function (state) { return _this.handlerState(state); });
        }
    };
    BlockManager.prototype.check = function (time, delta) {
        var worldView = this.mMainCamera.worldView;
        var viewPort = new Phaser.Geom.Rectangle(worldView.x - worldView.width / 2, worldView.y - worldView.height / 2, worldView.width * 2, worldView.height * 2);
        for (var _i = 0, _a = this.mGrids; _i < _a.length; _i++) {
            var block = _a[_i];
            block.checkCamera(Phaser.Geom.Intersects.RectangleToRectangle(viewPort, block.rectangle));
        }
    };
    BlockManager.prototype.update = function (scenery) {
        this.mScenery = scenery;
        this.mUris = scenery.uris;
        this.setSize(scenery.width, scenery.height);
        this.initBlock();
        this.updateDepth();
    };
    BlockManager.prototype.setSize = function (imageW, imageH, gridW, gridH) {
        // TODO 部分场景超过大小未分块
        if (this.mUris.length === 0) {
            return;
        }
        var cols = 1;
        var rows = 1;
        if (this.mUris.length > 1 || this.mUris[0].length > 1) {
            cols = imageW / 1024;
            rows = imageH / 1024;
        }
        this.mCols = Math.round(cols);
        this.mRows = Math.round(rows);
        this.mGridWidth = imageW / this.mCols;
        this.mGridHeight = imageH / this.mRows;
    };
    BlockManager.prototype.resize = function (width, height) {
        if (!this.scene || !this.mMainCamera) {
            return;
        }
        var camera = this.scene.cameras.main;
        if (!camera) {
            return;
        }
        this.mScaleRatio = this.render.scaleRatio;
        this.updatePosition();
        this._bound = this.mMainCamera.getBounds();
        camera.setBounds(this._bound.x, this._bound.y, this._bound.width, this._bound.height);
        for (var _i = 0, _a = this.mGrids; _i < _a.length; _i++) {
            var grid = _a[_i];
            grid.setScaleRatio(this.mScaleRatio);
            grid.resize(width, height);
        }
    };
    BlockManager.prototype.updateScale = function (val) {
        this.mContainer.setScale(val);
        for (var _i = 0, _a = this.mGrids; _i < _a.length; _i++) {
            var grid = _a[_i];
            grid.setScaleRatio(val);
        }
        this.updatePosition();
    };
    BlockManager.prototype.getLayer = function () {
        return this.mContainer;
    };
    BlockManager.prototype.updatePosition = function () {
        return __awaiter(this, void 0, void 0, function () {
            var offset, loc, _i, _a, block;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        offset = this.mScenery.offset;
                        return [4 /*yield*/, this.fixPosition({ x: offset.x, y: offset.y })];
                    case 1:
                        loc = _b.sent();
                        this.mContainer.setPosition(loc.x, loc.y);
                        for (_i = 0, _a = this.mGrids; _i < _a.length; _i++) {
                            block = _a[_i];
                            block.updatePosition();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    BlockManager.prototype.destroy = function () {
        if (this.render && this.render.game) {
            this.render.game.scene.remove(this.mSceneName);
        }
        this.mGrids.length = 0;
    };
    BlockManager.prototype.setState = function (state) {
        this.handlerState(state);
    };
    BlockManager.prototype.playSkyBoxAnimation = function (packet) {
        return __awaiter(this, void 0, void 0, function () {
            var id, targets, duration, reset, resetDuration, targetPos, resetPos;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = packet.id, targets = packet.targets, duration = packet.duration, reset = packet.reset, resetDuration = packet.resetDuration;
                        if (id === undefined || targets === undefined || duration === undefined) {
                            return [2 /*return*/];
                        }
                        if (!this.scene || !this.mContainer) {
                            return [2 /*return*/];
                        }
                        if (id !== this.mScenery.id) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.fixPosition(targets)];
                    case 1:
                        targetPos = _a.sent();
                        return [4 /*yield*/, this.fixPosition(reset)];
                    case 2:
                        resetPos = _a.sent();
                        this.move(this.mContainer, targetPos, duration, resetPos, resetDuration);
                        return [2 /*return*/];
                }
            });
        });
    };
    BlockManager.prototype.handlerState = function (state) {
        for (var _i = 0, state_1 = state; _i < state_1.length; _i++) {
            var prop = state_1[_i];
            if (this.mScenery.id === prop.id) {
                this.playSkyBoxAnimation(prop);
            }
        }
    };
    BlockManager.prototype.updateDepth = function () {
        if (!this.render) {
            return;
        }
        var playScene = this.render.getMainScene();
        if (!this.mScenery || !playScene) {
            Logger.getInstance().fatal("scene does not exist");
            return;
        }
        var scene = this.render.game.scene.getScene(this.mSceneName);
        if (!scene) {
            return;
        }
        if (this.mScenery.depth < 0) {
            scene.scene.sendToBack(this.mSceneName);
        }
        else {
            scene.scene.moveAbove(playScene.sys.settings.key, this.mSceneName);
        }
    };
    BlockManager.prototype.initBlock = function () {
        this.clear();
        this.mContainer = this.scene.add.container(0, 0);
        this.mContainer.setScale(this.render.scaleRatio);
        var len = this.mUris.length;
        // TODO
        if (this.mScenery.fit === Fit.Repeat) {
            // TODO
            // const room = <Room>this.mRoom;
            // const { width, height } = room.getMaxScene();
            // const rows = Math.floor(width / this.mScenery.width);
            // const cols = Math.floor(height / this.mScenery.height);
            // for (let i = 0; i < rows; i++) {
            //   for (let j = 0; j < cols; j++) {
            //     const block = new Block(this.scene, this.mUris[0][0], this.mScaleRatio);
            //     block.setRectangle(j * this.mGridWidth, i * this.mGridHeight, this.mGridWidth, this.mGridHeight);
            //     this.mGrids.push(block);
            //   }
            // }
        }
        else {
            for (var i = 0; i < len; i++) {
                var l = this.mUris[i].length;
                for (var j = 0; j < l; j++) {
                    var block = new Block(this.scene, this.mUris[i][j], this.mScaleRatio, this.render.url);
                    block.setRectangle(j * this.mGridWidth, i * this.mGridHeight, this.mGridWidth, this.mGridHeight);
                    this.mGrids.push(block);
                }
            }
        }
        this.mContainer.add(this.mGrids);
        this.initCamera();
    };
    BlockManager.prototype.move = function (targets, props, duration, resetProps, resetDuration) {
        var _this = this;
        if (this.tween) {
            this.tween.stop();
            this.tween.removeAllListeners();
        }
        this.tween = this.scene.tweens.add({
            targets: targets,
            props: props,
            duration: duration,
            loop: -1,
            onUpdate: function () {
                for (var _i = 0, _a = _this.mGrids; _i < _a.length; _i++) {
                    var block = _a[_i];
                    block.updatePosition();
                }
            }
        });
        if (resetProps) {
            this.tween.once("loop", function () {
                if (resetProps) {
                    targets.x = resetProps.x;
                    targets.y = resetProps.y;
                }
                _this.tween.stop();
                _this.move(targets, props, resetDuration);
            });
        }
    };
    BlockManager.prototype.initCamera = function () {
        var camera = this.scene.cameras.main;
        if (this.mCameras) {
            camera.setBounds(this._bound.x, this._bound.y, this._bound.width, this._bound.height);
            this.updatePosition();
            camera.setScroll(this.mMainCamera.scrollX, this.mMainCamera.scrollY);
            this.mCameras.addCamera(camera);
        }
    };
    BlockManager.prototype.clear = function () {
        for (var _i = 0, _a = this.mGrids; _i < _a.length; _i++) {
            var grid = _a[_i];
            grid.destroy();
        }
        this.mGrids.length = 0;
        if (this.mContainer) {
            this.mContainer.destroy(true);
        }
    };
    Object.defineProperty(BlockManager.prototype, "scenery", {
        get: function () {
            return this.mScenery;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BlockManager.prototype, "scaleRatio", {
        get: function () {
            return this.mScaleRatio;
        },
        enumerable: true,
        configurable: true
    });
    BlockManager.prototype.fixPosition = function (props) {
        return __awaiter(this, void 0, void 0, function () {
            var offset;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!props)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.getOffset()];
                    case 1:
                        offset = _a.sent();
                        if (props.x !== undefined) {
                            props.x = (offset.x + props.x) * this.render.scaleRatio;
                        }
                        if (props.y !== undefined) {
                            props.y = (offset.y + props.y) * this.render.scaleRatio;
                        }
                        return [2 /*return*/, props];
                }
            });
        });
    };
    BlockManager.prototype.getOffset = function () {
        return __awaiter(this, void 0, void 0, function () {
            var os, x, y, size, _a, width, height;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        os = { x: 0, y: 0 };
                        x = 0;
                        y = 0;
                        if (!this.mScenery) return [3 /*break*/, 2];
                        if (!(this.mScenery.fit === Fit.Center)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.render.getCurrentRoomSize()];
                    case 1:
                        size = _b.sent();
                        _a = this.mScenery, width = _a.width, height = _a.height;
                        x = -width >> 1;
                        y = size.sceneHeight - height >> 1;
                        _b.label = 2;
                    case 2: return [2 /*return*/, Promise.resolve({ x: x, y: y })];
                }
            });
        });
    };
    return BlockManager;
}());
export { BlockManager };
var Block = /** @class */ (function (_super) {
    __extends_1(Block, _super);
    function Block(scene, key, scale, url) {
        var _this = _super.call(this, scene, 0, 0) || this;
        _this.url = url;
        _this.mLoaded = false;
        _this.mInCamera = false;
        _this.mKey = key;
        _this.mScale = scale;
        _this.setOrigin(0);
        return _this;
        // this.mRectangle = new Phaser.Geom.Rectangle(this.x, this.y, 1, 1);
    }
    Block.prototype.checkCamera = function (val) {
        if (this.mInCamera !== val) {
            this.mInCamera = val;
            this.visible = val;
            if (this.mLoaded) {
                // TODO
                // this.setActive(val);
            }
            else {
                this.load(this.url.getOsdRes(this.mKey));
            }
        }
    };
    Block.prototype.setRectangle = function (x, y, width, height) {
        this.x = x;
        this.y = y;
        this.setSize(width, height);
        var parentX = (this.parentContainer ? this.parentContainer.x : 0);
        var parentY = (this.parentContainer ? this.parentContainer.y : 0);
        this.mRectangle = new Phaser.Geom.Rectangle(x * this.mScale + parentX, y * this.mScale + parentY, width * this.mScale, height * this.mScale);
    };
    Block.prototype.updatePosition = function () {
        if (this.mRectangle) {
            this.mRectangle.x = this.x * this.mScale + (this.parentContainer ? this.parentContainer.x : 0);
            this.mRectangle.y = this.y * this.mScale + (this.parentContainer ? this.parentContainer.y : 0);
        }
    };
    Block.prototype.resize = function (width, height) {
        // const camera = this.scene.cameras.main;
        // this.mRectangle = new Phaser.Geom.Rectangle(this.x * this.mScale + camera.x, this.y * this.mScale + camera.y, this.width * this.mScale, this.height * this.mScale);
        this.setRectangle(this.x, this.y, this.width, this.height);
    };
    Block.prototype.setScaleRatio = function (val) {
        this.mScale = val;
    };
    Object.defineProperty(Block.prototype, "rectangle", {
        get: function () {
            return this.mRectangle;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Block.prototype, "key", {
        get: function () {
            return this.mKey;
        },
        enumerable: true,
        configurable: true
    });
    Block.prototype.onLoadComplete = function (file) {
        _super.prototype.onLoadComplete.call(this, file);
        if (this.texture) {
            this.mLoaded = true;
            this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
            // this.mRectangle.setSize(this.width, this.height);
        }
    };
    return Block;
}(DynamicImage));
//# sourceMappingURL=block.manager.js.map