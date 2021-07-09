var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { AvatarSuitType, Logger } from "structure";
import { AvatarEditorDragonbone, AvatarEditorScene } from "editorCanvas";
export class EditorCanvasManager {
  constructor(render) {
    this.render = render;
    __publicField(this, "AVATAR_CANVAS_TEST_DATA", [{ id: "5facff1a67d3b140e835e1d0", parts: ["head_hair"] }]);
    __publicField(this, "AVATAR_CANVAS_RESOURCE_PATH", "https://osd-alpha.tooqing.com");
    __publicField(this, "AVATAR_CANVAS_PARENT", "avatarCanvas");
    __publicField(this, "SCENEKEY_SNAPSHOT", "AvatarEditorSnapshotScene");
  }
  destroy() {
    if (this.render.game) {
      this.render.game.scene.stop(this.SCENEKEY_SNAPSHOT);
      this.render.game.scene.remove(this.SCENEKEY_SNAPSHOT);
    }
  }
  saveAvatar(dbDisplay) {
    if (!dbDisplay || !dbDisplay.displayInfo || !dbDisplay.displayInfo.avatar) {
      return Promise.reject("display info error");
    }
    return new Promise((resolve, reject) => {
      const avatarSets = AvatarSuitType.toIAvatarSets(dbDisplay.displayInfo.avatar);
      dbDisplay.save().then((saveData) => {
        this.render.mainPeer.uploadDBTexture(saveData.key, saveData.url, saveData.json).catch((reason) => {
          Logger.getInstance().error("uploadDBTexture error: " + reason);
        });
        return this.createHeadIcon(avatarSets);
      }).then((str) => {
        this.render.mainPeer.uploadHeadImage(str);
        resolve(null);
      }).catch((reason) => {
        Logger.getInstance().error("save avatar error: " + reason);
        reject(reason);
      });
    });
  }
  createHeadIcon(sets) {
    return new Promise((resolve, reject) => {
      if (!this.render.game.scene.getScene(this.SCENEKEY_SNAPSHOT))
        this.render.game.scene.add(this.SCENEKEY_SNAPSHOT, AvatarEditorScene, false);
      this.render.sceneManager.currentScene.scene.launch(this.SCENEKEY_SNAPSHOT, {
        onCreated: (s) => {
          this.render.game.scene.sendToBack(this.SCENEKEY_SNAPSHOT);
          const a = new AvatarEditorDragonbone(s, this.render.url.RES_PATH, this.render.url.OSD_PATH, this.render.emitter, false, sets, (dragonbone) => {
            dragonbone.generateHeadIcon().then((src) => {
              resolve(src);
              dragonbone.destroy();
              this.render.game.scene.stop(this.SCENEKEY_SNAPSHOT);
              this.render.game.scene.remove(this.SCENEKEY_SNAPSHOT);
            });
          });
        }
      });
    });
  }
}
