var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { NineSlicePatch, BBCodeText } from "apowophaserui";
import { Font } from "structure";
export class ItemInfoTips extends Phaser.GameObjects.Container {
  constructor(scene, width, height, key, bg, dpr, config) {
    super(scene);
    __publicField(this, "tipsbg");
    __publicField(this, "tipsText");
    __publicField(this, "dpr");
    __publicField(this, "key");
    __publicField(this, "config");
    __publicField(this, "fullHide", true);
    __publicField(this, "invalidArea");
    __publicField(this, "callback");
    __publicField(this, "listenType");
    this.setSize(width, height);
    this.key = key;
    this.dpr = dpr;
    this.config = config ? config : {
      left: 15 * this.dpr,
      top: 15 * this.dpr,
      right: 15 * this.dpr,
      bottom: 15 * this.dpr
    };
    this.listenType = "pointerdown";
    this.create(bg);
  }
  setListenType(event) {
    this.listenType = event || "pointerdown";
  }
  setInvalidArea(invalidArea) {
    this.fullHide = true;
    this.invalidArea = invalidArea;
  }
  setHandler(back) {
    this.callback = back;
  }
  set enableFullHide(value) {
    this.fullHide = value;
    this.invalidArea = void 0;
  }
  setVisible(value) {
    if (!value)
      this.hide();
    else
      this.show();
    super.setVisible(value);
    return this;
  }
  hide() {
    if (this.fullHide && this.visible) {
      this.scene.input.off(this.listenType, this.onHideHandler, this);
    }
    this.visible = false;
    if (this.callback)
      this.callback.run();
  }
  show() {
    if (this.fullHide && !this.visible) {
      this.scene.input.on(this.listenType, this.onHideHandler, this);
    }
    this.visible = true;
  }
  resize(width, height) {
    this.tipsText.setWrapWidth(width);
    let tipsHeight = this.tipsText.height + 20 * this.dpr;
    if (tipsHeight < height)
      tipsHeight = height;
    this.setSize(width, tipsHeight);
    this.tipsbg.resize(width, tipsHeight);
    this.tipsbg.y = -tipsHeight * 0.5;
    this.tipsText.y = -tipsHeight + 10 * this.dpr;
  }
  setText(text, apha = 0.9) {
    this.tipsText.text = text;
    const tipsHeight = this.tipsText.height + 20 * this.dpr;
    const tipsWidth = this.tipsbg.width;
    this.setSize(tipsWidth, tipsHeight);
    this.tipsbg.resize(tipsWidth, tipsHeight);
    this.tipsbg.y = -tipsHeight * 0.5;
    this.tipsText.y = -tipsHeight + 10 * this.dpr;
  }
  setItemData(data) {
    const tex = this.getDesText(data);
    this.setText(tex);
  }
  setTipsPosition(gameobject, container, offsety = 0) {
    let posx = gameobject.x;
    let posy = gameobject.y;
    let tempobject = gameobject;
    while (tempobject.parentContainer !== container) {
      posx += tempobject.parentContainer.x;
      posy += tempobject.parentContainer.y;
      tempobject = tempobject.parentContainer;
    }
    if (posx - this.width * 0.5 < -container.width * 0.5) {
      this.x = this.width * 0.5 - container.width * 0.5 + 20 * this.dpr;
    } else if (posx + this.width * 0.5 > container.width * 0.5) {
      this.x = container.width * 0.5 - this.width * 0.5 - 20 * this.dpr;
    } else {
      this.x = posx;
    }
    this.y = posy - this.height * 0.5 + 10 * this.dpr + offsety;
  }
  create(bg) {
    const tipsWidth = this.width;
    const tipsHeight = this.height;
    const tipsbg = new NineSlicePatch(this.scene, 0, 0, tipsWidth, tipsHeight, this.key, bg, this.config);
    tipsbg.setPosition(0, -tipsHeight * 0.5);
    this.tipsbg = tipsbg;
    const tipsText = new BBCodeText(this.scene, -this.width * 0.5 + 10 * this.dpr, -tipsHeight + 60 * this.dpr, "", {
      color: "#333333",
      fontSize: 13 * this.dpr,
      fontFamily: Font.DEFULT_FONT,
      wrap: {
        width: this.width - 15 * this.dpr,
        mode: "string"
      }
    }).setOrigin(0);
    tipsText.setLineSpacing(2 * this.dpr);
    this.tipsText = tipsText;
    this.add([tipsbg, tipsText]);
  }
  getDesText(data) {
    if (!data)
      data = { "sellingPrice": true, tradable: false };
    let text = `[stroke=#2640CA][color=#2640CA][b]${data.name}[/b][/color][/stroke]
`;
    text += data.source ? data.source + "\n" : "";
    text += data.des ? data.des + "\n" : "";
    text += data.count > 0 ? `[color=#2640CA][b]x${data.count}[/b][/color]` : "";
    return text;
  }
  onHideHandler(pointer) {
    if (!this.checkPointerInBounds(pointer))
      this.hide();
  }
  checkPointerInBounds(pointer) {
    if (pointer && this.invalidArea) {
      if (pointer.x > this.invalidArea.left && pointer.x < this.invalidArea.right) {
        if (pointer.y > this.invalidArea.top && pointer.y < this.invalidArea.bottom) {
          return true;
        }
      }
    }
    return false;
  }
}
