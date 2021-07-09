var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { SceneName } from "structure";
import { Tool } from "utils";
import { BaseGuide } from "./base.guide";
export class BasePlaySceneGuide extends BaseGuide {
  constructor(id, uiManager) {
    super(uiManager.render);
    __publicField(this, "mElementID");
    __publicField(this, "mElement");
    __publicField(this, "mPlayScene");
    __publicField(this, "mPointer");
    this.mElementID = id;
    this.mPlayScene = this.render.game.scene.getScene(SceneName.PLAY_SCENE);
  }
  get data() {
    return this.mElementID;
  }
  show(param) {
    super.show(param);
    this.mElement = this.render.displayManager.getDisplay(this.mElementID);
    if (!this.mElement)
      this.end();
    this.step1(this.getGuidePosition());
  }
  hide() {
    this.mPlayScene.input.off("gameobjectup", this.gameObjectUpHandler, this);
    if (this.mPointer) {
      this.mPlayScene.motionMgr.onGuideOnPointUpHandler(this.mPointer, this.mElementID);
      this.mPointer = null;
    }
    super.hide();
  }
  checkInteractive(data) {
    if (data === this.mElementID)
      return false;
    return true;
  }
  step1(pos) {
    const tmpPos = { x: pos.x, y: pos.y };
    this.guideEffect.createGuideEffect(tmpPos, this.mData.guideText[0]);
    this.mPlayScene.input.on("gameobjectup", this.gameObjectUpHandler, this);
  }
  gameObjectUpHandler(pointer, gameobject) {
    const id = gameobject.getData("id");
    if (id === this.mElementID) {
      this.mPointer = pointer;
      this.end();
    }
  }
  updateGuidePos() {
    this.guideEffect.createGuideEffect(this.getGuidePosition(), this.mData.guideText[0]);
  }
  getGuidePosition() {
    if (!this.mElement) {
      this.mPlayScene.input.off("gameobjectup", this.gameObjectUpHandler, this);
      this.end();
      return;
    }
    const pos = Tool.getPosByScenes(this.mPlayScene, { x: this.mElement.x, y: this.mElement.y });
    const tmpPos = { x: pos.x, y: pos.y };
    return tmpPos;
  }
}
