var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { BubbleContainer } from "./bubble/bubble.container";
import { Font } from "structure";
import { FollowEnum, FollowObject, TopDisplay } from "baseRender";
export class ElementTopDisplay extends TopDisplay {
  constructor(scene, owner, render) {
    super(scene, owner, render.scaleRatio, render.uiRatio);
    this.render = render;
    __publicField(this, "mBubble");
    __publicField(this, "isDispose", false);
    __publicField(this, "uiScale");
    this.uiScale = render.uiScale || 1;
  }
  showNickname(name) {
    if (!this.mOwner) {
      return;
    }
    let follow = this.mFollows.get(FollowEnum.Nickname);
    let nickname = null;
    if (follow) {
      nickname = follow.object;
    } else {
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
  }
  hideNickname() {
    this.removeFollowObject(FollowEnum.Nickname);
  }
  showBubble(text, setting) {
    const scene = this.scene;
    if (!scene || !setting) {
      return;
    }
    if (!this.mBubble) {
      this.mBubble = new BubbleContainer(scene, this.mSceneScale, this.render.url);
    }
    this.mBubble.addBubble(text, setting);
    this.mBubble.follow(this.mOwner);
    this.addToSceneUI(this.mBubble);
  }
  clearBubble() {
    if (!this.mBubble) {
      return;
    }
    this.mBubble.destroy();
    this.mBubble = null;
  }
  loadState(state) {
    const key = `state_${state}`;
    if (this.scene.cache.json.exists(key)) {
      this.showStateHandler(this.scene.cache.json.get(key));
    } else {
      const fn = (_key) => {
        if (key === _key) {
          this.showStateHandler(this.scene.cache.json.get(key));
        }
      };
      this.scene.load.once(`filecomplete-json-${key}`, fn, this);
      const path = this.render.url.getRes(`config/base/state/${state}.json`);
      this.scene.load.json(key, path);
      this.scene.load.start();
    }
  }
  showUIState(state) {
    if (state.type !== "text") {
      const pngurl = state.image.display.texturepath;
      const jsonurl = state.image.display.datapath;
      this.loadAtals(pngurl, jsonurl, this, () => {
        let follow;
        let sprite;
        const frame = state.image.img;
        if (state.type === "sprite") {
          const animation = state.image.animation;
          const frames = animation.frame;
          this.scene.anims.create({ key: animation.anikey, frames: this.scene.anims.generateFrameNames(pngurl, { prefix: frame + "_", frames }), duration: animation.duration, repeat: animation.repeat });
          if (this.mFollows.has(FollowEnum.Sprite)) {
            follow = this.mFollows.get(FollowEnum.Sprite);
            sprite = follow.object;
          } else {
            sprite = this.scene.make.sprite({ key: pngurl, frame: frame + "_1" });
            follow = new FollowObject(sprite, this.mOwner, this.mSceneScale);
            this.mFollows.set(FollowEnum.Sprite, follow);
          }
          sprite.play(animation.anikey);
        } else {
          if (this.mFollows.has(FollowEnum.Sprite)) {
            follow = this.mFollows.get(FollowEnum.Sprite);
            sprite = follow.object;
            sprite.setTexture(pngurl, frame);
          } else {
            sprite = this.scene.make.image({ key: pngurl, frame });
            follow = new FollowObject(sprite, this.mOwner, this.mSceneScale);
            this.mFollows.set(FollowEnum.Sprite, follow);
          }
        }
        sprite.setScale(this.uiScale);
        const point = this.getYOffset();
        follow.setOffset(0, point.y);
        this.addToSceneUI(sprite);
        follow.update();
      });
    }
  }
  updateOffset() {
    const offset = this.getYOffset();
    this.mFollows.forEach((follow) => follow.setOffset(0, offset.y));
  }
  getYOffset() {
    const pos = new Phaser.Geom.Point();
    pos.x = 0, pos.y = this.mOwner.topPoint.y;
    return pos;
  }
  addDisplay() {
    if (this.mFollows) {
      this.mFollows.forEach((follow) => {
        if (follow.object)
          this.addToSceneUI(follow.object);
      });
    }
  }
  removeDisplay() {
    if (this.mFollows) {
      this.mFollows.forEach((follow) => follow.remove());
    }
  }
  hasTopPoint() {
    return this.mOwner && this.mOwner.topPoint;
  }
  hasNickName() {
    if (this.mFollows.has(FollowEnum.Nickname))
      return true;
    return false;
  }
  destroy() {
    if (this.mFollows) {
      this.mFollows.forEach((follow) => follow.destroy());
      this.mFollows.clear();
      this.mFollows = void 0;
    }
    if (this.mBubble) {
      this.mBubble.destroy();
      this.mBubble = void 0;
    }
  }
  update() {
    if (this.mFollows) {
      this.mFollows.forEach((follow) => follow.update());
    }
    if (this.mBubble) {
      this.mBubble.follow(this.mOwner);
    }
  }
  addToSceneUI(obj) {
    if (!this.mOwner || !obj) {
      return;
    }
    this.scene.layerManager.addToLayer("sceneUILayer", obj);
  }
  loadAtals(pngurl, jsonurl, context, callback) {
    if (this.scene.textures.exists(pngurl)) {
      if (!this.isDispose && callback)
        callback.call(context);
    } else {
      const pngPath = this.render.url.getUIRes(this.mUIRatio, pngurl);
      const jsonPath = this.render.url.getUIRes(this.mUIRatio, jsonurl);
      this.scene.load.atlas(pngurl, pngPath, jsonPath);
      this.scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
        if (!this.isDispose && callback)
          callback.call(context);
      }, this);
      this.scene.load.start();
    }
  }
  showStateHandler(json) {
    this.showUIState(json);
  }
}
