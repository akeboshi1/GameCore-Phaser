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
import { Bubble } from "./bubble";
import { DynamicImage } from "baseRender";
var BubbleContainer = /** @class */ (function (_super) {
    __extends_1(BubbleContainer, _super);
    function BubbleContainer(scene, scale, url) {
        var _this = _super.call(this, scene) || this;
        _this.url = url;
        _this.mBubbles = [];
        _this.mScale = scale;
        _this.mArrow = new DynamicImage(_this.scene, 0, 0);
        _this.mArrow.scale = scale;
        _this.mArrow.load(url.getRes("ui/chat/bubble_arrow.png"));
        _this.add(_this.mArrow);
        return _this;
    }
    BubbleContainer.prototype.addBubble = function (text, bubbleSetting) {
        if (!bubbleSetting)
            bubbleSetting = {};
        var bubble = this.createBubble(bubbleSetting);
        if (!bubble)
            return;
        var len = this.mBubbles.length;
        var bul = null;
        var h = 0;
        bubble.show(text, bubbleSetting);
        for (var i = len - 1; i >= 0; i--) {
            bul = this.mBubbles[i];
            h += bul.minHeight + 5 * this.mScale;
            bul.tweenTo(-h);
        }
        this.add(bubble);
        this.mArrow.y = 4 * this.mScale;
    };
    BubbleContainer.prototype.follow = function (target) {
        if (this.mBubbles.length === 0) {
            return;
        }
        var position = target.getPosition();
        if (!position) {
            return;
        }
        this.updatePos(position.x, position.y - 110);
    };
    BubbleContainer.prototype.updatePos = function (x, y) {
        this.x = x * this.mScale;
        this.y = y * this.mScale;
    };
    BubbleContainer.prototype.destroy = function (fromScene) {
        if (!this.mBubbles)
            return;
        // const len = this.mBubbles.length;
        // let bul: Bubble = null;
        // for (let i = len - 1; i >= 0; i--) {
        //     bul = this.mBubbles[i];
        //     if (!bul) continue;
        //     bul.destroy();
        // }
        this.mBubbles = null;
        this.removeFormParent();
        _super.prototype.destroy.call(this, fromScene);
    };
    BubbleContainer.prototype.removeFormParent = function () {
        if (this.parentContainer) {
            this.parentContainer.remove(this);
        }
    };
    BubbleContainer.prototype.createBubble = function (bubbleSetting) {
        if (!bubbleSetting)
            bubbleSetting = {};
        var bubble = new Bubble(this.scene, this.mScale, this.url);
        this.mBubbles.push(bubble);
        var duration = bubbleSetting.duration ? bubbleSetting.duration : 5000;
        bubble.durationRemove(duration, this.onRemoveBubble, this);
        return bubble;
    };
    BubbleContainer.prototype.onRemoveBubble = function (bubble) {
        if (!bubble) {
            return;
        }
        this.mBubbles = this.mBubbles.filter(function (val) { return bubble !== val; });
        this.remove(bubble);
        bubble.destroy();
        if (this.mBubbles.length === 0) {
            this.removeFormParent();
        }
    };
    return BubbleContainer;
}(Phaser.GameObjects.Container));
export { BubbleContainer };
//# sourceMappingURL=bubble.container.js.map