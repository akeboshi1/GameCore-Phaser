var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Direction, EventDispatcher, Logger, LogicPoint, LogicPos, AnimationModel, Animator, AvatarSuitType } from "structure";
import { op_def, op_gameconfig, op_client } from "pixelpai_proto";
import { Helpers } from "game-capsule";
import * as sha1 from "simple-sha1";
var TitleMask;
(function(TitleMask2) {
  TitleMask2[TitleMask2["TQ_NickName"] = 65536] = "TQ_NickName";
  TitleMask2[TitleMask2["TQ_Badge"] = 131072] = "TQ_Badge";
})(TitleMask || (TitleMask = {}));
export var Flag;
(function(Flag2) {
  Flag2[Flag2["Pos"] = 0] = "Pos";
  Flag2[Flag2["AnimationName"] = 1] = "AnimationName";
  Flag2[Flag2["Direction"] = 2] = "Direction";
  Flag2[Flag2["Mount"] = 3] = "Mount";
  Flag2[Flag2["NickName"] = 4] = "NickName";
  Flag2[Flag2["Alpha"] = 5] = "Alpha";
  Flag2[Flag2["Speed"] = 6] = "Speed";
  Flag2[Flag2["Avatar"] = 7] = "Avatar";
  Flag2[Flag2["Display"] = 8] = "Display";
})(Flag || (Flag = {}));
export class Sprite extends EventDispatcher {
  constructor(obj, nodeType) {
    super();
    __publicField(this, "id");
    __publicField(this, "pos");
    __publicField(this, "titleMask");
    __publicField(this, "avatar");
    __publicField(this, "currentAnimationName");
    __publicField(this, "direction", 3);
    __publicField(this, "bindID");
    __publicField(this, "sn");
    __publicField(this, "alpha");
    __publicField(this, "nickname");
    __publicField(this, "displayBadgeCards");
    __publicField(this, "package");
    __publicField(this, "sceneId");
    __publicField(this, "uuid");
    __publicField(this, "platformId");
    __publicField(this, "displayInfo");
    __publicField(this, "nodeType");
    __publicField(this, "currentAnimation");
    __publicField(this, "currentCollisionArea");
    __publicField(this, "currentWalkableArea");
    __publicField(this, "currentCollisionPoint");
    __publicField(this, "version");
    __publicField(this, "isMoss");
    __publicField(this, "registerAnimation");
    __publicField(this, "originWalkPoint");
    __publicField(this, "originCollisionPoint");
    __publicField(this, "attrs");
    __publicField(this, "suits");
    __publicField(this, "animationQueue");
    __publicField(this, "mountSprites");
    __publicField(this, "speed");
    __publicField(this, "interactive");
    __publicField(this, "animator");
    __publicField(this, "updateSuits", false);
    __publicField(this, "layer");
    __publicField(this, "sound");
    __publicField(this, "curState", 0);
    this.id = obj.id;
    this.bindID = obj.bindId;
    this.nodeType = nodeType;
    this.nickname = obj.nickname;
    this.updateAttr(obj.attrs);
    if (this.updateSuits)
      this.updateAvatarSuits(this.suits);
    this.avatar = this.avatar || obj.avatar;
    if (this.avatar) {
      this.updateAvatar(this.avatar);
    }
    if (obj.display) {
      this.updateDisplay(obj.display, obj.animations, obj.currentAnimationName);
    }
    if (obj.point3f) {
      const point = obj.point3f;
      this.pos = new LogicPos(point.x, point.y, point.z);
    } else {
      this.pos = new LogicPos(0, 0);
    }
    if (obj.sn) {
      this.sn = obj.sn;
    }
    this.titleMask = obj.titleMask;
    this.alpha = obj.opacity === void 0 ? 1 : obj.opacity / 100;
    this.displayBadgeCards = obj.displayBadgeCards;
    if (obj.layer) {
      this.layer = obj.layer;
    }
    if (obj.version) {
      this.version = obj.version;
    }
    if (obj.isMoss !== void 0) {
      this.isMoss = obj.isMoss;
    }
    this.tryRegisterAnimation(obj.animationRegistrationMap);
    this.currentAnimationName = obj.currentAnimationName;
    this.setDirection(obj.direction || 3);
    if (!this.currentCollisionArea) {
      this.currentCollisionArea = this.getCollisionArea();
    }
    if (!this.currentWalkableArea) {
      this.currentWalkableArea = this.getWalkableArea();
    }
    if (!this.currentCollisionPoint) {
      this.currentCollisionPoint = this.getOriginPoint();
    }
    if (!this.interactive) {
      this.interactive = this.getInteractive();
    }
    this.mountSprites = obj.mountSprites;
    this.speed = obj.speed;
  }
  toSprite() {
    const sprite = op_client.Sprite.create();
    sprite.id = this.id;
    sprite.nickname = this.nickname;
    if (this.displayInfo instanceof FramesModel) {
      sprite.display = this.displayInfo.display;
      sprite.currentAnimationName = this.currentAnimationName;
      sprite.animations = this.displayInfo.createProtocolObject();
    } else if (this.displayInfo instanceof DragonbonesModel) {
      if (this.avatar) {
        const avatar = op_gameconfig.Avatar.create();
        for (const key in this.avatar) {
          if (Object.prototype.hasOwnProperty.call(this.avatar, key)) {
            avatar[key] = this.avatar[key];
          }
        }
        sprite.avatar = avatar;
      }
    }
    if (this.pos) {
      const point3f = op_def.PBPoint3f.create();
      point3f.x = this.pos.x;
      point3f.y = this.pos.y;
      point3f.z = this.pos.z;
      sprite.point3f = point3f;
    }
    sprite.direction = this.direction;
    sprite.bindId = this.bindID;
    sprite.sn = this.sn;
    sprite.version = this.version;
    return sprite;
  }
  showNickName() {
    return (this.titleMask & 65536) > 0;
  }
  showBadge() {
    return (this.titleMask & 131072) > 0;
  }
  newID() {
    this.id = Helpers.genId();
  }
  setPosition(x, y) {
    if (!this.pos) {
      this.pos = new LogicPos();
    }
    this.pos.x = x;
    this.pos.y = y;
  }
  turn() {
    if (!this.displayInfo) {
      return;
    }
    const dirable = this.dirable(this.currentAnimationName);
    const index = dirable.indexOf(this.direction);
    if (index > -1) {
      this.setDirection(dirable[(index + 1) % dirable.length]);
    } else {
      Logger.getInstance().error(`${Sprite.name}: error dir ${this.direction}`);
    }
    return this;
  }
  updateAvatarSuits(suits) {
    this.updateSuits = false;
    if (suits) {
      if (suits.length > 0) {
        this.suits = suits;
        this.avatar = AvatarSuitType.createHasBaseAvatar(suits);
      } else {
        this.avatar = AvatarSuitType.createBaseAvatar();
      }
      return true;
    }
    return false;
  }
  updateAvatar(avatar) {
    if (this.displayInfo) {
      this.displayInfo.destroy();
    }
    this.avatar = { id: avatar.id };
    this.avatar = Object.assign(this.avatar, avatar);
    this.displayInfo = new DragonbonesModel(this);
  }
  setTempAvatar(avatar) {
    if (this.displayInfo) {
      this.displayInfo.destroy();
    }
    let tempAvatar = { id: avatar.id };
    tempAvatar = Object.assign(tempAvatar, this.avatar);
    tempAvatar = Object.assign(tempAvatar, avatar);
    this.displayInfo = new DragonbonesModel({ id: this.id, avatar: tempAvatar });
  }
  getAvatarSuits(attrs) {
    let suits;
    if (attrs) {
      for (const attr of attrs) {
        if (attr.key === "PKT_AVATAR_SUITS") {
          suits = JSON.parse(attr.value);
          break;
        }
      }
    }
    return suits;
  }
  updateAttr(attrs) {
    this.attrs = attrs;
    if (!attrs)
      return;
    let suits;
    for (const attr of attrs) {
      if (attr.key === "PKT_AVATAR_SUITS") {
        suits = JSON.parse(attr.value);
        if (suits && suits.length > 0) {
          this.suits = suits;
          this.updateSuits = true;
          if (!this.animator)
            this.animator = new Animator(this.suits);
          else
            this.animator.setSuits(this.suits);
        }
      } else if (attr.key === "touchSound") {
        this.sound = attr.value;
      }
    }
  }
  updateDisplay(display, animations, defAnimation) {
    if (!display || !animations) {
      return;
    }
    if (!display.dataPath || !display.texturePath) {
      return;
    }
    if (this.displayInfo) {
      this.displayInfo = null;
    }
    const anis = [];
    const objAnis = animations;
    for (const ani of objAnis) {
      anis.push(new AnimationModel(ani));
    }
    defAnimation = defAnimation || this.currentAnimationName || "";
    this.displayInfo = new FramesModel({
      animations: {
        defaultAnimationName: defAnimation,
        display,
        animationData: anis
      },
      id: this.id,
      sound: this.sound
    });
    if (defAnimation) {
      this.setAnimationData(defAnimation, this.direction);
    }
  }
  setAnimationQueue(queue) {
    this.animationQueue = queue;
  }
  setMountSprites(ids) {
    this.mountSprites = ids;
  }
  setAnimationName(name, times) {
    const baseName = this.getBaseAniName(name);
    const suffix = name.split("_")[1];
    const aniName = suffix ? `${baseName}_${suffix}` : baseName;
    if (!this.currentAnimation || this.currentAnimation.name !== aniName) {
      if (this.displayInfo) {
        name = this.animator ? this.animator.getAnimationName(name) : name;
      }
      this.currentAnimationName = name;
      const ani = this.setAnimationData(name, this.direction, times);
      return ani;
    }
    return null;
  }
  setDirection(val) {
    if (!val)
      return;
    this.direction = val;
    if (!this.displayInfo) {
      return;
    }
    if (this.currentAnimationName)
      this.direction = this.displayInfo.checkDirectionByExistAnimations(this.getBaseAniName(this.currentAnimationName), this.direction);
    this.setAnimationData(this.currentAnimationName, this.direction);
  }
  setDisplayInfo(displayInfo) {
    this.displayInfo = displayInfo;
    this.displayInfo.id = this.id;
    if (this.currentAnimationName) {
      if (displayInfo.discriminator === "FramesModel") {
        this.setAnimationData(this.currentAnimationName, this.direction);
      } else {
        if (displayInfo.animationName)
          this.setAnimationName(displayInfo.animationName);
      }
    } else {
      if (displayInfo.animationName) {
        this.setAnimationName(displayInfo.animationName);
      }
    }
  }
  get hasInteractive() {
    if (!this.displayInfo || !this.currentAnimation) {
      return false;
    }
    const { name: animationName } = this.currentAnimation;
    const area = this.displayInfo.getInteractiveArea(animationName);
    if (area && area.length > 0) {
      return true;
    }
    return false;
  }
  getInteractive() {
    if (!this.displayInfo || !this.currentAnimation) {
      return;
    }
    const { name: animationName, flip } = this.currentAnimation;
    return this.displayInfo.getInteractiveArea(animationName, flip);
  }
  setOriginCollisionPoint(value) {
    if (this.originCollisionPoint === void 0) {
      this.originCollisionPoint = new LogicPoint();
    }
    if (value && value.length > 1) {
      this.originCollisionPoint.x = value[0];
      this.originCollisionPoint.y = value[1];
    }
  }
  setOriginWalkPoint(value) {
    if (this.originWalkPoint === void 0) {
      this.originWalkPoint = new LogicPoint();
    }
    if (value && value.length > 1) {
      this.originWalkPoint.x = value[0];
      this.originWalkPoint.y = value[1];
    }
  }
  getCollisionArea() {
    if (!this.displayInfo || !this.currentAnimation) {
      return;
    }
    const { name: animationName, flip } = this.currentAnimation;
    return this.displayInfo.getCollisionArea(animationName, flip);
  }
  getWalkableArea() {
    if (!this.displayInfo || !this.currentAnimation) {
      return;
    }
    const { name: animationName, flip } = this.currentAnimation;
    return this.displayInfo.getWalkableArea(animationName, flip);
  }
  getOriginPoint() {
    if (!this.displayInfo || !this.currentAnimation) {
      return;
    }
    const { name: animationName, flip } = this.currentAnimation;
    return this.displayInfo.getOriginPoint(animationName, flip);
  }
  registerAnimationMap(key, value) {
    if (!this.registerAnimation)
      this.registerAnimation = new Map();
    this.registerAnimation.set(key, value);
  }
  unregisterAnimationMap(key) {
    if (!this.registerAnimation)
      return;
    this.registerAnimation.delete(key);
  }
  importDisplayRef(displayRef) {
    const { pos, direction, displayModel } = displayRef;
    this.pos = new LogicPos(pos.x, pos.y, pos.z);
    this.direction = direction;
    this.displayInfo = displayModel;
    if (!this.displayInfo) {
      Logger.getInstance().error(`${displayRef.name}-${displayRef.id} displayInfo does not exise!`);
      return this;
    }
    this.setAnimationName(this.displayInfo.animationName);
    return this;
  }
  setAnimationData(animationName, direction, times) {
    if (!this.displayInfo || !animationName) {
      return;
    }
    const baseAniName = this.getBaseAniName(animationName);
    if (!this.displayInfo.findAnimation) {
      Logger.getInstance().error("displayInfo no findanimation ====>", this.displayInfo);
    } else {
      this.currentAnimation = this.displayInfo.findAnimation(baseAniName, direction);
      this.currentAnimation.times = times;
      if (this.animationQueue && this.animationQueue.length > 0)
        this.currentAnimation.playingQueue = this.animationQueue[0];
      if (this.currentCollisionArea) {
        this.setArea();
      }
      this.emit("Animation_Change", { id: this.id, direction: this.direction, animation: this.currentAnimation, playTimes: times });
    }
    return this.currentAnimation;
  }
  checkDirectionAnimation(baseAniName, dir) {
    const aniName = `${baseAniName}_${dir}`;
    if (this.displayInfo.existAnimation(aniName)) {
      return aniName;
    }
    return null;
  }
  setArea() {
    this.currentCollisionArea = this.getCollisionArea();
    this.currentWalkableArea = this.getWalkableArea();
    this.currentCollisionPoint = this.getOriginPoint();
  }
  dirable(aniName) {
    const baseAniName = aniName.split("_")[0];
    const dirs = [3, 5];
    if (this.checkDirectionAnimation(baseAniName, Direction.east_north)) {
      dirs.push(7, 1);
    }
    return dirs;
  }
  tryRegisterAnimation(anis) {
    if (!anis || anis.length < 1) {
      return;
    }
    this.registerAnimation = new Map();
    for (const ani of anis) {
      this.registerAnimation.set(ani.key, ani.value);
    }
  }
  getBaseAniName(animationName) {
    if (!animationName)
      return void 0;
    let baseAniName = animationName.split(`_`)[0];
    if (this.registerAnimation) {
      if (this.registerAnimation.has(baseAniName)) {
        baseAniName = this.registerAnimation.get(baseAniName);
      }
    }
    return baseAniName;
  }
}
export class FramesModel {
  constructor(data) {
    __publicField(this, "avatarDir");
    __publicField(this, "discriminator", "FramesModel");
    __publicField(this, "id");
    __publicField(this, "type");
    __publicField(this, "eventName");
    __publicField(this, "display");
    __publicField(this, "sound");
    __publicField(this, "animations");
    __publicField(this, "animationName");
    __publicField(this, "package");
    __publicField(this, "shops");
    __publicField(this, "gene");
    this.id = data.id || 0;
    this.type = data.sn || "";
    this.eventName = data.eventName;
    this.sound = data.sound;
    const anis = data.animations;
    if (anis) {
      this.animationName = anis.defaultAnimationName;
      this.setDisplay(anis.display);
      this.setAnimationData(anis.animationData);
    }
  }
  static createFromDisplay(display, animation, id) {
    const anis = [];
    const aniName = animation[0].node.name;
    for (const ani of animation) {
      anis.push(new AnimationModel(ani));
    }
    const animations = new Map();
    for (const aniData of anis) {
      animations.set(aniData.name, aniData);
    }
    return {
      animations,
      id: id || 0,
      gene: sha1.sync(display.dataPath + display.texturePath),
      discriminator: "FramesModel",
      animationName: aniName,
      display,
      sound: ""
    };
  }
  setInfo(val) {
    for (const key in val) {
      if (val.hasOwnProperty(key)) {
        this[key] = val[key];
      }
    }
  }
  getAnimationData() {
    return this.animations;
  }
  existAnimation(aniName) {
    if (!this.animations)
      return false;
    return this.animations.has(aniName);
  }
  getAnimations(name) {
    if (!this.animations)
      return;
    return this.animations.get(name);
  }
  destroy() {
    if (this.animations)
      this.animations.clear();
  }
  createProtocolObject() {
    const anis = [];
    this.animations.forEach((ani) => {
      anis.push(ani.createProtocolObject());
    }, this);
    return anis;
  }
  getCollisionArea(aniName, flip = false) {
    const ani = this.getAnimations(aniName);
    if (ani) {
      if (flip) {
        return Helpers.flipArray(ani.collisionArea);
      }
      return ani.collisionArea;
    }
  }
  getWalkableArea(aniName, flip = false) {
    const ani = this.getAnimations(aniName);
    if (!ani) {
      return;
    }
    if (flip) {
      return Helpers.flipArray(ani.walkableArea);
    }
    return ani.walkableArea;
  }
  getInteractiveArea(aniName, flip = false) {
    const ani = this.getAnimations(aniName);
    if (ani) {
      if (flip) {
        const area = [];
        const interactiveArea = ani.interactiveArea;
        for (const interactive of interactiveArea) {
          area.push({ x: interactive.y, y: interactive.x });
        }
        return area;
      }
      return ani.interactiveArea;
    }
    return;
  }
  getOriginPoint(aniName, flip = false) {
    const ani = this.getAnimations(aniName);
    if (ani) {
      const originPoint = ani.originPoint;
      if (flip) {
        return new LogicPoint(originPoint.y, originPoint.x);
      }
      return originPoint;
    }
  }
  getDirable() {
  }
  createSprite(properties) {
    const { nodeType, x, y, z, id, dir, isMoss, layer } = properties;
    const spr = op_client.Sprite.create();
    if (id) {
      spr.id = id;
    } else {
      spr.id = Helpers.genId();
    }
    spr.layer = layer;
    spr.display = this.display;
    spr.currentAnimationName = this.animationName;
    const point3f = op_def.PBPoint3f.create();
    point3f.x = x;
    point3f.y = y;
    if (z) {
      point3f.z = z;
    }
    spr.point3f = point3f;
    spr.animations = this.createProtocolObject();
    if (dir) {
      spr.direction = dir;
    }
    if (isMoss !== void 0) {
      spr.isMoss = isMoss;
    }
    const sprite = new Sprite(spr);
    return new Sprite(spr, nodeType);
  }
  findAnimation(baseName, dir) {
    let animationName = this.checkDirectionAnimation(baseName, dir);
    let flip = false;
    if (animationName) {
      return { name: animationName, flip };
    }
    switch (dir) {
      case Direction.west_south:
      case Direction.east_north:
        animationName = this.getDefaultAnimation(baseName);
        break;
      case Direction.south_east:
        animationName = this.getDefaultAnimation(baseName);
        flip = true;
        break;
      case Direction.north_west:
        animationName = this.checkDirectionAnimation(baseName, Direction.east_north);
        if (animationName === null) {
          animationName = this.getDefaultAnimation(baseName);
        }
        flip = true;
        break;
    }
    return { name: animationName, flip };
  }
  checkDirectionAnimation(baseAniName, dir) {
    const aniName = `${baseAniName}_${dir}`;
    if (this.existAnimation(aniName)) {
      return aniName;
    }
    return null;
  }
  checkDirectionByExistAnimations(baseAniName, dir) {
    let result = dir;
    switch (dir) {
      case Direction.west_south:
        break;
      case Direction.south_east:
        break;
      case Direction.east_north:
        if (!this.existAnimation(`${baseAniName}_${Direction.east_north}`)) {
          result = Direction.west_south;
        }
        break;
      case Direction.north_west:
        if (!this.existAnimation(`${baseAniName}_${Direction.north_west}`) && !this.existAnimation(`${baseAniName}_${Direction.east_north}`)) {
          result = Direction.south_east;
        }
        break;
    }
    return result;
  }
  setDisplay(display) {
    if (!display) {
      Logger.getInstance().error(`${this.type} display does not exist`);
      return;
    }
    this.display = {
      dataPath: display.dataPath,
      texturePath: display.texturePath
    };
    this.gene = sha1.sync(display.dataPath + display.texturePath);
  }
  setAnimationData(aniDatas) {
    if (!aniDatas) {
      Logger.getInstance().error(`${this.id} animationData does not exist`);
      return;
    }
    this.animations = new Map();
    for (const aniData of aniDatas) {
      this.animations.set(aniData.name, aniData);
    }
  }
  getDefaultAnimation(baseName) {
    let animationName = this.checkDirectionAnimation(baseName, Direction.west_south);
    if (animationName === null) {
      if (this.existAnimation(baseName)) {
        animationName = baseName;
      } else {
        Logger.getInstance().warn(`${FramesModel.name}: can't find animation ${baseName}`);
        animationName = "idle";
      }
    }
    return animationName;
  }
}
export class DragonbonesModel {
  constructor(data) {
    __publicField(this, "discriminator", "DragonbonesModel");
    __publicField(this, "id");
    __publicField(this, "eventName");
    __publicField(this, "sound");
    __publicField(this, "avatarDir");
    __publicField(this, "avatar");
    __publicField(this, "animationName");
    if (data) {
      this.id = data.id;
      this.avatar = data.avatar;
      this.eventName = data.eventName;
      this.sound = data.sound;
      const aniName = data.avatar.defaultAnimation;
      if (aniName)
        this.animationName = aniName;
    }
  }
  setInfo(val) {
    for (const key in val) {
      if (val.hasOwnProperty(key)) {
        this[key] = val[key];
      }
    }
  }
  destroy() {
  }
  getCollisionArea(aniName) {
    return [[1]];
  }
  getWalkableArea() {
    return [[0]];
  }
  getOriginPoint(aniName) {
    return new LogicPoint(0, 0);
  }
  getInteractiveArea() {
    return [{ x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }, { x: -1, y: 1 }, { x: -1, y: 0 }];
  }
  existAnimation(aniName) {
    return true;
  }
  findAnimation(baseName, dir) {
    let flip = false;
    switch (dir) {
      case Direction.south_east:
      case Direction.east_north:
        flip = true;
        break;
      case Direction.west_south:
      case Direction.north_west:
        break;
    }
    const aniName = this.checkDirectionAnimation(baseName, dir);
    return { name: aniName, flip };
  }
  checkDirectionAnimation(baseName, dir) {
    let addName = "";
    if (dir === Direction.north_west || dir === Direction.east_north)
      addName = "_back";
    const aniName = `${baseName}${addName}`;
    if (this.existAnimation(aniName)) {
      return aniName;
    }
    return null;
  }
  checkDirectionByExistAnimations(baseAniName, dir) {
    return dir;
  }
}
