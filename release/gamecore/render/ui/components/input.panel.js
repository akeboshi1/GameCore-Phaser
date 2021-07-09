var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { InputText } from "apowophaserui";
export class InputPanel extends Phaser.Events.EventEmitter {
  constructor(scene, render, text) {
    super();
    this.render = render;
    __publicField(this, "mBackground");
    __publicField(this, "mInput");
    __publicField(this, "scene");
    this.scene = scene;
    const width = scene.cameras.main.width;
    const height = scene.cameras.main.height;
    this.mBackground = scene.add.graphics();
    this.mBackground.fillStyle(0, 0.6);
    this.mBackground.fillRect(0, 0, width, height).setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    this.mInput = new InputText(scene, 6 * render.uiRatio, 6 * render.uiRatio, width - 12 * render.uiRatio, 40 * render.uiRatio, {
      fontSize: `${20 * render.uiRatio}px`,
      color: "#0",
      text,
      backgroundColor: "#FFFFFF",
      borderColor: "#FF9900"
    }).setOrigin(0, 0);
    this.mInput.node.addEventListener("keypress", (e) => {
      const keycode = e.keyCode || e.which;
      if (keycode === 13) {
        this.onCloseHandler();
      }
    });
    this.mInput.x = 6 * render.uiRatio;
    this.scene.input.on("pointerdown", this.onFoucesHandler, this);
    if (this.render.game.device.os.iOS) {
      this.mInput.on("click", this.onFoucesHandler, this);
    } else {
      this.mInput.on("focus", this.onFoucesHandler, this);
    }
    this.mInput.setFocus();
  }
  onCloseHandler() {
    this.emit("close", this.mInput.text);
    this.mBackground.destroy();
    this.mInput.destroy();
    this.destroy();
    this.scene.input.off("pointerdown", this.onFoucesHandler, this);
    this.scene = void 0;
  }
  onFoucesHandler() {
    this.mInput.node.focus();
  }
}
