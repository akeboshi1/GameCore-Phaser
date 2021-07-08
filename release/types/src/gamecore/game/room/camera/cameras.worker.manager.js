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
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_editor, op_virtual_world } from "pixelpai_proto";
import { BlockIndex } from "utils";
import { Logger, LogicPos, LogicRectangle, LogicRectangle45 } from "structure";
import { BlockIndexManager } from "../block/block.index.manager";
var CamerasManager = /** @class */ (function (_super) {
    __extends_1(CamerasManager, _super);
    function CamerasManager(mGame, mRoomService) {
        var _this = _super.call(this) || this;
        _this.mGame = mGame;
        _this.mRoomService = mRoomService;
        _this.syncDirty = false;
        _this.m_blockWidth = 300; // 暂定
        _this.m_blockHeight = 150; // 暂定
        _this.MINI_VIEW_SIZE = 50;
        _this.VIEW_PORT_SIZE = 50;
        _this.viewPort = new LogicRectangle();
        _this.miniViewPort = new LogicRectangle();
        _this.zoom = 1;
        _this.syncTime = 0;
        _this.mInitialize = false;
        _this.zoom = _this.mGame.scaleRatio;
        _this.mBlockManager = new BlockIndexManager(_this.mRoomService);
        return _this;
    }
    Object.defineProperty(CamerasManager.prototype, "initialize", {
        get: function () {
            return this.mInitialize;
        },
        set: function (val) {
            this.mInitialize = val;
            this.syncDirty = true;
        },
        enumerable: true,
        configurable: true
    });
    CamerasManager.prototype.getViewPort = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.mGame.peer.render.getWorldView().then(function (obj) {
                var worldView = obj;
                if (!worldView)
                    return;
                var width = worldView.width / _this.zoom;
                var height = worldView.height / _this.zoom;
                _this.viewPort.x = worldView.x / _this.zoom - width * 0.5;
                _this.viewPort.y = worldView.y / _this.zoom - height * 0.5;
                _this.viewPort.width = worldView.width / _this.zoom + width;
                _this.viewPort.height = worldView.height / _this.zoom + height;
                resolve(_this.viewPort);
            });
        });
    };
    CamerasManager.prototype.getMiniViewPort = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.mGame.peer.render.getWorldView().then(function (obj) {
                var worldView = obj;
                _this.miniViewPort.x = worldView.x / _this.zoom + (worldView.width / _this.zoom - _this.miniViewPort.width >> 1);
                _this.miniViewPort.y = worldView.y / _this.zoom + (worldView.height / _this.zoom - _this.miniViewPort.height >> 1);
                var pos = _this.mRoomService.transformTo45(new LogicPos(_this.miniViewPort.x + (_this.miniViewPort.width >> 1), _this.miniViewPort.y));
                resolve(new LogicRectangle45(pos.x, pos.y, _this.MINI_VIEW_SIZE, _this.MINI_VIEW_SIZE));
            });
        });
    };
    CamerasManager.prototype.syncToEditor = function () {
        var cameraView = this.mGame.peer.render.getWorldView();
        var pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_RESET_CAMERA);
        var content = pkt.content;
        content.x = cameraView.x;
        content.y = cameraView.y;
        content.width = cameraView.width;
        content.height = cameraView.height;
        this.connection.send(pkt);
    };
    CamerasManager.prototype.centerCameas = function () {
    };
    CamerasManager.prototype.syncCamera = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cameraView, packet, size;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mGame.peer.render.getWorldView()];
                    case 1:
                        cameraView = _a.sent();
                        packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_RESET_CAMERA_SIZE);
                        size = packet.content;
                        // TODO zoom统一使用一个
                        size.width = cameraView.width / this.zoom;
                        size.height = cameraView.height / this.zoom;
                        this.connection.send(packet);
                        return [2 /*return*/];
                }
            });
        });
    };
    CamerasManager.prototype.syncCameraScroll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cameraView, width, height, x, y;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.mInitialize)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.mGame.peer.render.getWorldView()];
                    case 1:
                        cameraView = _a.sent();
                        if (!cameraView) {
                            Logger.getInstance().error("no cameraView");
                            return [2 /*return*/];
                        }
                        width = cameraView.width / this.zoom;
                        height = cameraView.height / this.zoom;
                        x = cameraView.x / this.zoom;
                        y = cameraView.y / this.zoom;
                        this.mBlockManager.checkBlockIndex({ x: x, y: y, width: width, height: height });
                        return [2 /*return*/];
                }
            });
        });
    };
    CamerasManager.prototype.feachAllElement = function () {
        var size = this.mGame.roomManager.currentRoom.roomSize;
        var tileWidth = size.tileWidth;
        var tileHeight = size.tileHeight;
        var blockWidth = this.m_blockWidth;
        var blockHeight = this.m_blockHeight;
        var cols = size.cols;
        var rows = size.rows;
        var widLen = Math.ceil(size.sceneWidth / blockWidth);
        var heiLen = Math.ceil(size.sceneHeight / blockHeight);
        var pointerList = [];
        var offset = rows * (tileWidth / 2);
        for (var i = 0; i < widLen + 1; i++) {
            for (var j = 0; j < heiLen + 1; j++) {
                pointerList.push({ x: i * blockWidth - offset, y: j * blockHeight, width: blockWidth, height: blockHeight });
            }
        }
        // 检查4个定点
        var blockIndex = new BlockIndex().getBlockIndexs(pointerList, size);
        var pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_UPDATE_HOT_BLOCK);
        var content = pkt.content;
        content.blockIndex = blockIndex;
        this.connection.send(pkt);
    };
    CamerasManager.prototype.resetCameraSize = function (width, height) {
        if (!this.connection) {
            Logger.getInstance().error("connection is undefined");
            return;
        }
        this.syncCamera();
    };
    CamerasManager.prototype.update = function (time, delta) {
        if (!this.syncDirty || !this.mInitialize) {
            return;
        }
        // 除了客户端移动镜头，后端也会改变镜头位置
        this.syncTime += delta;
        if (this.syncTime > 1000) {
            this.syncTime = 0;
            this.syncCameraScroll();
            this.syncDirty = false;
        }
    };
    CamerasManager.prototype.destroy = function () {
        this.mInitialize = false;
        this.preCamerasList.length = 0;
        this.preCamerasList = null;
    };
    CamerasManager.prototype.startFollow = function (target, effect) {
        this.target = target;
        this.mGame.renderPeer.cameraFollow(target, effect);
    };
    CamerasManager.prototype.stopFollow = function () {
        this.target = undefined;
        this.mGame.renderPeer.stopFollow();
    };
    CamerasManager.prototype.setCamerasScroll = function (x, y, effect) {
        this.mGame.renderPeer.setCamerasScroll(x, y, effect);
    };
    Object.defineProperty(CamerasManager.prototype, "connection", {
        get: function () {
            if (!this.mRoomService) {
                Logger.getInstance().error("room service is undefined");
                return;
            }
            return this.mGame.connection;
        },
        enumerable: true,
        configurable: true
    });
    return CamerasManager;
}(PacketHandler));
export { CamerasManager };
//# sourceMappingURL=cameras.worker.manager.js.map