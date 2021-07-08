import { Font } from "structure";
var TopDisplay = /** @class */ (function () {
    function TopDisplay(scene, owner, sceneScale, uiRatio) {
        this.scene = scene;
        this.mFollows = new Map();
        this.mOwner = owner;
        this.mSceneScale = sceneScale;
        this.mUIRatio = uiRatio;
    }
    TopDisplay.prototype.showNickname = function (name) {
        if (!this.mOwner) {
            return;
        }
        var follow = this.mFollows.get(FollowEnum.Nickname);
        var nickname = null;
        if (follow) {
            nickname = follow.object;
        }
        else {
            nickname = this.scene.make.text({
                style: {
                    fontSize: 12 * this.mSceneScale + "px",
                    fontFamily: Font.DEFULT_FONT
                }
            }).setOrigin(0.5).setStroke("#000000", 2 * this.mSceneScale);
            follow = new FollowObject(nickname, this.mOwner, this.mSceneScale);
            this.mFollows.set(FollowEnum.Nickname, follow);
        }
        nickname.text = name;
        if (!this.mOwner.topPoint)
            return;
        this.addToSceneUI(nickname);
        follow.setOffset(0, this.mOwner.topPoint.y);
        follow.update();
    };
    TopDisplay.prototype.hideNickname = function () {
        this.removeFollowObject(FollowEnum.Nickname);
    };
    TopDisplay.prototype.update = function () {
        if (this.mFollows) {
            this.mFollows.forEach(function (follow) { return follow.update(); });
        }
    };
    TopDisplay.prototype.addToSceneUI = function (obj) {
        throw new Error("");
    };
    TopDisplay.prototype.removeFollowObject = function (key) {
        if (!this.mFollows)
            return;
        if (this.mFollows.has(key)) {
            var follow = this.mFollows.get(key);
            if (follow) {
                follow.destroy();
                this.mFollows.delete(key);
            }
        }
    };
    return TopDisplay;
}());
export { TopDisplay };
var FollowObject = /** @class */ (function () {
    function FollowObject(object, target, dpr) {
        if (dpr === void 0) { dpr = 1; }
        this.mDpr = dpr;
        this.mOffset = new Phaser.Geom.Point();
        this.mObject = object;
        this.mTarget = target;
    }
    FollowObject.prototype.setOffset = function (x, y) {
        this.mOffset.setTo(x, y);
        this.update();
    };
    FollowObject.prototype.update = function () {
        if (!this.mTarget || !this.mObject) {
            return;
        }
        var pos = this.mTarget.getPosition();
        this.mObject.x = Math.round((pos.x + this.mOffset.x) * this.mDpr);
        this.mObject.y = Math.round((pos.y + this.mOffset.y) * this.mDpr);
    };
    FollowObject.prototype.remove = function () {
        if (!this.mObject) {
            return;
        }
        var display = this.mObject;
        if (display.parentContainer)
            display.parentContainer.remove(display);
    };
    FollowObject.prototype.destroy = function () {
        if (this.mObject)
            this.mObject.destroy();
        this.mObject = undefined;
    };
    Object.defineProperty(FollowObject.prototype, "object", {
        get: function () {
            return this.mObject;
        },
        enumerable: true,
        configurable: true
    });
    return FollowObject;
}());
export { FollowObject };
export var FollowEnum;
(function (FollowEnum) {
    FollowEnum[FollowEnum["Nickname"] = 1000] = "Nickname";
    FollowEnum[FollowEnum["Image"] = 1001] = "Image";
    FollowEnum[FollowEnum["Sprite"] = 1002] = "Sprite";
})(FollowEnum || (FollowEnum = {}));
//# sourceMappingURL=top.display.js.map