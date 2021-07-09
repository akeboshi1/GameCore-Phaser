var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Logger } from "structure";
import { Export } from "webworker-rpc";
export var UIType;
(function(UIType2) {
  UIType2[UIType2["None"] = 0] = "None";
  UIType2[UIType2["Scene"] = 1] = "Scene";
  UIType2[UIType2["Normal"] = 2] = "Normal";
  UIType2[UIType2["Pop"] = 3] = "Pop";
  UIType2[UIType2["Tips"] = 4] = "Tips";
  UIType2[UIType2["Monopoly"] = 5] = "Monopoly";
  UIType2[UIType2["Activity"] = 6] = "Activity";
})(UIType || (UIType = {}));
export class BasicMediator {
  constructor(key, game) {
    this.key = key;
    this.game = game;
    __publicField(this, "mShow", false);
    __publicField(this, "mPanelInit", false);
    __publicField(this, "mHasHide", false);
    __publicField(this, "mParam");
    __publicField(this, "mUIType");
    __publicField(this, "mModel");
    __publicField(this, "mShowData");
    __publicField(this, "mView");
    if (!key || key.length === 0) {
      Logger.getInstance().error("invalid key");
      return;
    }
  }
  get UIType() {
    return this.mUIType;
  }
  createView(className) {
  }
  updateViewPos() {
  }
  tweenExpand(show) {
  }
  hide() {
    this.onDisable();
    if (this.mView && this.mShow !== false)
      this.mView.hide();
    this.mView = void 0;
    this.mPanelInit = false;
    this.mShow = false;
  }
  isSceneUI() {
    return false;
  }
  isShow() {
    return this.mShow;
  }
  resize(width, height) {
  }
  show(param) {
    if (param)
      this.mShowData = param;
    if (this.mPanelInit && this.mShow) {
      this._show();
      return;
    }
    if (!this.mShow)
      this.onEnable();
    this.mShow = true;
    this.__exportProperty(() => {
      this.game.peer.render.showPanel(this.key, param).then(() => {
        this.mView = this.game.peer.render[this.key];
        this.panelInit();
      });
      this.mediatorExport();
    });
  }
  update(param) {
    if (param)
      this.mShowData = param;
  }
  setParam(param) {
    this.mParam = param;
    if (param)
      this.mShowData = param;
  }
  getParam() {
    return this.mParam;
  }
  destroy() {
    this.hide();
    this.mShow = false;
    this.mPanelInit = false;
    this.mShowData = null;
    this.mParam = null;
    if (this.mModel)
      this.mModel.destroy();
    if (this.key.length > 0 && this.game && this.game.peer && this.game.peer.hasOwnProperty(this.key))
      delete this.game.peer[this.key];
  }
  _show() {
  }
  panelInit() {
    this.mPanelInit = true;
  }
  mediatorExport() {
  }
  __exportProperty(callback) {
    if (!this.game || !this.game.peer) {
      return;
    }
    if (this.game.peer[this.key]) {
      return callback();
    }
    return this.game.peer.exportProperty(this, this.game.peer, this.key).onceReady(callback);
  }
  onEnable() {
  }
  onDisable() {
  }
}
__decorateClass([
  Export()
], BasicMediator.prototype, "UIType", 1);
__decorateClass([
  Export()
], BasicMediator.prototype, "createView", 1);
__decorateClass([
  Export()
], BasicMediator.prototype, "updateViewPos", 1);
__decorateClass([
  Export()
], BasicMediator.prototype, "tweenExpand", 1);
__decorateClass([
  Export()
], BasicMediator.prototype, "hide", 1);
__decorateClass([
  Export()
], BasicMediator.prototype, "isSceneUI", 1);
__decorateClass([
  Export()
], BasicMediator.prototype, "isShow", 1);
__decorateClass([
  Export()
], BasicMediator.prototype, "resize", 1);
__decorateClass([
  Export()
], BasicMediator.prototype, "show", 1);
__decorateClass([
  Export()
], BasicMediator.prototype, "update", 1);
__decorateClass([
  Export()
], BasicMediator.prototype, "setParam", 1);
__decorateClass([
  Export()
], BasicMediator.prototype, "getParam", 1);
__decorateClass([
  Export()
], BasicMediator.prototype, "destroy", 1);
__decorateClass([
  Export()
], BasicMediator.prototype, "_show", 1);
__decorateClass([
  Export()
], BasicMediator.prototype, "panelInit", 1);
