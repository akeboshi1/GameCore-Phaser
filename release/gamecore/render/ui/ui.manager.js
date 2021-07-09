var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Logger, ValueResolver, SceneName } from "structure";
import { AlertView, Buttons } from "./components";
export class UiManager {
  constructor(mRender) {
    this.mRender = mRender;
    __publicField(this, "mScene");
    __publicField(this, "mPanelMap");
    __publicField(this, "mBatchPanelList", []);
    __publicField(this, "mCache", []);
    __publicField(this, "mRemoteCache", new Map());
    __publicField(this, "alertViewCache", []);
  }
  setScene(scene) {
    this.mScene = scene;
    if (scene) {
      if (this.mCache) {
        for (const tmp of this.mCache) {
          this.showPanel(tmp.name, tmp.param);
        }
        this.mCache.length = 0;
      }
      if (this.alertViewCache) {
        this.alertViewCache.forEach((data) => {
          this.showAlertView(data.text, data.ok, data.cancel, data.callBack);
        });
        this.alertViewCache.length = 0;
      }
      if (this.mRemoteCache.size > 0) {
        this.mRemoteCache.forEach((value, key) => {
          value.resolver.resolve(this._showPanel(key, value.param));
        });
      }
      this.mRemoteCache.clear();
    }
  }
  resize(width, height) {
    if (this.mPanelMap) {
      this.mPanelMap.forEach((panel) => {
        if (panel.isShow())
          panel.resize();
      });
    }
  }
  setPanel(value, panel) {
    this.mPanelMap.set(value, panel);
  }
  getPanel(type) {
    if (!this.mPanelMap)
      return;
    return this.mPanelMap.get(type);
  }
  clearPanel() {
    if (!this.mPanelMap) {
      return;
    }
    this.mBatchPanelList.forEach((panel) => {
      panel.hide();
    });
    this.mPanelMap.forEach((med) => {
      med.destroy();
    });
    this.mBatchPanelList = [];
    this.mPanelMap.clear();
    this.mPanelMap = null;
  }
  showErrorMsg(msg) {
    if (!this.mScene || this.mScene.scene.key !== SceneName.LOADING_SCENE) {
      return;
    }
    let str = msg;
    if (msg.length > 100)
      str = msg.slice(0, 99);
    this.mScene.showErrorMsg(str);
  }
  showAlertView(text, ok, cancel = false, callBack) {
    if (!this.mScene || this.mScene.sceneDestroy() || !this.mScene.sceneInitialize() || this.mScene.sceneChange) {
      this.alertViewCache.push({ text, ok, cancel, callBack });
      return;
    }
    const alert = new AlertView(this.mScene, this);
    alert.show({
      text,
      callback: () => {
        if (callBack)
          callBack();
      },
      btns: Buttons.Ok
    });
    this.mBatchPanelList.push(alert);
  }
  showTipsAlert(data) {
  }
  showBatchPanel(type, param) {
    if (!this.mScene) {
      return;
    }
    if (!this.mPanelMap) {
      this.mPanelMap = new Map();
    }
    const className = type + "Panel";
    const ns = require(`./${type}/${className}`);
    const panel = new ns[className](this);
    this.mBatchPanelList.push(panel);
    panel.show(param);
    return panel;
  }
  destroy() {
    this.clearPanel();
    this.clearCache();
    this.mScene = void 0;
  }
  showPanel(type, param) {
    if (this.mScene) {
      return new Promise((resolve, reject) => {
        resolve(this._showPanel(type, param));
      });
    } else {
      this.mScene = this.render.game.scene.getScene(SceneName.MAINUI_SCENE);
      if (!this.mScene) {
        const remoteCache = new ValueResolver();
        this.mRemoteCache.set(type, { resolver: remoteCache, param });
        return remoteCache.promise(() => {
        });
      } else {
        return new Promise((resolve, reject) => {
          resolve(this._showPanel(type, param));
        });
      }
    }
  }
  hidePanel(type) {
    const panel = this.hideBasePanel(type);
    if (panel) {
      panel.hide(true);
    }
  }
  hideBasePanel(type) {
    if (!this.mPanelMap) {
      return;
    }
    const panel = this.mPanelMap.get(type);
    if (!panel) {
      Logger.getInstance().error(`error ${type} no panel can show!!!`);
      return;
    }
    this.mPanelMap.delete(type);
    return panel;
  }
  hideBatchPanel(panel) {
    const len = this.mBatchPanelList.length;
    for (let i = 0; i < len; i++) {
      const tmpPanel = this.mBatchPanelList[i];
      if (tmpPanel === panel) {
        this.mBatchPanelList.splice(i, 1);
        return;
      }
    }
  }
  closePanel(id) {
    if (this.render.mainPeer)
      this.render.mainPeer.closePanelHandler(id);
  }
  updateUIState(type, ui) {
    if (!this.mPanelMap) {
      return;
    }
    const panel = this.mPanelMap.get(type);
    if (panel) {
      panel.updateUIState(ui);
    }
  }
  getPanelClass(type) {
    const className = type + "Panel";
    return require(`./${type}/${className}`);
  }
  get scene() {
    return this.mScene;
  }
  get render() {
    return this.mRender;
  }
  clearCache() {
    this.mCache = [];
  }
  _showPanel(type, param) {
    if (!this.mPanelMap) {
      this.mPanelMap = new Map();
    }
    const className = type + "Panel";
    const ns = require(`./${type}/${className}`);
    let panel = this.mPanelMap.get(type);
    if (!panel) {
      panel = new ns[className](this);
      this.mPanelMap.set(type, panel);
    }
    panel.show(param);
    return panel;
  }
}
