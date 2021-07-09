var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { BasicScene } from "baseRender";
import { Logger, SceneName } from "structure";
export class CreateRoleScene extends BasicScene {
  constructor() {
    super({ key: SceneName.CREATE_ROLE_SCENE });
    __publicField(this, "params");
  }
  init(data) {
    super.init(data);
    this.params = data.params;
  }
  create() {
    if (this.render) {
      const uimanager = this.render.uiManager;
      uimanager.setScene(this);
      Logger.getInstance().debug("createrole===scene");
    }
    super.create();
  }
  stop() {
    if (this.render) {
      this.render.showMediator("CreateRoleScene", false);
    }
    super.stop();
  }
}
