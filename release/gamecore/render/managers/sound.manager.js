var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { SoundField } from "apowophaserui";
import { Logger } from "structure";
export class SoundManager {
  constructor(render) {
    this.render = render;
    __publicField(this, "mScene");
    __publicField(this, "mSoundMap");
  }
  setScene(scene) {
    if (this.mSoundMap) {
      this.mSoundMap.clear();
    }
    this.mSoundMap = new Map();
    this.mScene = scene;
  }
  stopAll() {
    if (!this.mScene) {
      Logger.getInstance().fatal(`${SoundManager.name} scene does not exist,can't stopAll`);
      return;
    }
    this.mSoundMap.forEach((sound) => {
      if (sound)
        sound.stop();
    });
  }
  pauseAll() {
    if (!this.mScene) {
      Logger.getInstance().fatal(`${SoundManager.name} scene does not exist,can't pauseAll`);
      return;
    }
    this.mSoundMap.forEach((sound) => {
      if (sound)
        sound.pause();
    });
  }
  resume() {
    if (!this.mScene) {
      Logger.getInstance().fatal(`${SoundManager.name} scene does not exist,can't resumeAll`);
      return;
    }
    this.mSoundMap.forEach((sound) => {
      if (sound)
        sound.resume();
    });
  }
  destroy() {
  }
  playOsdSound(content) {
    if (content.loop === void 0) {
      content.loop = false;
    }
    this.play({
      key: content.soundKey,
      urls: this.render.url.getOsdRes(content.soundKey),
      field: content.scope,
      soundConfig: { loop: content.loop }
    });
  }
  playSound(content) {
    if (content.loop === void 0) {
      content.loop = false;
    }
    this.play({
      key: content.soundKey,
      urls: this.render.url.getRes(content.soundKey),
      field: content.scope,
      soundConfig: { loop: content.loop }
    });
  }
  play(config) {
    if (!this.mScene) {
      Logger.getInstance().fatal(`${SoundManager.name} scene does not exist. play ${config.key} fatal`);
      return;
    }
    let key = config.key;
    if (!key) {
      if (Array.isArray(config.urls)) {
        key = config.urls.join("");
      } else {
        key = config.urls;
      }
    }
    const field = config.field || SoundField.Background;
    let sound = this.mSoundMap.get(field);
    if (!sound) {
      sound = new Sound(this.mScene);
      this.mSoundMap.set(field, sound);
    }
    sound.play(key, config.urls, config.soundConfig);
  }
  stop(field) {
    if (!this.mScene) {
      Logger.getInstance().fatal(`${SoundManager.name} scene does not exist,can't stop`);
      return;
    }
    const sound = this.mSoundMap.get(field);
    if (!sound) {
      return;
    }
    sound.stop();
  }
  pause(field) {
    if (!this.mScene) {
      Logger.getInstance().fatal(`${SoundManager.name} scene does not exist,can't pause`);
      return;
    }
    const sound = this.mSoundMap.get(field);
    if (!sound) {
      return;
    }
    sound.pause();
  }
  resumes(field) {
    if (!this.mScene) {
      Logger.getInstance().fatal(`${SoundManager.name} scene does not exist,can't resume`);
      return;
    }
    const sound = this.mSoundMap.get(field);
    if (!sound) {
      return;
    }
    sound.resume();
  }
}
class Sound {
  constructor(scene) {
    this.scene = scene;
    __publicField(this, "mKey");
    __publicField(this, "mSound");
  }
  sound() {
    return this.mSound;
  }
  play(key, urls, soundConfig) {
    if (!this.scene) {
      return;
    }
    if (this.mSound && this.mSound.key === key) {
      if (this.mSound.isPlaying)
        return;
      this.mSound.play();
      return;
    }
    this.mKey = key;
    if (this.scene.cache.audio.exists(key)) {
      this.startPlay();
    } else {
      if (!urls) {
        return;
      }
      this.scene.load.once(`filecomplete-audio-${key}`, this.onSoundCompleteHandler, this);
      this.scene.load.audio(key, urls);
      this.scene.load.start();
    }
  }
  pause() {
    if (!this.scene) {
      return;
    }
    if (this.mSound) {
      if (this.mSound.isPaused)
        return;
      this.mSound.pause();
      return;
    }
  }
  stop() {
    if (!this.scene) {
      return;
    }
    if (this.mSound) {
      if (!this.mSound.isPlaying)
        return;
      this.mSound.stop();
      return;
    }
  }
  resume() {
    if (!this.scene) {
      return;
    }
    if (this.mSound) {
      if (!this.mSound.isPaused)
        return;
      this.mSound.resume();
      return;
    }
  }
  destroy() {
    if (this.mSound) {
      this.mSound.stop();
      this.mSound.destroy();
      this.mSound = void 0;
    }
  }
  onSoundCompleteHandler() {
    this.startPlay();
  }
  startPlay() {
    if (this.mSound) {
      this.mSound.stop();
      this.mSound.destroy();
    }
    this.mSound = this.scene.sound.add(this.mKey);
    this.mSound.play();
  }
}
