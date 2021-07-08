import { Logger, ValueResolver, SceneName } from "structure";
import { AlertView, Buttons } from "./components";
var UiManager = /** @class */ (function () {
    function UiManager(mRender) {
        this.mRender = mRender;
        this.mBatchPanelList = [];
        /**
         * 前端触发显示ui缓存列表
         */
        this.mCache = [];
        this.mRemoteCache = new Map();
        this.alertViewCache = [];
    }
    UiManager.prototype.setScene = function (scene) {
        var _this = this;
        this.mScene = scene;
        if (scene) {
            if (this.mCache) {
                for (var _i = 0, _a = this.mCache; _i < _a.length; _i++) {
                    var tmp = _a[_i];
                    this.showPanel(tmp.name, tmp.param);
                }
                this.mCache.length = 0;
            }
            if (this.alertViewCache) {
                this.alertViewCache.forEach(function (data) {
                    _this.showAlertView(data.text, data.ok, data.cancel, data.callBack);
                });
                this.alertViewCache.length = 0;
            }
            if (this.mRemoteCache.size > 0) {
                this.mRemoteCache.forEach(function (value, key) {
                    value.resolver.resolve(_this._showPanel(key, value.param));
                });
            }
            this.mRemoteCache.clear();
        }
    };
    UiManager.prototype.resize = function (width, height) {
        if (this.mPanelMap) {
            this.mPanelMap.forEach(function (panel) {
                if (panel.isShow())
                    panel.resize();
            });
        }
    };
    UiManager.prototype.setPanel = function (value, panel) {
        this.mPanelMap.set(value, panel);
    };
    UiManager.prototype.getPanel = function (type) {
        if (!this.mPanelMap)
            return;
        return this.mPanelMap.get(type);
    };
    UiManager.prototype.clearPanel = function () {
        if (!this.mPanelMap) {
            return;
        }
        this.mBatchPanelList.forEach(function (panel) {
            panel.hide();
        });
        this.mPanelMap.forEach(function (med) {
            med.destroy();
        });
        this.mBatchPanelList = [];
        this.mPanelMap.clear();
        this.mPanelMap = null;
    };
    UiManager.prototype.showErrorMsg = function (msg) {
        if (!this.mScene || this.mScene.scene.key !== SceneName.LOADING_SCENE) {
            return;
        }
        var str = msg;
        if (msg.length > 100)
            str = msg.slice(0, 99);
        this.mScene.showErrorMsg(str);
    };
    UiManager.prototype.showAlertView = function (text, ok, cancel, callBack) {
        if (cancel === void 0) { cancel = false; }
        if (!this.mScene || this.mScene.sceneDestroy() || !this.mScene.sceneInitialize() || this.mScene.sceneChange) {
            this.alertViewCache.push({ text: text, ok: ok, cancel: cancel, callBack: callBack });
            return;
        }
        // let scene = this.mRender.game.scene.getScene(SceneName.MAINUI_SCENE);
        // const loadScene = this.mRender.game.scene.getScene(SceneName.LOADING_SCENE);
        // if (loadScene && loadScene.scene.isActive()) scene = loadScene;
        var alert = new AlertView(this.mScene, this);
        alert.show({
            text: text,
            callback: function () {
                if (callBack)
                    callBack();
            },
            btns: Buttons.Ok
        });
        this.mBatchPanelList.push(alert);
    };
    UiManager.prototype.showTipsAlert = function (data) {
        // this.render.mainPeer.showMediator(ModuleName.PICANOTICE_NAME, true, data);
    };
    /**
     * 创建批量显示面板
     * @param type
     * @param param
     */
    UiManager.prototype.showBatchPanel = function (type, param) {
        if (!this.mScene) {
            return;
        }
        if (!this.mPanelMap) {
            this.mPanelMap = new Map();
        }
        var className = type + "Panel";
        var ns = require("./" + type + "/" + className);
        var panel = new ns[className](this);
        this.mBatchPanelList.push(panel);
        panel.show(param);
        return panel;
    };
    UiManager.prototype.destroy = function () {
        this.clearPanel();
        this.clearCache();
        this.mScene = undefined;
    };
    UiManager.prototype.showPanel = function (type, param) {
        var _this = this;
        if (this.mScene) {
            return new Promise(function (resolve, reject) {
                resolve(_this._showPanel(type, param));
            });
        }
        else {
            this.mScene = this.render.game.scene.getScene(SceneName.MAINUI_SCENE);
            if (!this.mScene) {
                var remoteCache = new ValueResolver();
                this.mRemoteCache.set(type, { resolver: remoteCache, param: param });
                return remoteCache.promise(function () {
                });
            }
            else {
                return new Promise(function (resolve, reject) {
                    resolve(_this._showPanel(type, param));
                });
            }
        }
    };
    UiManager.prototype.hidePanel = function (type) {
        var panel = this.hideBasePanel(type);
        if (panel) {
            panel.hide(true);
        }
    };
    /**
     * 客户端发起关闭界面
     * @param type
     */
    UiManager.prototype.hideBasePanel = function (type) {
        if (!this.mPanelMap) {
            return;
        }
        var panel = this.mPanelMap.get(type);
        if (!panel) {
            Logger.getInstance().error("error " + type + " no panel can show!!!");
            return;
        }
        this.mPanelMap.delete(type);
        return panel;
    };
    /**
     * 关闭批量界面，因为批量界面class一致，无法通过服务器告知关闭，所以由客户端控制开关（由panel的hide发起方法调用）
     * @param panel
     */
    UiManager.prototype.hideBatchPanel = function (panel) {
        var len = this.mBatchPanelList.length;
        for (var i = 0; i < len; i++) {
            var tmpPanel = this.mBatchPanelList[i];
            if (tmpPanel === panel) {
                this.mBatchPanelList.splice(i, 1);
                return;
            }
        }
    };
    UiManager.prototype.closePanel = function (id) {
        if (this.render.mainPeer)
            this.render.mainPeer.closePanelHandler(id);
    };
    UiManager.prototype.updateUIState = function (type, ui) {
        if (!this.mPanelMap) {
            return;
        }
        var panel = this.mPanelMap.get(type);
        if (panel) {
            panel.updateUIState(ui);
        }
    };
    UiManager.prototype.getPanelClass = function (type) {
        var className = type + "Panel";
        return require("./" + type + "/" + className);
    };
    Object.defineProperty(UiManager.prototype, "scene", {
        get: function () {
            return this.mScene;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UiManager.prototype, "render", {
        get: function () {
            return this.mRender;
        },
        enumerable: true,
        configurable: true
    });
    UiManager.prototype.clearCache = function () {
        this.mCache = [];
    };
    UiManager.prototype._showPanel = function (type, param) {
        if (!this.mPanelMap) {
            this.mPanelMap = new Map();
        }
        var className = type + "Panel";
        var ns = require("./" + type + "/" + className);
        var panel = this.mPanelMap.get(type);
        if (!panel) {
            panel = new ns[className](this);
            this.mPanelMap.set(type, panel);
        }
        panel.show(param);
        return panel;
    };
    return UiManager;
}());
export { UiManager };
//# sourceMappingURL=ui.manager.js.map