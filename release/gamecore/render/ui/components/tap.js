var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { ClickEvent } from "apowophaserui";
export class Tap {
  constructor(gameobject) {
    this.gameobject = gameobject;
    __publicField(this, "isDown", false);
    this.addListener();
  }
  addListener() {
    this.gameobject.on("pointerdown", this.onGameObjectDownHandler, this);
    this.gameobject.on("pointerup", this.onGameObjectUpHandler, this);
    this.gameobject.on("pointerout", this.onGameObjectOutHandler, this);
  }
  removeListener() {
    this.gameobject.off("pointerdown", this.onGameObjectDownHandler, this);
    this.gameobject.off("pointerup", this.onGameObjectUpHandler, this);
    this.gameobject.off("pointerout", this.onGameObjectOutHandler, this);
  }
  onGameObjectDownHandler(pointer, gameobject) {
    this.isDown = true;
  }
  onGameObjectUpHandler(pointer, gameobject) {
    if (!this.isDown) {
      return;
    }
    this.isDown = false;
    this.gameobject.emit(ClickEvent.Tap, pointer, gameobject);
  }
  onGameObjectOutHandler() {
    this.isDown = false;
  }
}
