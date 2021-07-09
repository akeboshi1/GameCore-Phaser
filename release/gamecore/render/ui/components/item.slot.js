var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { DragDropIcon } from "./dragDropIcon";
import { ToolTip } from "./tips/toolTip";
import { EventType } from "structure";
import { MainUIScene } from "../../scenes/main.ui.scene";
export class ItemSlot {
  constructor(scene, render, parentCon, x, y, resStr, respng, resjson, resSlot, selectRes, subscriptRes) {
    __publicField(this, "toolTipCon");
    __publicField(this, "index");
    __publicField(this, "toolTip");
    __publicField(this, "mData");
    __publicField(this, "mRender");
    __publicField(this, "mScene");
    __publicField(this, "mResStr");
    __publicField(this, "mResPng");
    __publicField(this, "mResJson");
    __publicField(this, "mResSlot");
    __publicField(this, "mIcon");
    __publicField(this, "mAnimationCon");
    __publicField(this, "mSubScriptSprite");
    __publicField(this, "mSubScriptRes");
    __publicField(this, "itemBG");
    __publicField(this, "mSelectSprite");
    __publicField(this, "mSelectRes");
    __publicField(this, "minitialize", false);
    __publicField(this, "mWid", 0);
    __publicField(this, "mHei", 0);
    __publicField(this, "isTipBoo", true);
    this.mScene = scene;
    this.mRender = render;
    this.toolTipCon = scene.make.container(void 0, false);
    this.toolTipCon.x = x;
    this.toolTipCon.y = y;
    parentCon.add(this.toolTipCon);
    this.mResStr = resStr;
    this.mResPng = respng;
    this.mResJson = resjson;
    this.mResSlot = resSlot;
    this.mSubScriptRes = subscriptRes;
    this.mSelectRes = selectRes;
  }
  set hasTip(value) {
    this.isTipBoo = value;
  }
  get hasTip() {
    return this.isTipBoo;
  }
  createUI() {
    this.onLoadCompleteHandler();
  }
  getView() {
    return this.toolTipCon;
  }
  getBg() {
    return this.itemBG;
  }
  getIcon() {
    return this.mIcon;
  }
  dataChange(val) {
    if (!this.minitialize)
      return;
    this.mData = val;
    if (this.mIcon) {
      let url;
      if (this.mData && this.mData.display) {
        url = this.mData.display.texturePath;
        const des = this.mData.des ? "\n" + this.mData.des : "";
        this.setToolTipData(this.mData.name + this.mData.des);
      } else {
        this.mIcon.icon.visible = false;
      }
      if (!url)
        return;
      if (this.mScene.textures.exists(this.mRender.url.getOsdRes(url))) {
        if (this.mData) {
          this.mIcon.icon.setTexture(this.mRender.url.getOsdRes(url));
          this.mIcon.icon.visible = true;
        }
      } else {
        this.mIcon.load(url, this, () => {
          if (this.mData) {
            this.mIcon.icon.visible = true;
          }
        });
      }
    } else {
      this.mIcon.icon.visible = false;
    }
  }
  destroy() {
    if (this.mSubScriptSprite) {
      this.mSubScriptSprite.destroy(true);
      this.mSubScriptSprite = null;
    }
    if (this.mSelectSprite) {
      this.mSelectSprite.destroy(true);
      this.mSelectSprite = null;
    }
    if (this.mIcon) {
      this.mIcon.destroy();
    }
    if (this.toolTipCon) {
      this.toolTipCon.destroy();
      this.toolTipCon = null;
    }
    if (this.toolTip) {
      this.toolTip.destroy();
      this.toolTip = null;
    }
    if (this.mAnimationCon) {
      this.mAnimationCon.destroy(true);
      this.mAnimationCon = null;
    }
    if (this.itemBG) {
      this.itemBG.destroy(true);
      this.itemBG = null;
    }
    this.index = 0;
    this.mData = null;
    this.mScene = null;
    this.mRender = null;
    this.mResStr = null;
    this.mResPng = null;
    this.mResSlot = null;
    this.mResJson = null;
    this.mSubScriptRes = null;
    this.mSelectRes = null;
    this.minitialize = false;
    this.mWid = 0;
    this.mHei = 0;
    this.mData = null;
    this.isTipBoo = true;
  }
  setToolTipData(text) {
    if (this.toolTip) {
      this.toolTip.setToolTipData(text);
    }
  }
  onLoadCompleteHandler() {
    this.itemBG = this.mScene.make.sprite(void 0, false);
    this.itemBG.setTexture(this.mResStr, this.mResSlot);
    this.toolTipCon.addAt(this.itemBG, 0);
    this.toolTipCon.setSize(this.itemBG.width, this.itemBG.height);
    this.mIcon = new DragDropIcon(this.mScene, this.mRender, 0, 0);
    this.toolTipCon.addAt(this.mIcon, 1);
    if (this.mSubScriptRes) {
      this.mSubScriptSprite = this.mScene.make.sprite(void 0, false);
      this.mSubScriptSprite.setTexture(this.mResStr, this.mSubScriptRes);
      this.mSubScriptSprite.x = this.mSubScriptSprite.width - this.itemBG.width >> 1;
      this.mSubScriptSprite.y = this.mSubScriptSprite.height - this.itemBG.height >> 1;
    }
    if (this.isTipBoo) {
      this.toolTip = new ToolTip(this.mScene, "itemSlotTip", this.mRender.url.getRes("ui/toolTip/toolTip.json"), this.mRender.url.getRes("ui/toolTip/toolTip.png"), this.mRender.uiScale);
    }
    this.toolTipCon.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.itemBG.width, 56), Phaser.Geom.Rectangle.Contains);
    this.toolTipCon.on("pointerover", this.overHandler, this);
    this.toolTipCon.on("pointerout", this.outHandler, this);
    this.toolTipCon.on("pointerdown", this.downHandler, this);
    this.toolTipCon.on("pointerup", this.outHandler, this);
    this.minitialize = true;
    if (this.mData) {
      this.dataChange(this.mData);
    }
    this.mWid += this.itemBG.width;
    this.mHei += this.itemBG.height;
  }
  downHandler(pointer) {
    if (!this.mData) {
      return;
    }
    this.mRender.renderEmitter(EventType.REQUEST_TARGET_UI, this.mData.id);
  }
  overHandler(pointer) {
    if (this.toolTip && this.mData) {
      this.mRender.sceneManager.currentScene.layerManager.addToLayer(MainUIScene.LAYER_TOOLTIPS, this.toolTip);
      this.toolTip.setToolTipData(this.mData.name + this.mData.des);
      this.toolTip.x = pointer.x;
      this.toolTip.y = pointer.y;
    }
    if (this.mSelectRes && this.mSelectRes.length > 0) {
      this.mSelectSprite = this.mScene.make.sprite(void 0, false);
      this.mSelectSprite.play(this.mSelectRes);
      this.toolTipCon.add(this.mSelectSprite);
    }
  }
  outHandler(pointer) {
    if (this.toolTip) {
      if (this.toolTip.parentContainer) {
        this.toolTip.parentContainer.remove(this.toolTip);
      }
    }
    if (this.mSelectSprite && this.mSelectSprite.parentContainer) {
      this.mSelectSprite.parentContainer.remove(this.mSelectSprite);
      this.mSelectSprite.destroy(true);
      this.mSelectSprite = null;
    }
  }
}
