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
import { PacketHandler } from "net-socket-packet";
import { op_client } from "pixelpai_proto";
import { EventType, GameState } from "structure";
import { UIType } from "./basic/basic.mediator";
import { UILayoutType } from "./ui.mediator.type";
var UIManager = /** @class */ (function (_super) {
    __extends_1(UIManager, _super);
    function UIManager(game) {
        var _this = _super.call(this) || this;
        _this.game = game;
        _this.isshowMainui = false;
        // ==== about checkUIState
        _this.mNoneUIMap = new Map();
        _this.mSceneUIMap = new Map();
        _this.mNormalUIMap = new Map();
        _this.mPopUIMap = new Map();
        _this.mTipUIMap = new Map();
        _this.mMonopolyUIMap = new Map();
        _this.mActivityUIMap = new Map();
        _this.mUILayoutMap = new Map();
        // 用于记录功能ui打开的顺序,最多2个
        _this.mShowuiList = [];
        _this.mLoadingCache = [];
        if (!_this.mMedMap) {
            _this.mMedMap = new Map();
        }
        _this.initUILayoutType();
        return _this;
    }
    UIManager.prototype.getMed = function (name) {
        return this.mMedMap.get(name);
    };
    UIManager.prototype.recover = function () {
        this.mMedMap.forEach(function (mediator) {
            if (mediator && mediator.isShow()) {
                mediator.hide();
            }
        });
    };
    UIManager.prototype.addPackListener = function () {
        var connection = this.game.connection;
        if (!connection) {
            return;
        }
        connection.addPacketListener(this);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI, this.handleShowUI);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI, this.handleUpdateUI);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CLOSE_UI, this.handleCloseUI);
        // TODO 这2条协议合并到SHOW_UI和CLOS_UI
        // this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_CREATE_ROLE_UI, this.onHandleShowCreateRoleUI);
        // this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_SHOW_CREATE_ROLE_UI, this.onHandleShowCreateRoleUI);
        // this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_CLOSE_CREATE_ROLE_UI, this.onHandleCloseCreateRoleUI);
        // this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_REFRESH_ACTIVE_UI, this.onUIStateHandler);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_FORCE_OFFLINE, this.onForceOfflineHandler);
        this.game.emitter.on(EventType.SCENE_SHOW_UI, this.onOpenUIMediator, this);
        this.game.emitter.on(EventType.SCENE_SHOW_MAIN_UI, this.showMainUI, this);
    };
    UIManager.prototype.removePackListener = function () {
        var connection = this.game.connection;
        if (!connection) {
            return;
        }
        connection.removePacketListener(this);
        this.game.emitter.off(EventType.SCENE_SHOW_UI, this.onOpenUIMediator, this);
        this.game.emitter.off(EventType.SCENE_SHOW_MAIN_UI, this.showMainUI, this);
    };
    UIManager.prototype.showMainUI = function (hideNames) {
        if (this.mUIStateData) {
            this.updateUIState(this.mUIStateData);
        }
        this.mMedMap.forEach(function (mediator) {
            if (mediator.isSceneUI() && !mediator.isShow()) {
                if (!hideNames || hideNames.indexOf(mediator.key) === -1)
                    mediator.show();
            }
        });
        for (var _i = 0, _a = this.mLoadingCache; _i < _a.length; _i++) {
            var oneCache = _a[_i];
            this.showMed(oneCache.name, oneCache);
        }
        this.mLoadingCache.length = 0;
        this.isshowMainui = true;
    };
    // public showDecorateUI() {
    //     this.mMedMap.forEach((mediator: any) => {
    //         if (mediator.isSceneUI() && !mediator.isShow()) {
    //             mediator.show();
    //         }
    //     });
    // }
    UIManager.prototype.showMed = function (type, param) {
        if (!this.mMedMap) {
            this.mMedMap = new Map();
        }
        type = this.getPanelNameByAlias(type);
        var className = type + "Mediator";
        var mediator = this.mMedMap.get(type);
        if (!mediator) {
            // const path: string = `./${type}/${type}Mediator`;
            var ns = require("./" + type + "/" + className);
            mediator = new ns[className](this.game);
            if (!mediator) {
                // todo 处理引导
                this.game.peer.render.showPanel(type, param);
                // Logger.getInstance().error(`error ${type} no panel can show!!!`);
                return;
            }
            this.mMedMap.set(type, mediator);
            // mediator.setName(type);
        }
        // if (mediator.showing) return;
        if (param)
            mediator.setParam(param);
        if (mediator.isShow())
            return;
        mediator.show(param);
    };
    UIManager.prototype.updateMed = function (type, param) {
        if (!this.mMedMap) {
            return;
        }
        var name = "" + type;
        var mediator = this.mMedMap.get(name);
        if (!mediator) {
            // Logger.getInstance().error(`error ${type} no panel can show!!!`);
            return;
        }
        if (param)
            mediator.setParam(param);
        mediator.update(param);
    };
    UIManager.prototype.hideMed = function (type) {
        if (!this.mMedMap) {
            return;
        }
        type = this.getPanelNameByAlias(type);
        var medName = "" + type;
        var mediator = this.mMedMap.get(medName);
        if (!mediator) {
            // Logger.getInstance().error(`error ${type} no panel can show!!!`);
            return;
        }
        if (!mediator.isShow())
            return;
        mediator.hide();
    };
    UIManager.prototype.showExistMed = function (type, extendName) {
        if (extendName === void 0) { extendName = ""; }
        if (!this.mMedMap) {
            return;
        }
        type = this.getPanelNameByAlias(type);
        var className = type + extendName;
        var mediator = this.mMedMap.get(type);
        if (mediator)
            mediator.show();
    };
    UIManager.prototype.getUIStateData = function (name) {
        if (!this.mUIStateData)
            return null;
        var arr = [];
        for (var _i = 0, _a = this.mUIStateData.ui; _i < _a.length; _i++) {
            var data = _a[_i];
            var tagName = data.name.split(".")[0];
            var paneName = this.getPanelNameByAlias(tagName);
            if (paneName === name) {
                arr.push(data);
            }
        }
        return arr;
    };
    UIManager.prototype.checkUIState = function (medName, show) {
        var mediator = this.mMedMap.get(medName);
        if (!mediator)
            return;
        var uiType = mediator.UIType;
        var deskBoo = this.game.peer.isPlatform_PC();
        var map;
        switch (uiType) {
            case UIType.None:
                map = this.mNoneUIMap;
                break;
            case UIType.Scene:
                map = this.mSceneUIMap;
                this.checkSceneUImap(show, medName);
                break;
            case UIType.Normal:
                map = this.mNormalUIMap;
                // pc端场景ui无需收进，但是功能ui可以共存，需要调整位置
                if (deskBoo) {
                    this.checkNormalUITween(show, medName);
                }
                else {
                    this.checkBaseUImap(show);
                }
                break;
            case UIType.Monopoly:
                map = this.mMonopolyUIMap;
                this.checkBaseUImap(show);
                this.checkNormalUImap(show);
                this.chekcTipUImap(show);
                break;
            case UIType.Tips:
                map = this.mTipUIMap;
                break;
            case UIType.Pop:
                map = this.mPopUIMap;
                break;
            case UIType.Activity:
                map = this.mActivityUIMap;
                break;
        }
        if (map)
            map.set(medName, mediator);
    };
    /**
     * 根据面板Key更新UI状态
     * @param panel Panel key
     */
    UIManager.prototype.refrehActiveUIState = function (panel) {
        var states = this.getUIStateData(panel);
        if (!states)
            return;
        for (var _i = 0, states_1 = states; _i < states_1.length; _i++) {
            var state = states_1[_i];
            this.updateUI(state);
        }
    };
    UIManager.prototype.destroy = function () {
        this.removePackListener();
        if (this.mMedMap) {
            this.mMedMap.forEach(function (basicMed) {
                if (basicMed) {
                    basicMed.destroy();
                    basicMed = null;
                }
            });
            this.mMedMap.clear();
            this.mMedMap = null;
        }
        if (this.mUIStateData)
            this.mUIStateData = undefined;
        this.isshowMainui = false;
    };
    UIManager.prototype.onForceOfflineHandler = function (packet) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.game.peer.state.key === GameState.ChangeGame)
                    return [2 /*return*/];
                this.game.gameStateManager.startState(GameState.OffLine);
                this.game.peer.render.showAlert("common.offline", true).then(function () {
                    _this.game.peer.render.hidden();
                });
                return [2 /*return*/];
            });
        });
    };
    UIManager.prototype.updateUIState = function (data) {
        for (var _i = 0, _a = data.ui; _i < _a.length; _i++) {
            var ui = _a[_i];
            this.updateUI(ui);
        }
    };
    UIManager.prototype.updateUI = function (ui) {
        var tag = ui.name;
        var paneltags = tag.split(".");
        var panelName = this.getPanelNameByAlias(paneltags[0]);
        if (panelName) {
            var mediator = this.mMedMap.get(panelName);
            if (mediator) {
                if (paneltags.length === 1) {
                    if (ui.visible || ui.visible === undefined) {
                        if (mediator.isSceneUI())
                            this.showMed(panelName);
                    }
                    else {
                        this.hideMed(panelName);
                    }
                }
                else {
                    this.game.peer.render.updateUIState(panelName, ui);
                }
            }
        }
    };
    UIManager.prototype.getMediatorClass = function (type) {
        var className = type + "Mediator";
        return require("./" + type + "/" + className);
    };
    UIManager.prototype.handleShowUI = function (packet) {
        var ui = packet.content;
        // TODO 根据远程scene状态缓存命令
        if (this.game.roomManager.currentRoom && !this.game.roomManager.currentRoom.isLoading) {
            this.showMed(ui.name, ui);
        }
        else {
            this.mLoadingCache.push(ui);
        }
    };
    UIManager.prototype.handleUpdateUI = function (packet) {
        var ui = packet.content;
        // TODO 根据远程scene状态缓存命令
        if (this.game.roomManager.currentRoom && !this.game.roomManager.currentRoom.isLoading) {
            this.updateMed(ui.name, ui);
        }
    };
    UIManager.prototype.handleCloseUI = function (packet) {
        var ui = packet.content;
        // TODO 根据远程scene状态缓存命令
        if (this.game.roomManager.currentRoom && !this.game.roomManager.currentRoom.isLoading) {
            this.hideMed(ui.name);
        }
        else {
            var idx = this.mLoadingCache.findIndex(function (x) { return x.name === ui.name; });
            if (idx >= 0) {
                this.mLoadingCache.splice(idx, 1);
            }
        }
    };
    UIManager.prototype.getPanelNameByAlias = function (alias) {
        switch (alias) {
            case "MessageBox":
                return "PicaMessageBox";
        }
        return alias;
    };
    UIManager.prototype.clearMediator = function () {
        this.mMedMap.forEach(function (mediator) { return mediator.destroy(); });
        this.mMedMap.clear();
        this.isshowMainui = false;
    };
    UIManager.prototype.onOpenUIMediator = function () {
        if (arguments) {
            var uiName = arguments[0];
            var data = arguments[1];
            this.showMed(uiName, data);
        }
    };
    UIManager.prototype.initUILayoutType = function () {
    };
    // ==== about checkUIState
    UIManager.prototype.checkSceneUImap = function (show, medName) {
        var _this = this;
        var layoutType = this.mUILayoutMap.get(medName);
        if (layoutType === undefined || layoutType === UILayoutType.None)
            return;
        if (!show) {
            this.mSceneUIMap.forEach(function (med) {
                var className = med.constructor.name;
                var tempType = _this.mUILayoutMap.get(className);
                if (tempType === layoutType && className !== medName && med.isShow() === true)
                    med.hide();
            });
        }
    };
    UIManager.prototype.checkNormalUITween = function (show, medName) {
        var size = this.game.getSize();
        var len = this.mShowuiList.length;
        var tmpName;
        var med;
        if (!show) {
            if (this.mShowuiList.indexOf(medName) === -1)
                this.mShowuiList.push(medName);
            len = this.mShowuiList.length;
            var mPad = len > 1 ? size.width / 3 : 0;
            for (var i = 0; i < len; i++) {
                tmpName = this.mShowuiList[i];
                med = this.mMedMap.get(tmpName);
                if (len > 2 && i === 0) {
                    if (med.isShow())
                        med.hide();
                }
                else {
                    med.resize((i * 2 - 1) * mPad, 0);
                }
            }
            if (len > 2)
                this.mShowuiList.shift();
        }
        else {
            var index = void 0;
            for (var i = 0; i < len; i++) {
                tmpName = this.mShowuiList[i];
                med = this.mMedMap.get(tmpName);
                if (tmpName === medName) {
                    index = i;
                    continue;
                }
                med.resize(0, 0);
            }
            this.mShowuiList.splice(index, 1);
        }
    };
    UIManager.prototype.checkBaseUImap = function (show) {
        this.mSceneUIMap.forEach(function (med) {
            if (med)
                med.tweenExpand(show);
        });
    };
    UIManager.prototype.checkNormalUImap = function (show) {
        this.mNormalUIMap.forEach(function (med) {
            if (med) {
                if (show) {
                    // med.show();
                }
                else {
                    if (med.isShow())
                        med.hide();
                }
            }
        });
        if (!show)
            this.mNormalUIMap.clear();
    };
    UIManager.prototype.chekcTipUImap = function (show) {
        this.mTipUIMap.forEach(function (med) {
            if (med) {
                if (show) {
                    // med.show();
                }
                else {
                    if (med.isShow())
                        med.hide();
                }
            }
        });
        if (!show)
            this.mNormalUIMap.clear();
    };
    return UIManager;
}(PacketHandler));
export { UIManager };
//# sourceMappingURL=ui.manager.js.map