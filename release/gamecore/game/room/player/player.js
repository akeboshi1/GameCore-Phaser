var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
import { op_def } from "pixelpai_proto";
import { PlayerState, DirectionChecker } from "structure";
import { Element } from "../element/element";
import { LayerEnum } from "game-capsule";
import { InputEnable } from "../element/input.enable";
export class Player extends Element {
  constructor(sprite, mElementManager) {
    super(sprite, mElementManager);
    __publicField(this, "mOffsetY");
    this.setInputEnable(InputEnable.Enable);
  }
  get nodeType() {
    return op_def.NodeType.CharacterNodeType;
  }
  setModel(model) {
    return __async(this, null, function* () {
      if (!model) {
        return;
      }
      model.off("Animation_Change", this.animationChanged, this);
      model.on("Animation_Change", this.animationChanged, this);
      if (!model.layer) {
        model.layer = LayerEnum.Surface;
      }
      this.removeFromWalkableMap();
      this.mModel = model;
      this.mQueueAnimations = void 0;
      if (this.mModel.pos) {
        this.setPosition(this.mModel.pos);
      }
      const area = model.getCollisionArea();
      const obj = {
        id: model.id,
        pos: model.pos,
        alpha: model.alpha,
        nickname: model.nickname,
        titleMask: model.titleMask | 65536,
        hasInteractive: true
      };
      this.load(this.mModel.displayInfo).then(() => this.mElementManager.roomService.game.renderPeer.setPlayerModel(obj)).then(() => {
        this.setDirection(this.mModel.direction);
        if (this.mInputEnable === InputEnable.Interactive) {
          this.setInputEnable(this.mInputEnable);
        }
        if (model.mountSprites && model.mountSprites.length > 0) {
          this.updateMounth(model.mountSprites);
        }
        this.addToWalkableMap();
        return this.setRenderable(true);
      });
    });
  }
  load(displayInfo, isUser = false) {
    return __async(this, null, function* () {
      this.mDisplayInfo = displayInfo;
      this.isUser = isUser;
      if (!displayInfo)
        return Promise.reject(`element ${this.mModel.nickname} ${this.id} display does not exist`);
      yield this.loadDisplayInfo();
      return this.addToBlock();
    });
  }
  changeState(val, times) {
    if (this.mCurState === val)
      return;
    if (!val) {
      val = PlayerState.IDLE;
    }
    if (this.mCheckStateHandle(val)) {
      this.mCurState = val;
      this.mModel.setAnimationName(this.mCurState, times);
      const id = this.mModel.id;
      this.mElementManager.roomService.game.renderPeer.playAnimation(id, this.mModel.currentAnimation, void 0, times);
    }
  }
  stopMove(points) {
    this.mMoving = false;
    this.moveControll.setVelocity(0, 0);
    this.changeState(PlayerState.IDLE);
  }
  completeMove() {
  }
  setWeapon(weaponid) {
    if (!this.mModel || !this.mModel.avatar)
      return;
    const avatar = { barmWeapId: { sn: weaponid, slot: "NDE5NDMwNA==", suit_type: "weapon" } };
    this.model.setTempAvatar(avatar);
    this.load(this.mModel.displayInfo);
  }
  removeWeapon() {
    if (!this.mModel)
      return;
    if (this.mModel.suits) {
      this.mModel.updateAvatarSuits(this.mModel.suits);
      this.model.updateAvatar(this.mModel.avatar);
      this.load(this.mModel.displayInfo);
    } else if (this.mModel.avatar) {
      this.model.updateAvatar(this.mModel.avatar);
      this.load(this.mModel.displayInfo);
    }
  }
  addToWalkableMap() {
  }
  removeFromWalkableMap() {
  }
  calcDirection(pos, target) {
    const dir = DirectionChecker.check(pos, target);
    this.setDirection(dir);
  }
  checkDirection() {
    const pos = this.moveControll.position;
    const prePos = this.moveControll.prePosition;
    const dir = DirectionChecker.check(prePos, pos);
    this.setDirection(dir);
  }
  get offsetY() {
    if (this.mOffsetY === void 0) {
      if (!this.mElementManager || !this.mElementManager.roomService || !this.mElementManager.roomService.roomSize) {
        return 0;
      }
      this.mOffsetY = this.mElementManager.roomService.roomSize.tileHeight >> 2;
    }
    return this.mOffsetY;
  }
  addBody() {
  }
  drawBody() {
    super.drawBody();
    const size = this.mRoomService.miniSize;
    this.moveControll.setBodiesOffset({ x: 0, y: -size.tileHeight * 0.5 });
  }
  mCheckStateHandle(val) {
    return true;
  }
}
