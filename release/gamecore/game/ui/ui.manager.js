var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
import { PacketHandler } from "net-socket-packet";
import { op_client } from "pixelpai_proto";
import { EventType, GameState } from "structure";
import { UIType } from "./basic/basic.mediator";
import { UILayoutType } from "./ui.mediator.type";
export class UIManager extends PacketHandler {
  constructor(game) {
    super();
    this.game = game;
    __publicField(this, "mMedMap");
    __publicField(this, "mUIStateData");
    __publicField(this, "isshowMainui", false);
    __publicField(this, "mNoneUIMap", new Map());
    __publicField(this, "mSceneUIMap", new Map());
    __publicField(this, "mNormalUIMap", new Map());
    __publicField(this, "mPopUIMap", new Map());
    __publicField(this, "mTipUIMap", new Map());
    __publicField(this, "mMonopolyUIMap", new Map());
    __publicField(this, "mActivityUIMap", new Map());
    __publicField(this, "mUILayoutMap", new Map());
    __publicField(this, "mShowuiList", []);
    __publicField(this, "mLoadingCache", []);
    if (!this.mMedMap) {
      this.mMedMap = new Map();
    }
    this.initUILayoutType();
  }
  getMed(name) {
    return this.mMedMap.get(name);
  }
  recover() {
    this.mMedMap.forEach((mediator) => {
      if (mediator && mediator.isShow()) {
        mediator.hide();
      }
    });
  }
  addPackListener() {
    const connection = this.game.connection;
    if (!connection) {
      return;
    }
    connection.addPacketListener(this);
    this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI, this.handleShowUI);
    this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI, this.handleUpdateUI);
    this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CLOSE_UI, this.handleCloseUI);
    this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_FORCE_OFFLINE, this.onForceOfflineHandler);
    this.game.emitter.on(EventType.SCENE_SHOW_UI, this.onOpenUIMediator, this);
    this.game.emitter.on(EventType.SCENE_SHOW_MAIN_UI, this.showMainUI, this);
  }
  removePackListener() {
    const connection = this.game.connection;
    if (!connection) {
      return;
    }
    connection.removePacketListener(this);
    this.game.emitter.off(EventType.SCENE_SHOW_UI, this.onOpenUIMediator, this);
    this.game.emitter.off(EventType.SCENE_SHOW_MAIN_UI, this.showMainUI, this);
  }
  showMainUI(hideNames) {
    if (this.mUIStateData) {
      this.updateUIState(this.mUIStateData);
    }
    this.mMedMap.forEach((mediator) => {
      if (mediator.isSceneUI() && !mediator.isShow()) {
        if (!hideNames || hideNames.indexOf(mediator.key) === -1)
          mediator.show();
      }
    });
    for (const oneCache of this.mLoadingCache) {
      this.showMed(oneCache.name, oneCache);
    }
    this.mLoadingCache.length = 0;
    this.isshowMainui = true;
  }
  showMed(type, param) {
    if (!this.mMedMap) {
      this.mMedMap = new Map();
    }
    type = this.getPanelNameByAlias(type);
    const className = type + "Mediator";
    let mediator = this.mMedMap.get(type);
    if (!mediator) {
      const ns = require(`./${type}/${className}`);
      mediator = new ns[className](this.game);
      if (!mediator) {
        this.game.peer.render.showPanel(type, param);
        return;
      }
      this.mMedMap.set(type, mediator);
    }
    if (param)
      mediator.setParam(param);
    if (mediator.isShow())
      return;
    mediator.show(param);
  }
  updateMed(type, param) {
    if (!this.mMedMap) {
      return;
    }
    const name = `${type}`;
    const mediator = this.mMedMap.get(name);
    if (!mediator) {
      return;
    }
    if (param)
      mediator.setParam(param);
    mediator.update(param);
  }
  hideMed(type) {
    if (!this.mMedMap) {
      return;
    }
    type = this.getPanelNameByAlias(type);
    const medName = `${type}`;
    const mediator = this.mMedMap.get(medName);
    if (!mediator) {
      return;
    }
    if (!mediator.isShow())
      return;
    mediator.hide();
  }
  showExistMed(type, extendName = "") {
    if (!this.mMedMap) {
      return;
    }
    type = this.getPanelNameByAlias(type);
    const className = type + extendName;
    const mediator = this.mMedMap.get(type);
    if (mediator)
      mediator.show();
  }
  getUIStateData(name) {
    if (!this.mUIStateData)
      return null;
    const arr = [];
    for (const data of this.mUIStateData.ui) {
      const tagName = data.name.split(".")[0];
      const paneName = this.getPanelNameByAlias(tagName);
      if (paneName === name) {
        arr.push(data);
      }
    }
    return arr;
  }
  checkUIState(medName, show) {
    const mediator = this.mMedMap.get(medName);
    if (!mediator)
      return;
    const uiType = mediator.UIType;
    const deskBoo = this.game.peer.isPlatform_PC();
    let map;
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
        if (deskBoo) {
          this.checkNormalUITween(show, medName);
        } else {
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
  }
  refrehActiveUIState(panel) {
    const states = this.getUIStateData(panel);
    if (!states)
      return;
    for (const state of states) {
      this.updateUI(state);
    }
  }
  destroy() {
    this.removePackListener();
    if (this.mMedMap) {
      this.mMedMap.forEach((basicMed) => {
        if (basicMed) {
          basicMed.destroy();
          basicMed = null;
        }
      });
      this.mMedMap.clear();
      this.mMedMap = null;
    }
    if (this.mUIStateData)
      this.mUIStateData = void 0;
    this.isshowMainui = false;
  }
  onForceOfflineHandler(packet) {
    return __async(this, null, function* () {
      if (this.game.peer.state.key === GameState.ChangeGame)
        return;
      this.game.gameStateManager.startState(GameState.OffLine);
      this.game.peer.render.showAlert("common.offline", true).then(() => {
        this.game.peer.render.hidden();
      });
    });
  }
  updateUIState(data) {
    for (const ui of data.ui) {
      this.updateUI(ui);
    }
  }
  updateUI(ui) {
    const tag = ui.name;
    const paneltags = tag.split(".");
    const panelName = this.getPanelNameByAlias(paneltags[0]);
    if (panelName) {
      const mediator = this.mMedMap.get(panelName);
      if (mediator) {
        if (paneltags.length === 1) {
          if (ui.visible || ui.visible === void 0) {
            if (mediator.isSceneUI())
              this.showMed(panelName);
          } else {
            this.hideMed(panelName);
          }
        } else {
          this.game.peer.render.updateUIState(panelName, ui);
        }
      }
    }
  }
  getMediatorClass(type) {
    const className = type + "Mediator";
    return require(`./${type}/${className}`);
  }
  handleShowUI(packet) {
    const ui = packet.content;
    if (this.game.roomManager.currentRoom && !this.game.roomManager.currentRoom.isLoading) {
      this.showMed(ui.name, ui);
    } else {
      this.mLoadingCache.push(ui);
    }
  }
  handleUpdateUI(packet) {
    const ui = packet.content;
    if (this.game.roomManager.currentRoom && !this.game.roomManager.currentRoom.isLoading) {
      this.updateMed(ui.name, ui);
    }
  }
  handleCloseUI(packet) {
    const ui = packet.content;
    if (this.game.roomManager.currentRoom && !this.game.roomManager.currentRoom.isLoading) {
      this.hideMed(ui.name);
    } else {
      const idx = this.mLoadingCache.findIndex((x) => x.name === ui.name);
      if (idx >= 0) {
        this.mLoadingCache.splice(idx, 1);
      }
    }
  }
  getPanelNameByAlias(alias) {
    switch (alias) {
      case "MessageBox":
        return "PicaMessageBox";
    }
    return alias;
  }
  clearMediator() {
    this.mMedMap.forEach((mediator) => mediator.destroy());
    this.mMedMap.clear();
    this.isshowMainui = false;
  }
  onOpenUIMediator() {
    if (arguments) {
      const uiName = arguments[0];
      const data = arguments[1];
      this.showMed(uiName, data);
    }
  }
  initUILayoutType() {
  }
  checkSceneUImap(show, medName) {
    const layoutType = this.mUILayoutMap.get(medName);
    if (layoutType === void 0 || layoutType === UILayoutType.None)
      return;
    if (!show) {
      this.mSceneUIMap.forEach((med) => {
        const className = med.constructor.name;
        const tempType = this.mUILayoutMap.get(className);
        if (tempType === layoutType && className !== medName && med.isShow() === true)
          med.hide();
      });
    }
  }
  checkNormalUITween(show, medName) {
    const size = this.game.getSize();
    let len = this.mShowuiList.length;
    let tmpName;
    let med;
    if (!show) {
      if (this.mShowuiList.indexOf(medName) === -1)
        this.mShowuiList.push(medName);
      len = this.mShowuiList.length;
      const mPad = len > 1 ? size.width / 3 : 0;
      for (let i = 0; i < len; i++) {
        tmpName = this.mShowuiList[i];
        med = this.mMedMap.get(tmpName);
        if (len > 2 && i === 0) {
          if (med.isShow())
            med.hide();
        } else {
          med.resize((i * 2 - 1) * mPad, 0);
        }
      }
      if (len > 2)
        this.mShowuiList.shift();
    } else {
      let index;
      for (let i = 0; i < len; i++) {
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
  }
  checkBaseUImap(show) {
    this.mSceneUIMap.forEach((med) => {
      if (med)
        med.tweenExpand(show);
    });
  }
  checkNormalUImap(show) {
    this.mNormalUIMap.forEach((med) => {
      if (med) {
        if (show) {
        } else {
          if (med.isShow())
            med.hide();
        }
      }
    });
    if (!show)
      this.mNormalUIMap.clear();
  }
  chekcTipUImap(show) {
    this.mTipUIMap.forEach((med) => {
      if (med) {
        if (show) {
        } else {
          if (med.isShow())
            med.hide();
        }
      }
    });
    if (!show)
      this.mNormalUIMap.clear();
  }
}
