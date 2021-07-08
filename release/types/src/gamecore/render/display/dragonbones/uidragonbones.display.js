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
import { DragonbonesDisplay } from "./dragonbones.display";
var UIDragonbonesDisplay = /** @class */ (function (_super) {
    __extends_1(UIDragonbonesDisplay, _super);
    function UIDragonbonesDisplay() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.mInteractive = false;
        _this.isBack = false;
        return _this;
    }
    UIDragonbonesDisplay.prototype.play = function (val) {
        val.name = this.getAnimationName(val.name) + (this.isBack ? "_back" : "");
        _super.prototype.play.call(this, val);
        if (this.mArmatureDisplay) {
            if (this.mArmatureDisplay.hasDBEventListener(dragonBones.EventObject.LOOP_COMPLETE)) {
                this.mArmatureDisplay.removeDBEventListener(dragonBones.EventObject.LOOP_COMPLETE, this.onArmatureLoopComplete, this);
            }
            if (val.times > 0) {
                this.mArmatureDisplay.addDBEventListener(dragonBones.EventObject.LOOP_COMPLETE, this.onArmatureLoopComplete, this);
            }
        }
    };
    UIDragonbonesDisplay.prototype.setBack = function (back) {
        this.isBack = back;
    };
    UIDragonbonesDisplay.prototype.setCompleteHandler = function (compl) {
        this.mComplHandler = compl;
    };
    UIDragonbonesDisplay.prototype.setSuits = function (suits) {
        if (suits) {
            for (var _i = 0, suits_1 = suits; _i < suits_1.length; _i++) {
                var suit = suits_1[_i];
                if (suit.suit_type === "weapon") {
                    if (suit.tag) {
                        this.AniAction = JSON.parse(suit.tag).action;
                        return;
                    }
                }
            }
        }
        this.AniAction = undefined;
    };
    UIDragonbonesDisplay.prototype.getAnimationName = function (name) {
        if (this.AniAction) {
            if (name === "idle")
                return this.AniAction[0];
            else if (name === "walk")
                return this.AniAction[1];
        }
        return name;
    };
    Object.defineProperty(UIDragonbonesDisplay.prototype, "back", {
        get: function () {
            return this.isBack;
        },
        enumerable: true,
        configurable: true
    });
    UIDragonbonesDisplay.prototype.displayCreated = function () {
        _super.prototype.displayCreated.call(this);
        this.play({ name: "idle", flip: false });
    };
    UIDragonbonesDisplay.prototype.onArmatureLoopComplete = function (event) {
        if (!this.mArmatureDisplay || !this.mAnimation) {
            return;
        }
        this.mArmatureDisplay.removeDBEventListener(dragonBones.EventObject.LOOP_COMPLETE, this.onArmatureLoopComplete, this);
        var queue = this.mAnimation.playingQueue;
        if (!queue || queue.name === undefined) {
            if (this.mComplHandler)
                this.mComplHandler.run();
        }
        else {
            var runAni = {
                name: queue.name,
                times: queue.playTimes,
                flip: this.mAnimation.flip
            };
            this.play(runAni);
        }
    };
    return UIDragonbonesDisplay;
}(DragonbonesDisplay));
export { UIDragonbonesDisplay };
//# sourceMappingURL=uidragonbones.display.js.map