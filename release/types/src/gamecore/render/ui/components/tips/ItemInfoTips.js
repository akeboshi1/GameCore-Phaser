var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { NineSlicePatch, BBCodeText } from "apowophaserui";
import { Font } from "structure";
var ItemInfoTips = /** @class */ (function (_super) {
    __extends_1(ItemInfoTips, _super);
    function ItemInfoTips(scene, width, height, key, bg, dpr, config) {
        var _this = _super.call(this, scene) || this;
        _this.fullHide = true;
        _this.setSize(width, height);
        _this.key = key;
        _this.dpr = dpr;
        _this.config = config ? config : {
            left: 15 * _this.dpr,
            top: 15 * _this.dpr,
            right: 15 * _this.dpr,
            bottom: 15 * _this.dpr
        };
        _this.listenType = "pointerdown";
        _this.create(bg);
        return _this;
    }
    ItemInfoTips.prototype.setListenType = function (event) {
        this.listenType = event || "pointerdown";
    };
    ItemInfoTips.prototype.setInvalidArea = function (invalidArea) {
        this.fullHide = true;
        this.invalidArea = invalidArea;
    };
    ItemInfoTips.prototype.setHandler = function (back) {
        this.callback = back;
    };
    Object.defineProperty(ItemInfoTips.prototype, "enableFullHide", {
        set: function (value) {
            this.fullHide = value;
            this.invalidArea = undefined;
        },
        enumerable: true,
        configurable: true
    });
    ItemInfoTips.prototype.setVisible = function (value) {
        if (!value)
            this.hide();
        else
            this.show();
        _super.prototype.setVisible.call(this, value);
        return this;
    };
    ItemInfoTips.prototype.hide = function () {
        if (this.fullHide && this.visible) {
            this.scene.input.off(this.listenType, this.onHideHandler, this);
        }
        this.visible = false;
        if (this.callback)
            this.callback.run();
    };
    ItemInfoTips.prototype.show = function () {
        if (this.fullHide && !this.visible) {
            this.scene.input.on(this.listenType, this.onHideHandler, this);
        }
        this.visible = true;
    };
    ItemInfoTips.prototype.resize = function (width, height) {
        this.tipsText.setWrapWidth(width);
        var tipsHeight = this.tipsText.height + 20 * this.dpr;
        if (tipsHeight < height)
            tipsHeight = height;
        this.setSize(width, tipsHeight);
        this.tipsbg.resize(width, tipsHeight);
        this.tipsbg.y = -tipsHeight * 0.5;
        this.tipsText.y = -tipsHeight + 10 * this.dpr;
    };
    ItemInfoTips.prototype.setText = function (text, apha) {
        if (apha === void 0) { apha = 0.9; }
        //  this.tipsbg.alpha = apha;
        this.tipsText.text = text;
        var tipsHeight = this.tipsText.height + 20 * this.dpr;
        var tipsWidth = this.tipsbg.width;
        this.setSize(tipsWidth, tipsHeight);
        this.tipsbg.resize(tipsWidth, tipsHeight);
        this.tipsbg.y = -tipsHeight * 0.5;
        this.tipsText.y = -tipsHeight + 10 * this.dpr;
    };
    ItemInfoTips.prototype.setItemData = function (data) {
        var tex = this.getDesText(data);
        this.setText(tex);
    };
    ItemInfoTips.prototype.setTipsPosition = function (gameobject, container, offsety) {
        if (offsety === void 0) { offsety = 0; }
        var posx = gameobject.x;
        var posy = gameobject.y;
        var tempobject = gameobject;
        while (tempobject.parentContainer !== container) {
            posx += tempobject.parentContainer.x;
            posy += tempobject.parentContainer.y;
            tempobject = tempobject.parentContainer;
        }
        if (posx - this.width * 0.5 < -container.width * 0.5) {
            this.x = this.width * 0.5 - container.width * 0.5 + 20 * this.dpr;
        }
        else if (posx + this.width * 0.5 > container.width * 0.5) {
            this.x = container.width * 0.5 - this.width * 0.5 - 20 * this.dpr;
        }
        else {
            this.x = posx;
        }
        this.y = posy - this.height * 0.5 + 10 * this.dpr + offsety;
    };
    ItemInfoTips.prototype.create = function (bg) {
        var tipsWidth = this.width;
        var tipsHeight = this.height;
        var tipsbg = new NineSlicePatch(this.scene, 0, 0, tipsWidth, tipsHeight, this.key, bg, this.config);
        tipsbg.setPosition(0, -tipsHeight * 0.5);
        this.tipsbg = tipsbg;
        var tipsText = new BBCodeText(this.scene, -this.width * 0.5 + 10 * this.dpr, -tipsHeight + 60 * this.dpr, "", {
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
    };
    ItemInfoTips.prototype.getDesText = function (data) {
        if (!data)
            data = { "sellingPrice": true, tradable: false };
        var text = "[stroke=#2640CA][color=#2640CA][b]" + data.name + "[/b][/color][/stroke]" + "\n";
        text += (data.source ? data.source + "\n" : "");
        text += (data.des ? data.des + "\n" : "");
        text += (data.count > 0 ? "[color=#2640CA][b]x" + data.count + "[/b][/color]" : "");
        return text;
    };
    ItemInfoTips.prototype.onHideHandler = function (pointer) {
        if (!this.checkPointerInBounds(pointer))
            this.hide();
    };
    ItemInfoTips.prototype.checkPointerInBounds = function (pointer) {
        if (pointer && this.invalidArea) {
            if (pointer.x > this.invalidArea.left && pointer.x < this.invalidArea.right) {
                if (pointer.y > this.invalidArea.top && pointer.y < this.invalidArea.bottom) {
                    return true;
                }
            }
        }
        return false;
    };
    return ItemInfoTips;
}(Phaser.GameObjects.Container));
export { ItemInfoTips };
//# sourceMappingURL=ItemInfoTips.js.map