var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
export class EditorCanvas {
  constructor(config) {
    __publicField(this, "mGame");
    __publicField(this, "mConfig");
    __publicField(this, "mEmitter");
    this.mConfig = config;
    this.mGame = new Phaser.Game({
      parent: config.parent,
      type: Phaser.AUTO,
      backgroundColor: "#464646",
      render: {
        pixelArt: true,
        roundPixels: true,
        premultipliedAlpha: false
      },
      plugins: {
        scene: [
          {
            key: "DragonBones",
            plugin: dragonBones.phaser.plugin.DragonBonesScenePlugin,
            mapping: "dragonbone"
          }
        ]
      },
      scale: {
        mode: Phaser.Scale.NONE,
        width: config.width,
        height: config.height,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    });
    this.mEmitter = new Phaser.Events.EventEmitter();
  }
  resize(width, height) {
    if (this.mGame) {
      this.mGame.scale.setGameSize(width, height);
    }
  }
  destroy() {
    if (this.mGame) {
      this.mGame.plugins.removeScenePlugin("DragonBones");
      this.mGame.destroy(true);
      this.mGame = null;
    }
    if (this.mEmitter) {
      this.mEmitter.removeAllListeners();
    }
  }
}
