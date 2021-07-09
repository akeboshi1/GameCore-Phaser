var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { PropItem } from "./prop.item";
export class MaterialItem extends PropItem {
  constructor(scene, render, key, bgframe, selectframe, dpr, style) {
    super(scene, render, key, bgframe, dpr, style);
    __publicField(this, "mselect", false);
    __publicField(this, "selectframe");
    this.selectframe = selectframe;
  }
  setItemData(data, needvalue = true) {
    super.setItemData(data);
    this.itemCount.text = needvalue ? this.getCountText(data.count, data.neededCount) : data.count;
  }
  set select(value) {
    this.bg.setFrame(value ? this.selectframe : this.bgframe);
    this.mselect = value;
  }
  get select() {
    return this.mselect;
  }
  getCountText(count, needcount) {
    const color = count >= needcount ? "#000000" : "#ff0000";
    const text = `[stroke=${color}][color=${color}]${count}[/color][/stroke]/` + needcount;
    return text;
  }
}
