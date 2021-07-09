var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { op_gameconfig, op_gameconfig_01, op_def } from "pixelpai_proto";
import { FramesModel } from "baseGame";
import { LogicPos, AnimationModel } from "structure";
export class SpawnPoint {
  constructor() {
    __publicField(this, "id");
    __publicField(this, "avatar");
    __publicField(this, "nickname");
    __publicField(this, "alpha");
    __publicField(this, "displayBadgeCards");
    __publicField(this, "walkableArea");
    __publicField(this, "collisionArea");
    __publicField(this, "originPoint");
    __publicField(this, "walkOriginPoint");
    __publicField(this, "platformId");
    __publicField(this, "sceneId");
    __publicField(this, "nodeType");
    __publicField(this, "currentAnimation");
    __publicField(this, "currentAnimationName");
    __publicField(this, "displayInfo");
    __publicField(this, "direction");
    __publicField(this, "pos");
    __publicField(this, "bindID");
    __publicField(this, "sn");
    __publicField(this, "attrs");
    __publicField(this, "animationQueue");
    __publicField(this, "suits");
    __publicField(this, "titleMask");
    __publicField(this, "sound");
    this.id = 100;
    this.nodeType = op_def.NodeType.SpawnPointType;
    this.pos = new LogicPos();
    this.displayInfo = new FramesModel({
      id: 0,
      animations: {
        defaultAnimationName: "idle",
        display: this.display,
        animationData: [new AnimationModel(this.animation)]
      }
    });
    this.currentAnimation = {
      name: "idle",
      flip: false
    };
    this.direction = 3;
    this.nickname = "\u51FA\u751F\u70B9";
    this.alpha = 1;
  }
  newID() {
    throw new Error("Method not implemented.");
  }
  setPosition(x, y) {
    this.pos.x = x;
    this.pos.y = y;
  }
  turn() {
    throw new Error("Method not implemented.");
  }
  toSprite() {
    throw new Error("Method not implemented.");
  }
  updateAvatar(avatar) {
    throw new Error("Method not implemented.");
  }
  setTempAvatar(avatar) {
    throw new Error("Method not implemented.");
  }
  updateAvatarSuits(suits) {
    throw false;
  }
  updateDisplay(display, animations, defAnimation) {
    throw new Error("Method not implemented.");
  }
  updateAttr(attrs) {
    throw new Error("Method not implemented.");
  }
  setAnimationName() {
    throw new Error("Method not implemented.");
  }
  setAnimationQueue() {
    throw new Error("Method not implemented.");
  }
  get display() {
    const display = op_gameconfig.Display.create();
    display.texturePath = "pixelpai/SpawnPointNode/5cc42f6417553727db1d2bba/1/5cc42f6417553727db1d2bba.png";
    display.dataPath = "pixelpai/SpawnPointNode/5cc42f6417553727db1d2bba/1/5cc42f6417553727db1d2bba.json";
    return display;
  }
  get animation() {
    const animation = op_gameconfig_01.AnimationData.create();
    animation.frameRate = 5;
    animation.collisionArea = "1,1&1,1";
    animation.loop = true;
    animation.baseLoc = "-30,-30";
    animation.originPoint = [0, 0];
    animation.frameName = ["switch_0027_3_01.png"];
    animation.node = op_gameconfig_01.Node.create();
    animation.node.id = 0;
    animation.node.name = "idle";
    animation.node.Parent = 0;
    return animation;
  }
  setDirection() {
  }
  setDisplayInfo() {
  }
  getCollisionArea() {
    return this.currentCollisionArea;
  }
  getWalkableArea() {
    return this.currentWalkableArea;
  }
  getOriginPoint() {
    return { x: 0, y: 0 };
  }
  getInteractive() {
    return [];
  }
  registerAnimationMap(key, value) {
  }
  unregisterAnimationMap(key) {
  }
  get currentCollisionArea() {
    return [[1, 1], [1, 1]];
  }
  get currentWalkableArea() {
    return [[0]];
  }
  get currentCollisionPoint() {
    return new Phaser.Geom.Point(0, 0);
  }
  get hasInteractive() {
    return false;
  }
  get interactive() {
    return [];
  }
  get speed() {
    return 0;
  }
}
