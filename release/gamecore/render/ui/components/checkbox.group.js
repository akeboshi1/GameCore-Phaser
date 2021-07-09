var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { ClickEvent } from "apowophaserui";
export class CheckboxGroup extends Phaser.Events.EventEmitter {
  constructor() {
    super();
    __publicField(this, "mList", []);
    __publicField(this, "mSelectedButton");
  }
  appendItem(item) {
    this.mList.push(item);
    item.on(ClickEvent.Tap, this.onGameObjectUpHandler, this);
    return this;
  }
  appendItemAll(items) {
    this.mList = this.mList.concat(items);
    for (const item of items) {
      item.on(ClickEvent.Tap, this.onGameObjectUpHandler, this);
    }
    return this;
  }
  removeItem(item) {
    this.mList = this.mList.filter((button) => button !== item);
    item.removeAllListeners();
    return this;
  }
  selectIndex(index) {
    if (index < 0) {
      index = 0;
    }
    if (index >= this.mList.length) {
      index = this.mList.length - 1;
    }
    if (this.mList.length > 0) {
      this.select(this.mList[index]);
    }
    return this;
  }
  select(item) {
    if (this.mSelectedButton === item) {
      return;
    }
    if (this.mSelectedButton) {
      this.mSelectedButton.selected = false;
    }
    item.changeDown();
    this.mSelectedButton = item;
    this.emit(ClickEvent.Selected, item);
  }
  reset() {
    if (this.mList) {
      this.mList.forEach((item) => {
        this.removeItem(item);
      });
    }
  }
  destroy() {
    if (this.mList) {
      this.mList.forEach((item) => {
        this.removeItem(item);
        item.destroy();
      });
    }
    super.destroy();
  }
  onGameObjectUpHandler(pointer, gameobject) {
    this.select(gameobject);
  }
  get selectedIndex() {
    return this.mList.indexOf(this.mSelectedButton);
  }
}
