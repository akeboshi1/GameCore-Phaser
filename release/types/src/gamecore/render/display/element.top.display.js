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
import { BubbleContainer } from "./bubble/bubble.container";
import { Font } from "structure";
import { FollowEnum, FollowObject, TopDisplay } from "baseRender";
/**
 * 人物头顶显示对象
 */
var ElementTopDisplay = /** @class */ (function (_super) {
    __extends_1(ElementTopDisplay, _super);
    function ElementTopDisplay(scene, owner, render) {
        var _this = _super.call(this, scene, owner, render.scaleRatio, render.uiRatio) || this;
        _this.render = render;
        _this.isDispose = false;
        _this.uiScale = render.uiScale || 1;
        return _this;
    }
    ElementTopDisplay.prototype.showNickname = function (name) {
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
        this.addToSceneUI(nickname);
        if (!this.mOwner.topPoint)
            return;
        follow.setOffset(0, this.mOwner.topPoint.y);
        follow.update();
    };
    ElementTopDisplay.prototype.hideNickname = function () {
        this.removeFollowObject(FollowEnum.Nickname);
    };
    ElementTopDisplay.prototype.showBubble = function (text, setting) {
        var scene = this.scene;
        if (!scene || !setting) {
            return;
        }
        if (!this.mBubble) {
            this.mBubble = new BubbleContainer(scene, this.mSceneScale, this.render.url);
        }
        this.mBubble.addBubble(text, setting);
        this.mBubble.follow(this.mOwner);
        this.addToSceneUI(this.mBubble);
    };
    ElementTopDisplay.prototype.clearBubble = function () {
        if (!this.mBubble) {
            return;
        }
        this.mBubble.destroy();
        this.mBubble = null;
    };
    ElementTopDisplay.prototype.loadState = function (state) {
        var _this = this;
        var key = "state_" + state;
        if (this.scene.cache.json.exists(key)) {
            this.showStateHandler(this.scene.cache.json.get(key));
        }
        else {
            var fn = function (_key) {
                if (key === _key) {
                    _this.showStateHandler(_this.scene.cache.json.get(key));
                }
            };
            this.scene.load.once("filecomplete-json-" + key, fn, this);
            var path = this.render.url.getRes("config/base/state/" + state + ".json");
            this.scene.load.json(key, path);
            this.scene.load.start();
        }
    };
    ElementTopDisplay.prototype.showUIState = function (state) {
        var _this = this;
        if (state.type !== "text") {
            var pngurl_1 = state.image.display.texturepath;
            var jsonurl = state.image.display.datapath;
            this.loadAtals(pngurl_1, jsonurl, this, function () {
                var follow;
                var sprite;
                var frame = state.image.img;
                if (state.type === "sprite") {
                    var animation = state.image.animation;
                    var frames_1 = animation.frame;
                    _this.scene.anims.create({ key: animation.anikey, frames: _this.scene.anims.generateFrameNames(pngurl_1, { prefix: frame + "_", frames: frames_1 }), duration: animation.duration, repeat: animation.repeat });
                    if (_this.mFollows.has(FollowEnum.Sprite)) {
                        follow = _this.mFollows.get(FollowEnum.Sprite);
                        sprite = follow.object;
                    }
                    else {
                        sprite = _this.scene.make.sprite({ key: pngurl_1, frame: frame + "_1" });
                        follow = new FollowObject(sprite, _this.mOwner, _this.mSceneScale);
                        _this.mFollows.set(FollowEnum.Sprite, follow);
                    }
                    sprite.play(animation.anikey);
                }
                else {
                    if (_this.mFollows.has(FollowEnum.Sprite)) {
                        follow = _this.mFollows.get(FollowEnum.Sprite);
                        sprite = follow.object;
                        sprite.setTexture(pngurl_1, frame);
                    }
                    else {
                        sprite = _this.scene.make.image({ key: pngurl_1, frame: frame });
                        follow = new FollowObject(sprite, _this.mOwner, _this.mSceneScale);
                        _this.mFollows.set(FollowEnum.Sprite, follow);
                    }
                }
                sprite.setScale(_this.uiScale);
                var point = _this.getYOffset();
                follow.setOffset(0, point.y);
                _this.addToSceneUI(sprite);
                follow.update();
            });
        }
    };
    ElementTopDisplay.prototype.updateOffset = function () {
        var offset = this.getYOffset();
        this.mFollows.forEach(function (follow) { return follow.setOffset(0, offset.y); });
    };
    ElementTopDisplay.prototype.getYOffset = function () {
        var pos = new Phaser.Geom.Point();
        pos.x = 0, pos.y = this.mOwner.topPoint.y;
        // if (this.mFollows.has(FollowEnum.Nickname)) {
        //     const follow = this.mFollows.get(FollowEnum.Nickname);
        //     if (follow && follow.object) {
        //         pos.y += (<any>(follow.object)).height * 0.5;
        //     }
        // }
        return pos;
    };
    ElementTopDisplay.prototype.addDisplay = function () {
        var _this = this;
        if (this.mFollows) {
            this.mFollows.forEach(function (follow) {
                if (follow.object)
                    _this.addToSceneUI(follow.object);
            });
        }
    };
    ElementTopDisplay.prototype.removeDisplay = function () {
        if (this.mFollows) {
            this.mFollows.forEach(function (follow) { return follow.remove(); });
        }
    };
    ElementTopDisplay.prototype.hasTopPoint = function () {
        // return this.mOwner && this.mOwner.hasOwnProperty("topPoint");
        return this.mOwner && this.mOwner.topPoint;
    };
    ElementTopDisplay.prototype.hasNickName = function () {
        if (this.mFollows.has(FollowEnum.Nickname))
            return true;
        return false;
    };
    ElementTopDisplay.prototype.destroy = function () {
        if (this.mFollows) {
            this.mFollows.forEach(function (follow) { return follow.destroy(); });
            this.mFollows.clear();
            this.mFollows = undefined;
        }
        if (this.mBubble) {
            this.mBubble.destroy();
            this.mBubble = undefined;
        }
    };
    ElementTopDisplay.prototype.update = function () {
        if (this.mFollows) {
            this.mFollows.forEach(function (follow) { return follow.update(); });
        }
        if (this.mBubble) {
            this.mBubble.follow(this.mOwner);
        }
    };
    ElementTopDisplay.prototype.addToSceneUI = function (obj) {
        if (!this.mOwner || !obj) {
            return;
        }
        this.scene.layerManager.addToLayer("sceneUILayer", obj);
    };
    // private removeFollowObject(key: FollowEnum) {
    //     if (!this.mFollows) return;
    //     if (this.mFollows.has(key)) {
    //         const follow = this.mFollows.get(key);
    //         if (follow) {
    //             follow.destroy();
    //             this.mFollows.delete(key);
    //         }
    //     }
    // }
    ElementTopDisplay.prototype.loadAtals = function (pngurl, jsonurl, context, callback) {
        var _this = this;
        if (this.scene.textures.exists(pngurl)) {
            if (!this.isDispose && callback)
                callback.call(context);
        }
        else {
            var pngPath = this.render.url.getUIRes(this.mUIRatio, pngurl);
            var jsonPath = this.render.url.getUIRes(this.mUIRatio, jsonurl);
            this.scene.load.atlas(pngurl, pngPath, jsonPath);
            this.scene.load.once(Phaser.Loader.Events.COMPLETE, function () {
                if (!_this.isDispose && callback)
                    callback.call(context);
            }, this);
            this.scene.load.start();
        }
    };
    ElementTopDisplay.prototype.showStateHandler = function (json) {
        this.showUIState(json);
    };
    return ElementTopDisplay;
}(TopDisplay));
export { ElementTopDisplay };
//# sourceMappingURL=element.top.display.js.map