var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Bubble } from "./bubble";
import { DynamicImage } from "baseRender";
export class BubbleContainer extends Phaser.GameObjects.Container {
  constructor(scene, scale, url) {
    super(scene);
    this.url = url;
    __publicField(this, "mBubbles", []);
    __publicField(this, "mArrow");
    __publicField(this, "mScale");
    this.mScale = scale;
    this.mArrow = new DynamicImage(this.scene, 0, 0);
    this.mArrow.scale = scale;
    this.mArrow.load(url.getRes("ui/chat/bubble_arrow.png"));
    this.add(this.mArrow);
  }
  addBubble(text, bubbleSetting) {
    if (!bubbleSetting)
      bubbleSetting = {};
    const bubble = this.createBubble(bubbleSetting);
    if (!bubble)
      return;
    const len = this.mBubbles.length;
    let bul = null;
    let h = 0;
    bubble.show(text, bubbleSetting);
    for (let i = len - 1; i >= 0; i--) {
      bul = this.mBubbles[i];
      h += bul.minHeight + 5 * this.mScale;
      bul.tweenTo(-h);
    }
    this.add(bubble);
    this.mArrow.y = 4 * this.mScale;
  }
  follow(target) {
    if (this.mBubbles.length === 0) {
      return;
    }
    const position = target.getPosition();
    if (!position) {
      return;
    }
    this.updatePos(position.x, position.y - 110);
  }
  updatePos(x, y) {
    this.x = x * this.mScale;
    this.y = y * this.mScale;
  }
  destroy(fromScene) {
    if (!this.mBubbles)
      return;
    this.mBubbles = null;
    this.removeFormParent();
    super.destroy(fromScene);
  }
  removeFormParent() {
    if (this.parentContainer) {
      this.parentContainer.remove(this);
    }
  }
  createBubble(bubbleSetting) {
    if (!bubbleSetting)
      bubbleSetting = {};
    const bubble = new Bubble(this.scene, this.mScale, this.url);
    this.mBubbles.push(bubble);
    const duration = bubbleSetting.duration ? bubbleSetting.duration : 5e3;
    bubble.durationRemove(duration, this.onRemoveBubble, this);
    return bubble;
  }
  onRemoveBubble(bubble) {
    if (!bubble) {
      return;
    }
    this.mBubbles = this.mBubbles.filter((val) => bubble !== val);
    this.remove(bubble);
    bubble.destroy();
    if (this.mBubbles.length === 0) {
      this.removeFormParent();
    }
  }
}
