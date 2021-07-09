var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { JoystickManager } from "./joystick.manager";
import { MouseManager } from "./mouse.manager";
export class InputManager {
  constructor(render) {
    this.render = render;
    __publicField(this, "mMouseManager");
    __publicField(this, "mJoystickManager");
    __publicField(this, "mScene");
    this.mMouseManager = new MouseManager(render);
  }
  showJoystick() {
    this.mJoystickManager = new JoystickManager(this.render);
    this.mJoystickManager.setScene(this.mScene);
  }
  setScene(scene) {
    this.mScene = scene;
    this.mMouseManager.changeScene(scene);
    if (this.mJoystickManager)
      this.mJoystickManager.setScene(scene);
  }
  resize(width, height) {
    this.mMouseManager.resize(width, height);
  }
  update(time, delta) {
  }
  destroy() {
    if (this.mMouseManager)
      this.mMouseManager.destroy();
    if (this.mJoystickManager)
      this.mJoystickManager.destroy();
  }
  changeMouseManager(mng) {
    if (this.mMouseManager)
      this.mMouseManager.destroy();
    this.mMouseManager = mng;
    if (this.mScene)
      this.mMouseManager.changeScene(this.mScene);
  }
}
