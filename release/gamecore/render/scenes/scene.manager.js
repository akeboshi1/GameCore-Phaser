var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Logger, SceneName } from "structure";
import { StringUtils } from "utils";
import { BasicScene, SkyBoxScene, BaseSceneManager } from "baseRender";
import { CreateRoleScene } from "./create.role.scene";
import { GamePauseScene } from "./game.pause.scene";
import { LoadingScene } from "./loading.scene";
import { LoginAccountScene } from "./login.account.scene";
import { LoginScene } from "./login.scene";
import { MainUIScene } from "./main.ui.scene";
import { PlayScene } from "./play.scene";
import { RoomScene } from "./room.scene";
import { SelectRoleScene } from "./select.role.scene";
import { BlackScene } from "./black.scene";
import { SceneInputEnum } from "baseRender";
export class SceneManager extends BaseSceneManager {
  constructor(render) {
    super(render);
    __publicField(this, "sceneManagerName");
    __publicField(this, "mCurSceneName");
    this.sceneManagerName = "SceneManager";
    this.render.exportProperty(this, this.render, this.sceneManagerName).onceReady(() => {
    });
  }
  get currentScene() {
    const sceneManager = this.render.game.scene;
    if (!sceneManager) {
      return null;
    }
    return sceneManager.getScene(this.mCurSceneName);
  }
  resize(width, height) {
    const sceneManager = this.render.game.scene;
    if (!sceneManager) {
      return null;
    }
    const zoom = this.render.scaleRatio;
    const playScene = sceneManager.getScene(SceneName.PLAY_SCENE);
    if (playScene)
      playScene.setScale(zoom);
    const uiScene = sceneManager.getScene(SceneName.MAINUI_SCENE);
    if (uiScene)
      uiScene.setScale(zoom);
  }
  getSceneByName(sceneName) {
    if (!this.render || !this.render.game)
      return void 0;
    return this.render.game.scene.getScene(sceneName);
  }
  showProgress(progress) {
    const sceneManager = this.render.game.scene;
    if (!sceneManager) {
      return;
    }
    const scene = sceneManager.getScene(SceneName.LOADING_SCENE);
    if (scene && scene.scene.isActive) {
      progress *= 100;
      const text = StringUtils.format("\u6B63\u5728\u52A0\u8F7D\u8D44\u6E90 {0}", [progress.toFixed(0) + "%"]);
      scene.updateProgress(text);
    }
    const pauseScene = sceneManager.getScene(SceneName.GAMEPAUSE_SCENE);
    if (pauseScene && pauseScene.scene.isActive())
      return;
    sceneManager.bringToTop(SceneName.LOADING_SCENE);
  }
  bringToTop(sceneName) {
    const sceneManager = this.render.game.scene;
    if (!sceneManager) {
      return;
    }
    const scene = sceneManager.getScene(sceneName);
    if (scene && scene.scene.isActive) {
      sceneManager.bringToTop(sceneName);
    }
  }
  startScene(name, data) {
    const sceneManager = this.render.game.scene;
    if (!data)
      data = { render: this.render };
    if (!sceneManager) {
      return;
    }
    if (!this.sceneClass.hasOwnProperty(name)) {
      return;
    }
    data.render = this.render;
    const scene = sceneManager.getScene(name);
    if (scene) {
      const isActive = scene.scene.isActive(name);
      if (!isActive) {
        scene.wake(data);
      } else {
        if (data.text && data.text.length > 0)
          scene.updateProgress(data.text);
        if (data.loadProgress)
          scene.loadProgress(data.loadProgress);
      }
      if (data.callBack)
        data.callBack();
    } else {
      this.render.emitter.once("sceneCreated", () => {
        Logger.getInstance().debug("sceneCreated===scenemanager");
        if (data.callBack)
          data.callBack();
      }, this);
      sceneManager.add(name, this.sceneClass[name]);
      sceneManager.start(name, data);
    }
    this.mCurSceneName = name;
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
  stopScene(name) {
    const sceneManager = this.render.game.scene;
    if (!sceneManager) {
      return Promise.reject("start faild. SceneManager does not exist");
    }
    if (!this.sceneClass.hasOwnProperty(name)) {
      return Promise.reject("className error: " + name);
    }
    const scene = sceneManager.getScene(name);
    if (!scene)
      return;
    scene.stop();
    this.render.game.scene.remove(name);
  }
  wakeScene(name, data) {
    const sceneManager = this.render.game.scene;
    if (!sceneManager) {
      return Promise.reject("start faild. SceneManager does not exist");
    }
    if (!this.sceneClass.hasOwnProperty(name)) {
      return Promise.reject("className error: " + name);
    }
    const scene = sceneManager.getScene(name);
    if (!scene) {
      return;
    } else {
      scene.wake(data);
    }
  }
  sleepScene(name) {
    if (!this.render.game.scene.getScene(name)) {
      Logger.getInstance().debug(name + "sleep faild");
      return;
    }
    const scene = this.render.game.scene.getScene(name);
    if (!scene.scene.isActive(name))
      return;
    scene.sleep();
  }
  pauseScene(name) {
    const scene = this.render.game.scene.getScene(name);
    if (!scene) {
      Logger.getInstance().error("scene not found : ", name);
      return;
    }
    scene.scene.pause(name);
  }
  resumeScene(name) {
    const scene = this.render.game.scene.getScene(name);
    if (!scene) {
      Logger.getInstance().error("scene not found : ", name);
      return;
    }
    scene.scene.resume(name);
  }
  remove(key) {
    this.render.game.scene.remove(key);
  }
  isActive(name) {
    if (!this.render.game.scene.getScene(name)) {
      return false;
    }
    return this.render.game.scene.getScene(name).scene.isActive();
  }
  destroy() {
    if (this.mCurSceneName)
      this.mCurSceneName = void 0;
    if (this.render && this.render.hasOwnProperty(this.sceneManagerName))
      delete this.render[this.sceneManagerName];
    this.mMainScene = void 0;
  }
  updateInput(val) {
    const scenes = this.render.game.scene.getScenes();
    scenes.map((scene) => scene.input.enabled = val !== SceneInputEnum.Disable);
  }
  initScene() {
    this.sceneClass = {
      "BasicScene": BasicScene,
      "CreateRoleScene": CreateRoleScene,
      "GamePauseScene": GamePauseScene,
      "LoadingScene": LoadingScene,
      "LoginAccountScene": LoginAccountScene,
      "LoginScene": LoginScene,
      "MainUIScene": MainUIScene,
      "PlayScene": PlayScene,
      "RoomScene": RoomScene,
      "SelectRoleScene": SelectRoleScene,
      "SkyBoxScene": SkyBoxScene,
      "BlackScene": BlackScene
    };
  }
}
