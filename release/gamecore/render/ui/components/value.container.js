var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Button, ClickEvent } from "apowophaserui";
import { Font } from "structure";
export class ValueContainer extends Phaser.GameObjects.Container {
  constructor(scene, key, leftIcon, dpr = 1) {
    super(scene);
    __publicField(this, "mText");
    __publicField(this, "mAddBtn");
    __publicField(this, "mLeft");
    __publicField(this, "sendHandler");
    this.init(key, leftIcon, dpr);
  }
  setText(val) {
    this.mText.setText(val);
  }
  setHandler(send) {
    this.sendHandler = send;
  }
  init(key, leftIcon, dpr) {
    const bg = this.scene.make.image({
      key,
      frame: "home_progress_bottom"
    }, false);
    bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.mLeft = this.scene.make.image({
      key,
      frame: leftIcon
    }, false);
    this.mLeft.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.mText = this.scene.make.text({
      text: "0",
      style: {
        fontSize: 14 * dpr + "px",
        fontFamily: Font.NUMBER,
        fixedWidth: bg.width,
        fixedHeight: bg.height
      }
    }, false).setOrigin(0.5);
    this.mText.setStroke("#000000", 1 * dpr);
    this.mText.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.mAddBtn = new Button(this.scene, key, "add_btn", "add_btn");
    this.setSize(bg.width, bg.height);
    this.mLeft.x = -bg.width * 0.5 + 5 * dpr;
    this.mLeft.y = bg.y + bg.height * 0.5 - this.mLeft.height * 0.5;
    this.mAddBtn.x = this.width * this.originX - this.mAddBtn.width * this.originX - 5 * dpr;
    this.mText.x = 4 * dpr;
    this.add([bg, this.mLeft, this.mText, this.mAddBtn]);
    this.mAddBtn.on(ClickEvent.Tap, this.onAddHandler, this);
  }
  onAddHandler() {
    if (this.sendHandler)
      this.sendHandler.run();
  }
}
