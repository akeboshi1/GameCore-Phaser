var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
export class BaseSceneManager {
  constructor(render) {
    __publicField(this, "sceneClass", {});
    __publicField(this, "mMainScene");
    __publicField(this, "render");
    this.render = render;
    this.initScene();
  }
  getSceneClass(name) {
    return this.sceneClass[name];
  }
  launchScene(startScene, LaunchName, sceneName, data) {
    const sceneManager = this.render.game.scene;
    if (!data)
      data = { render: this.render };
    if (!sceneManager) {
      return;
    }
    data.render = this.render;
    const scene = sceneManager.getScene(LaunchName);
    this.render.emitter.once("sceneCreated", () => {
      if (data.callBack)
        data.callBack();
    }, this);
    if (scene) {
    } else {
      sceneManager.add(LaunchName, this.sceneClass[sceneName]);
    }
    startScene.scene.launch(LaunchName, data);
  }
  setMainScene(scene) {
    this.mMainScene = scene;
  }
  getMainScene() {
    return this.mMainScene;
  }
  get currentScene() {
    return null;
  }
  resize(width, height) {
  }
  getSceneByName(sceneName) {
    return null;
  }
  showProgress(progress) {
  }
  bringToTop(sceneName) {
  }
  startScene(name, data) {
  }
  stopScene(name) {
  }
  wakeScene(name, data) {
  }
  sleepScene(name) {
  }
  pauseScene(name) {
  }
  resumeScene(name) {
  }
  remove(key) {
  }
  isActive(name) {
    return false;
  }
  destroy() {
  }
  updateInput(val) {
  }
  initScene() {
  }
}
export var SceneInputEnum;
(function(SceneInputEnum2) {
  SceneInputEnum2[SceneInputEnum2["Disable"] = 0] = "Disable";
  SceneInputEnum2[SceneInputEnum2["Mouse"] = 1] = "Mouse";
  SceneInputEnum2[SceneInputEnum2["Keyboard"] = 2] = "Keyboard";
  SceneInputEnum2[SceneInputEnum2["All"] = 3] = "All";
})(SceneInputEnum || (SceneInputEnum = {}));
