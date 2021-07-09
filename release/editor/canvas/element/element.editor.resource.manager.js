var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import * as path from "path";
import { MaxRectsPacker } from "maxrects-packer";
import { ElementEditorEmitType } from "./element.editor.type";
import { Logger, Atlas } from "structure";
export const WEB_HOME_PATH = "https://osd.tooqing.com/";
export const SPRITE_SHEET_KEY = "ELEMENT_EDITOR_SPRITE_SHEET_KEY";
export const IMAGE_BLANK_KEY = "blank";
export default class ElementEditorResourceManager {
  constructor(data, emitter, localHomePath) {
    __publicField(this, "mElementNode");
    __publicField(this, "mScene");
    __publicField(this, "mEmitter");
    __publicField(this, "mResourcesChangeListeners", []);
    __publicField(this, "mLocalHomePath");
    this.mElementNode = data;
    this.mEmitter = emitter;
    this.mLocalHomePath = localHomePath;
  }
  init(scene) {
    this.mScene = scene;
    this.loadResources();
  }
  addResourcesChangeListener(listener) {
    this.mResourcesChangeListeners.push(listener);
  }
  removeResourcesChangeListener(listener) {
    const idx = this.mResourcesChangeListeners.indexOf(listener);
    if (idx !== -1) {
      this.mResourcesChangeListeners.splice(idx, 1);
    }
  }
  loadResources() {
    if (!this.mScene) {
      Logger.getInstance().warn("ResourceManager not inited");
      return;
    }
    if (!this.mElementNode || !this.mElementNode.animations.display.texturePath || this.mElementNode.animations.display.texturePath === "" || !this.mElementNode.animations.display.dataPath || this.mElementNode.animations.display.dataPath === "") {
      this.mEmitter.emit(ElementEditorEmitType.Resource_Loaded, false, "DisplayNode is empty");
      return;
    }
    this.clearResource();
    const val = this.mElementNode.animations.display;
    this.mScene.load.addListener(Phaser.Loader.Events.COMPLETE, this.imageLoaded, this);
    this.mScene.load.atlas(SPRITE_SHEET_KEY, path.join(this.mLocalHomePath, val.texturePath), path.join(this.mLocalHomePath, val.dataPath)).on("loaderror", this.imageLoadError, this);
    Logger.getInstance().debug("loadResources ", path.join(this.mLocalHomePath, val.texturePath));
    this.mScene.load.start();
  }
  generateSpriteSheet(images) {
    return new Promise((resolve, reject) => {
      if (!this.mScene) {
        Logger.getInstance().warn("ResourceManager not inited");
        reject(null);
        return;
      }
      let imgCount = 0;
      for (const image of images) {
        imgCount++;
        if (!this.mScene.textures.exists(image.key)) {
          this.mScene.textures.addBase64(image.key, image.url);
        }
      }
      if (imgCount === 0) {
        Logger.getInstance().warn("no image data");
        reject(null);
        return;
      }
      const _imgs = [].concat(images);
      const onLoadFunc = () => {
        let allLoaded = true;
        _imgs.forEach((img) => {
          if (!this.mScene.textures.exists(img.key)) {
            allLoaded = false;
          }
        });
        if (!allLoaded)
          return;
        const atlas = new Atlas();
        const packer = new MaxRectsPacker();
        packer.padding = 2;
        for (const image of _imgs) {
          const f = this.mScene.textures.getFrame(image.key, "__BASE");
          packer.add(f.width, f.height, { name: image.key });
        }
        const { width, height } = packer.bins[0];
        const canvas = this.mScene.textures.createCanvas("GenerateSpriteSheet", width, height);
        packer.bins.forEach((bin) => {
          bin.rects.forEach((rect) => {
            canvas.drawFrame(rect.data.name, "__BASE", rect.x, rect.y);
            atlas.addFrame(rect.data.name, rect);
          });
        });
        const url = canvas.canvas.toDataURL("image/png", 1);
        canvas.destroy();
        _imgs.forEach((one) => {
          if (this.mScene.textures.exists(one.key)) {
            this.mScene.textures.remove(one.key);
            this.mScene.textures.removeKey(one.key);
          }
        });
        Logger.getInstance().debug("generate sprite sheet: ", url, atlas.toString());
        resolve({ url, json: atlas.toString() });
        this.mScene.textures.off("onload", onLoadFunc, this, false);
      };
      this.mScene.textures.on("onload", onLoadFunc, this);
    });
  }
  deserializeDisplay() {
    return new Promise((resolve, reject) => {
      if (!this.mScene.textures.exists(SPRITE_SHEET_KEY)) {
        reject([]);
      } else {
        const atlasTexture = this.mScene.textures.get(SPRITE_SHEET_KEY);
        const frames = atlasTexture.frames;
        const frameNames = atlasTexture.getFrameNames(false);
        let frame = null;
        const imgs = [];
        for (const frameName of frameNames) {
          frame = frames[frameName];
          let imgName = "NAME_ERROR";
          const imgHash = frameName.split("?t=");
          if (imgHash.length > 0)
            imgName = imgHash[0];
          const canvas = this.mScene.textures.createCanvas("DeserializeSpriteSheet", frame.width, frame.height);
          canvas.drawFrame(SPRITE_SHEET_KEY, frameName);
          const url = canvas.canvas.toDataURL("image/png", 1);
          imgs.push({ key: frameName, name: imgName, url });
          canvas.destroy();
        }
        Logger.getInstance().debug("deserialize sprite sheet: ", imgs);
        resolve(imgs);
      }
    });
  }
  clearResource() {
    if (this.mScene.textures.exists(SPRITE_SHEET_KEY)) {
      this.mResourcesChangeListeners.forEach((listener) => {
        listener.onResourcesCleared();
      });
      this.mScene.textures.remove(SPRITE_SHEET_KEY);
      this.mScene.textures.removeKey(SPRITE_SHEET_KEY);
      this.mScene.cache.json.remove(SPRITE_SHEET_KEY);
    }
  }
  destroy() {
    this.clearResource();
    this.mResourcesChangeListeners.length = 0;
  }
  imageLoaded() {
    if (!this.mScene.textures.exists(SPRITE_SHEET_KEY)) {
      return;
    }
    this.mScene.load.removeListener(Phaser.Loader.Events.COMPLETE, this.imageLoaded, this);
    this.mResourcesChangeListeners.forEach((listener) => {
      listener.onResourcesLoaded();
    });
    this.mEmitter.emit(ElementEditorEmitType.Resource_Loaded, true, "DisplayNode load success");
  }
  imageLoadError() {
    this.mEmitter.emit(ElementEditorEmitType.Resource_Loaded, false, "DisplayNode load error");
  }
}
