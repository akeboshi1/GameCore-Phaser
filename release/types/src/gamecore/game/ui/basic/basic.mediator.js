var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Logger } from "structure";
import { Export } from "webworker-rpc";
export var UIType;
(function (UIType) {
    UIType[UIType["None"] = 0] = "None";
    UIType[UIType["Scene"] = 1] = "Scene";
    UIType[UIType["Normal"] = 2] = "Normal";
    UIType[UIType["Pop"] = 3] = "Pop";
    UIType[UIType["Tips"] = 4] = "Tips";
    UIType[UIType["Monopoly"] = 5] = "Monopoly";
    UIType[UIType["Activity"] = 6] = "Activity";
})(UIType || (UIType = {}));
var BasicMediator = /** @class */ (function () {
    function BasicMediator(key, game) {
        this.key = key;
        this.game = game;
        /**
         * 面板处于打开状态
         */
        this.mShow = false;
        this.mPanelInit = false;
        this.mHasHide = false;
        if (!key || key.length === 0) {
            Logger.getInstance().error("invalid key");
            return;
        }
    }
    Object.defineProperty(BasicMediator.prototype, "UIType", {
        get: function () {
            return this.mUIType;
        },
        enumerable: true,
        configurable: true
    });
    BasicMediator.prototype.createView = function (className) {
    };
    BasicMediator.prototype.updateViewPos = function () {
    };
    BasicMediator.prototype.tweenExpand = function (show) {
    };
    BasicMediator.prototype.hide = function () {
        this.onDisable();
        if (this.mView && this.mShow !== false)
            this.mView.hide();
        this.mView = undefined;
        this.mPanelInit = false;
        this.mShow = false;
    };
    BasicMediator.prototype.isSceneUI = function () {
        return false;
    };
    BasicMediator.prototype.isShow = function () {
        return this.mShow;
    };
    BasicMediator.prototype.resize = function (width, height) {
    };
    BasicMediator.prototype.show = function (param) {
        var _this = this;
        if (param)
            this.mShowData = param;
        if (this.mPanelInit && this.mShow) {
            this._show();
            return;
        }
        if (!this.mShow)
            this.onEnable();
        this.mShow = true;
        this.__exportProperty(function () {
            _this.game.peer.render.showPanel(_this.key, param).then(function () {
                _this.mView = _this.game.peer.render[_this.key];
                _this.panelInit();
            });
            _this.mediatorExport();
        });
    };
    BasicMediator.prototype.update = function (param) {
        if (param)
            this.mShowData = param;
    };
    BasicMediator.prototype.setParam = function (param) {
        this.mParam = param;
        if (param)
            this.mShowData = param;
    };
    BasicMediator.prototype.getParam = function () {
        return this.mParam;
    };
    BasicMediator.prototype.destroy = function () {
        this.hide();
        this.mShow = false;
        this.mPanelInit = false;
        this.mShowData = null;
        this.mParam = null;
        if (this.mModel)
            this.mModel.destroy();
        if (this.key.length > 0 && this.game && this.game.peer && this.game.peer.hasOwnProperty(this.key))
            delete this.game.peer[this.key];
    };
    BasicMediator.prototype._show = function () {
    };
    BasicMediator.prototype.panelInit = function () {
        this.mPanelInit = true;
    };
    BasicMediator.prototype.mediatorExport = function () {
    };
    BasicMediator.prototype.__exportProperty = function (callback) {
        if (!this.game || !this.game.peer) {
            return;
        }
        if (this.game.peer[this.key]) {
            return callback();
        }
        return this.game.peer.exportProperty(this, this.game.peer, this.key).onceReady(callback);
    };
    BasicMediator.prototype.onEnable = function () {
    };
    BasicMediator.prototype.onDisable = function () {
    };
    __decorate([
        Export()
    ], BasicMediator.prototype, "UIType", null);
    __decorate([
        Export()
    ], BasicMediator.prototype, "createView", null);
    __decorate([
        Export()
    ], BasicMediator.prototype, "updateViewPos", null);
    __decorate([
        Export()
    ], BasicMediator.prototype, "tweenExpand", null);
    __decorate([
        Export()
    ], BasicMediator.prototype, "hide", null);
    __decorate([
        Export()
    ], BasicMediator.prototype, "isSceneUI", null);
    __decorate([
        Export()
    ], BasicMediator.prototype, "isShow", null);
    __decorate([
        Export()
    ], BasicMediator.prototype, "resize", null);
    __decorate([
        Export()
    ], BasicMediator.prototype, "show", null);
    __decorate([
        Export()
    ], BasicMediator.prototype, "update", null);
    __decorate([
        Export()
    ], BasicMediator.prototype, "setParam", null);
    __decorate([
        Export()
    ], BasicMediator.prototype, "getParam", null);
    __decorate([
        Export()
    ], BasicMediator.prototype, "destroy", null);
    __decorate([
        Export()
    ], BasicMediator.prototype, "_show", null);
    __decorate([
        Export()
    ], BasicMediator.prototype, "panelInit", null);
    return BasicMediator;
}());
export { BasicMediator };
//# sourceMappingURL=basic.mediator.js.map