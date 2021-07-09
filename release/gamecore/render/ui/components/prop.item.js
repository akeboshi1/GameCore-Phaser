var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { BBCodeText } from "apowophaserui";
import { SoundButton } from "./soundButton";
import { Font } from "structure";
import { DynamicImage } from "baseRender";
export class PropItem extends SoundButton {
  constructor(scene, render, key, bgframe, dpr, style) {
    super(scene, 0, 0);
    this.render = render;
    __publicField(this, "itemData");
    __publicField(this, "dpr");
    __publicField(this, "key");
    __publicField(this, "itemIcon");
    __publicField(this, "itemCount");
    __publicField(this, "bg");
    __publicField(this, "send");
    __publicField(this, "bgframe");
    this.dpr = dpr;
    this.key = key;
    this.bgframe = bgframe;
    this.bg = this.scene.make.image({ key, frame: bgframe });
    this.itemIcon = new DynamicImage(scene, 0, 0);
    this.itemIcon.setTexture(key, bgframe);
    style = style || { color: "#000000", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT };
    this.itemCount = new BBCodeText(this.scene, 0, 15 * dpr, "", style).setOrigin(0.5);
    this.add([this.bg, this.itemIcon, this.itemCount]);
    this.setSize(this.bg.width, this.bg.height);
    this.itemCount.y = this.height * 0.5 + 8 * dpr;
  }
  setHandler(handler) {
    this.send = handler;
  }
  setItemData(data) {
    this.itemData = data;
    this.itemCount.text = data.count + "";
    const url = this.render.url.getOsdRes(data.texturePath);
    const zoom = this.getWorldTransformMatrix().scaleX;
    this.itemIcon.scale = this.dpr / zoom;
    this.itemIcon.load(url);
  }
  setTextPosition(x, y) {
    this.itemCount.x = x;
    this.itemCount.y = y;
  }
}
