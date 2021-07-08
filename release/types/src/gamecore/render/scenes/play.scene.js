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
import { BaseLayer, GroundLayer, PlayCamera, SurfaceLayer } from "baseRender";
import { MainUIScene } from "./main.ui.scene";
import { RoomScene } from "./room.scene";
import { Logger, LayerName, PlaySceneLoadState, SceneName } from "structure";
import { MotionManager } from "../input/motion.manager";
// 游戏正式运行用 Phaser.Scene
var PlayScene = /** @class */ (function (_super) {
    __extends_1(PlayScene, _super);
    function PlayScene(config) {
        var _this = _super.call(this, config || { key: SceneName.PLAY_SCENE }) || this;
        _this.cameraMovable = true;
        _this.loadState = PlaySceneLoadState.CREATING_SCENE;
        return _this;
    }
    PlayScene.prototype.preload = function () {
        // this.load.audio("click", Url.getRes("sound/click.mp3"));
        // this.load.audio("mine", Url.getRes("sound/mine.mp3"));
        _super.prototype.preload.call(this);
    };
    Object.defineProperty(PlayScene.prototype, "motionMgr", {
        get: function () {
            return this.motion;
        },
        enumerable: true,
        configurable: true
    });
    PlayScene.prototype.create = function () {
        this.loadState = PlaySceneLoadState.CREATING_ROOM;
        Logger.getInstance().debug("create playscene");
        var oldCamera = this.cameras.main;
        var _a = this.sys.scale, width = _a.width, height = _a.height;
        this.cameras.addExisting(new PlayCamera(0, 0, width, height, this.render.scaleRatio), true);
        this.cameras.remove(oldCamera);
        if (!this.game.scene.getScene(MainUIScene.name)) {
            this.game.scene.add(MainUIScene.name, MainUIScene, false);
        }
        var scene = this.game.scene.getScene(MainUIScene.name);
        if (!scene.scene.isActive()) {
            this.scene.launch(MainUIScene.name, {
                "render": this.render,
            });
            var sceneManager = this.render.sceneManager;
            sceneManager.bringToTop(SceneName.LOADING_SCENE);
        }
        else {
            this.render.initUI();
        }
        this.scene.sendToBack();
        // ======= render startPlay
        this.render.sceneManager.setMainScene(this);
        this.initMotion();
        this.render.camerasManager.startRoomPlay(this);
        // set layers
        // ==========背景层
        this.layerManager.addLayer(this, BaseLayer, LayerName.GROUNDCLICK, 1);
        this.layerManager.addLayer(this, BaseLayer, LayerName.GROUND2, 2);
        // ==========舞台层
        this.layerManager.addLayer(this, GroundLayer, LayerName.WALL, 2).setScale(this.render.scaleRatio);
        this.layerManager.addLayer(this, GroundLayer, LayerName.HANGING, 3).setScale(this.render.scaleRatio);
        this.layerManager.addLayer(this, GroundLayer, LayerName.GROUND, 4).setScale(this.render.scaleRatio);
        this.layerManager.addLayer(this, BaseLayer, LayerName.MIDDLE, 5).setScale(this.render.scaleRatio);
        this.layerManager.addLayer(this, GroundLayer, LayerName.FLOOR, 5).setScale(this.render.scaleRatio);
        this.layerManager.addLayer(this, SurfaceLayer, LayerName.SURFACE, 6).setScale(this.render.scaleRatio);
        this.layerManager.addLayer(this, SurfaceLayer, LayerName.DECORATE, 7).setScale(this.render.scaleRatio);
        this.layerManager.addLayer(this, BaseLayer, LayerName.ATMOSPHERE, 7);
        this.layerManager.addLayer(this, BaseLayer, LayerName.SCENEUI, 8);
        // ======= mainworker startPlay
        this.render.startRoomPlay();
        this.render.changeScene(this);
        _super.prototype.create.call(this);
    };
    PlayScene.prototype.update = function (time, delta) {
        this.render.updateRoom(time, delta);
        this.layerManager.update(time, delta);
        if (this.motion)
            this.motion.update(time, delta);
    };
    PlayScene.prototype.getKey = function () {
        return this.sys.config.key;
    };
    PlayScene.prototype.snapshot = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    Object.defineProperty(PlayScene.prototype, "loadState", {
        get: function () {
            return this.mLoadState;
        },
        set: function (val) {
            if (val === this.mLoadState)
                return;
            Logger.getInstance().debug("PlayScene change loadState: ", val);
            this.mLoadState = val;
            if (val === PlaySceneLoadState.LOAD_COMPOLETE) {
                this.render.hideLoading();
            }
        },
        enumerable: true,
        configurable: true
    });
    PlayScene.prototype.onRoomCreated = function () {
        this.loadState = PlaySceneLoadState.LOAD_COMPOLETE;
    };
    PlayScene.prototype.pauseMotion = function () {
        if (this.motion)
            this.motion.pauser();
    };
    PlayScene.prototype.resumeMotion = function () {
        if (this.motion)
            this.motion.resume();
    };
    PlayScene.prototype.enableCameraMove = function () {
        this.cameraMovable = true;
    };
    PlayScene.prototype.disableCameraMove = function () {
        this.cameraMovable = false;
        this.removePointerMoveHandler();
    };
    PlayScene.prototype.initMotion = function () {
        this.motion = new MotionManager(this.render);
        this.motion.setScene(this);
    };
    PlayScene.prototype.initListener = function () {
        this.input.on("pointerdown", this.onPointerDownHandler, this);
        this.input.on("pointerup", this.onPointerUpHandler, this);
    };
    PlayScene.prototype.onPointerDownHandler = function (pointer, currentlyOver) {
        if (!this.cameraMovable)
            return;
        this.render.emitter.emit("pointerScene", SceneName.PLAY_SCENE, currentlyOver);
        this.addPointerMoveHandler();
    };
    PlayScene.prototype.onPointerUpHandler = function (pointer) {
        if (!this.cameraMovable)
            return;
        this.removePointerMoveHandler();
    };
    PlayScene.prototype.addPointerMoveHandler = function () {
        this.input.on("pointermove", this.onPointerMoveHandler, this);
        this.input.on("gameout", this.onGameOutHandler, this);
    };
    PlayScene.prototype.removePointerMoveHandler = function () {
        this.input.off("pointermove", this.onPointerMoveHandler, this);
        this.input.off("gameout", this.onGameOutHandler, this);
        if (this.render.camerasManager.moving) {
            this.render.syncCameraScroll();
            this.render.camerasManager.moving = false;
        }
    };
    PlayScene.prototype.onPointerMoveHandler = function (pointer) {
        if (!this.render.camerasManager.targetFollow) {
            this.render.camerasManager.offsetScroll(pointer.prevPosition.x - pointer.position.x, pointer.prevPosition.y - pointer.position.y);
        }
    };
    PlayScene.prototype.onGameOutHandler = function () {
        this.removePointerMoveHandler();
    };
    return PlayScene;
}(RoomScene));
export { PlayScene };
//# sourceMappingURL=play.scene.js.map