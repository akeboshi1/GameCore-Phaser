import { DragDropIcon } from "./dragDropIcon";
import { ToolTip } from "./tips/toolTip";
import { EventType } from "structure";
import { MainUIScene } from "../../scenes/main.ui.scene";
var ItemSlot = /** @class */ (function () {
    function ItemSlot(scene, render, parentCon, x, y, resStr, respng, resjson, resSlot, selectRes, subscriptRes) {
        this.minitialize = false;
        this.mWid = 0;
        this.mHei = 0;
        this.isTipBoo = true;
        this.mScene = scene;
        this.mRender = render;
        this.toolTipCon = scene.make.container(undefined, false); // new ToolTipContainer(this.mScene, world);
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
    Object.defineProperty(ItemSlot.prototype, "hasTip", {
        get: function () {
            return this.isTipBoo;
        },
        set: function (value) {
            this.isTipBoo = value;
        },
        enumerable: true,
        configurable: true
    });
    ItemSlot.prototype.createUI = function () {
        this.onLoadCompleteHandler();
    };
    ItemSlot.prototype.getView = function () {
        return this.toolTipCon;
    };
    ItemSlot.prototype.getBg = function () {
        return this.itemBG;
    };
    ItemSlot.prototype.getIcon = function () {
        return this.mIcon;
    };
    ItemSlot.prototype.dataChange = function (val) {
        var _this = this;
        if (!this.minitialize)
            return;
        this.mData = val;
        if (this.mIcon) {
            var url = void 0;
            if (this.mData && this.mData.display) {
                url = this.mData.display.texturePath;
                var des = this.mData.des ? "\n" + this.mData.des : "";
                this.setToolTipData(this.mData.name + this.mData.des);
            }
            else {
                this.mIcon.icon.visible = false;
            }
            if (!url)
                return;
            if (this.mScene.textures.exists(this.mRender.url.getOsdRes(url))) {
                if (this.mData) {
                    this.mIcon.icon.setTexture(this.mRender.url.getOsdRes(url));
                    this.mIcon.icon.visible = true;
                }
            }
            else {
                this.mIcon.load(url, this, function () {
                    if (_this.mData) {
                        _this.mIcon.icon.visible = true;
                    }
                });
            }
        }
        else {
            this.mIcon.icon.visible = false;
        }
    };
    ItemSlot.prototype.destroy = function () {
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
    };
    ItemSlot.prototype.setToolTipData = function (text) {
        if (this.toolTip) {
            this.toolTip.setToolTipData(text);
        }
    };
    ItemSlot.prototype.onLoadCompleteHandler = function () {
        this.itemBG = this.mScene.make.sprite(undefined, false);
        this.itemBG.setTexture(this.mResStr, this.mResSlot);
        this.toolTipCon.addAt(this.itemBG, 0);
        this.toolTipCon.setSize(this.itemBG.width, this.itemBG.height);
        this.mIcon = new DragDropIcon(this.mScene, this.mRender, 0, 0);
        this.toolTipCon.addAt(this.mIcon, 1);
        if (this.mSubScriptRes) {
            this.mSubScriptSprite = this.mScene.make.sprite(undefined, false);
            this.mSubScriptSprite.setTexture(this.mResStr, this.mSubScriptRes);
            this.mSubScriptSprite.x = this.mSubScriptSprite.width - this.itemBG.width >> 1;
            this.mSubScriptSprite.y = this.mSubScriptSprite.height - this.itemBG.height >> 1;
            // this.con.addAt(this.mSubScriptSprite, 2);
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
    };
    ItemSlot.prototype.downHandler = function (pointer) {
        if (!this.mData) {
            return;
        }
        this.mRender.renderEmitter(EventType.REQUEST_TARGET_UI, this.mData.id);
    };
    ItemSlot.prototype.overHandler = function (pointer) {
        if (this.toolTip && this.mData) {
            this.mRender.sceneManager.currentScene.layerManager.addToLayer(MainUIScene.LAYER_TOOLTIPS, this.toolTip);
            this.toolTip.setToolTipData(this.mData.name + this.mData.des);
            this.toolTip.x = pointer.x;
            this.toolTip.y = pointer.y;
        }
        if (this.mSelectRes && this.mSelectRes.length > 0) {
            this.mSelectSprite = this.mScene.make.sprite(undefined, false);
            this.mSelectSprite.play(this.mSelectRes);
            this.toolTipCon.add(this.mSelectSprite);
        }
    };
    ItemSlot.prototype.outHandler = function (pointer) {
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
    };
    return ItemSlot;
}());
export { ItemSlot };
//# sourceMappingURL=item.slot.js.map