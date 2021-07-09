var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { PacketHandler } from "net-socket-packet";
import { op_client, op_def, op_gameconfig } from "pixelpai_proto";
import { Player } from "./player";
import { User } from "../../actor/user";
import { PlayerModel } from "./player.model";
import { AvatarSuitType, EventType, MessageType, PlayerState, Logger, LogicPos } from "structure";
import { Sprite } from "baseGame";
const NodeType = op_def.NodeType;
export class PlayerManager extends PacketHandler {
  constructor(mRoom) {
    super();
    this.mRoom = mRoom;
    __publicField(this, "hasAddComplete", false);
    __publicField(this, "mActor");
    __publicField(this, "mPlayerMap", new Map());
    if (this.connection) {
      this.connection.addPacketListener(this);
      Logger.getInstance().debug("playermanager ---- addpacklistener");
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE, this.onAdd);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE_END, this.addComplete);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_SPRITE, this.onRemove);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADJUST_POSITION, this.onAdjust);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_MOVE_SPRITE, this.onMove);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_EFFECT, this.onShowEffect);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ONLY_BUBBLE, this.onOnlyBubbleHandler);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CHAT, this.onShowBubble);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ONLY_BUBBLE_CLEAN, this.onClearBubbleHandler);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_HOT_BLOCK_SYNC_SPRITE, this.onSync);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_HOT_BLOCK_DELETE_SPRITE, this.onBlockDeleteSprite);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_CHANGE_SPRITE_ANIMATION, this.onChangeAnimation);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SET_SPRITE_POSITION, this.onSetPosition);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SET_POSITION, this.onSetPosition);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ACTIVE_SPRITE, this.onActiveSpriteHandler);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ACTIVE_SPRITE_END, this.onActiveSpriteEndHandler);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_ACTOR, this.onSyncActorHandler);
    }
    this.addLisenter();
  }
  addLisenter() {
    if (!this.mRoom.game.emitter)
      return;
    this.mRoom.game.emitter.on(EventType.SCENE_ELEMENT_FIND, this.onQueryElementHandler, this);
    this.mRoom.game.emitter.on(EventType.SCENE_INTERACTION_ELEMENT, this.checkPlayerAction, this);
    this.mRoom.game.emitter.on(EventType.SCENE_PLAYER_ACTION, this.onActiveSprite, this);
  }
  removeLisenter() {
    if (!this.mRoom.game.emitter)
      return;
    this.mRoom.game.emitter.off(EventType.SCENE_ELEMENT_FIND, this.onQueryElementHandler, this);
    this.mRoom.game.emitter.off(EventType.SCENE_INTERACTION_ELEMENT, this.checkPlayerAction, this);
    this.mRoom.game.emitter.off(EventType.SCENE_PLAYER_ACTION, this.onActiveSprite, this);
  }
  createActor(actor) {
    const playModel = new PlayerModel(actor);
    this.mActor = new User();
  }
  get actor() {
    return this.mActor;
  }
  destroy() {
    this.removeLisenter();
    if (this.connection) {
      Logger.getInstance().debug("playermanager ---- removepacklistener");
      this.connection.removePacketListener(this);
    }
    if (this.mActor) {
      this.mActor.destroy();
      this.mActor = null;
    }
    if (this.mPlayerMap) {
      this.mPlayerMap.forEach((player) => this.remove(player.id));
      this.mPlayerMap.clear();
    }
  }
  update(time, delta) {
    this.mPlayerMap.forEach((player) => player.update(time, delta));
  }
  get(id) {
    if (!this.mPlayerMap) {
      return;
    }
    let player = this.mPlayerMap.get(id);
    if (!player) {
      const actor = this.actor;
      if (actor && actor.id === id) {
        player = actor;
      }
    }
    return player;
  }
  has(id) {
    return this.mPlayerMap.has(id);
  }
  add(sprite) {
  }
  remove(id) {
    const element = this.mPlayerMap.get(id);
    if (element) {
      this.mPlayerMap.delete(id);
      element.destroy();
    }
    return element;
  }
  setMe(user) {
    this.mActor = user;
    this.mPlayerMap.set(user.id, user);
  }
  addToWalkableMap(sprite) {
  }
  removeFromWalkableMap(sprite) {
  }
  resetWalkable(sprite) {
  }
  getElements() {
    return Array.from(this.mPlayerMap.values());
  }
  set(id, player) {
    if (!this.mPlayerMap) {
      this.mPlayerMap = new Map();
    }
    this.mPlayerMap.set(id, player);
  }
  onActiveSprite(id, targetId, data) {
    id = id || this.mRoom.game.user.id;
    if (this.has(id)) {
      if (data) {
        if (typeof data === "string")
          data = JSON.parse(data);
        const element = this.get(id);
        if (data.weaponID) {
          element.setWeapon(data.weaponID);
        }
        const target = this.roomService.getElement(targetId);
        if (target) {
          element.calcDirection(element.getPosition(), target.getPosition());
        }
        if (data.animation) {
          const times = data.times;
          const queue = [{ animationName: data.animation, times }];
          if (times && times > 0) {
            if (element.moving) {
              queue.push({ animationName: PlayerState.IDLE, times: void 0 });
            } else {
              queue.push({ animationName: element.model.currentAnimation.name, times: element.model.currentAnimation.times });
            }
          }
          element.setQueue(queue);
        }
      }
    }
  }
  addWeapon(id, weaponID) {
    if (this.has(id)) {
      const element = this.get(id);
      element.setWeapon(weaponID);
    }
  }
  playAnimator(id, aniName, times) {
    if (this.has(id)) {
      const element = this.get(id);
      element.play(aniName, times);
    }
  }
  addPackItems(elementId, items) {
    const character = this.mPlayerMap.get(elementId);
    if (character && character.id === this.mActor.id) {
      if (!character.package) {
        character.package = op_gameconfig.Package.create();
      }
      character.package.items = character.package.items.concat(items);
      this.mRoom.game.peer.render.emitter.emit(MessageType.UPDATED_CHARACTER_PACKAGE);
    }
  }
  removePackItems(elementId, itemId) {
    const character = this.mPlayerMap.get(elementId);
    if (character && this.mActor.id) {
      const itemList = character.package.items;
      const len = itemList.length;
      for (let i = 0; i < len; i++) {
        if (itemId === itemList[i].id) {
          itemList.splice(i, 1);
          return true;
        }
      }
    }
    return false;
  }
  onDisplayCreated(id) {
  }
  onDisplayRemoved(id) {
  }
  hideAll() {
    this.mPlayerMap.forEach((val, key) => {
      this.mRoom.game.renderPeer.SetDisplayVisible(val.id, false);
    });
  }
  showAll() {
    this.mPlayerMap.forEach((val, key) => {
      this.mRoom.game.renderPeer.SetDisplayVisible(val.id, true);
    });
  }
  setState(state) {
    const ele = this.get(state.owner.id);
    if (ele)
      ele.setState(state);
  }
  checkPlayerAction(id) {
    if (this.has(id) && id !== this.mRoom.game.user.id) {
      const ele = this.get(id);
    }
  }
  _add(sprite) {
    if (!this.mPlayerMap)
      this.mPlayerMap = new Map();
    let player = this.mPlayerMap.get(sprite.id);
    if (!this.mPlayerMap.has(sprite.id)) {
      player = new Player(sprite, this);
      this.mPlayerMap.set(player.id || 0, player);
    } else {
      player.setModel(sprite);
    }
  }
  _loadSprite(sprite) {
  }
  onSync(packet) {
    const content = packet.content;
    if (content.nodeType !== op_def.NodeType.CharacterNodeType) {
      return;
    }
    let player = null;
    const sprites = content.sprites;
    const command = content.command;
    for (const sprite of sprites) {
      player = this.get(sprite.id);
      this._loadSprite(sprite);
      if (player) {
        if (command === op_def.OpCommand.OP_COMMAND_UPDATE) {
          this.checkSuitAvatarSprite(sprite);
          const _sprite = new Sprite(sprite, content.nodeType);
          player.model = _sprite;
        } else if (command === op_def.OpCommand.OP_COMMAND_PATCH) {
          player.updateModel(sprite, this.mRoom.game.avatarType);
        }
      } else {
        this.checkSuitAvatarSprite(sprite);
        const _sprite = new Sprite(sprite, content.nodeType);
        this._add(_sprite);
      }
    }
  }
  onAdjust(packet) {
    const content = packet.content;
    const positions = content.spritePositions;
    const type = content.nodeType;
    if (type !== op_def.NodeType.CharacterNodeType) {
      return;
    }
    if (this.mActor) {
      let player;
      let point;
      for (const position of positions) {
        player = this.mPlayerMap.get(position.id);
        if (player) {
          point = position.point3f;
          player.setPosition(new LogicPos(point.x || 0, point.y || 0, point.z || 0));
        }
      }
    }
  }
  onAdd(packet) {
    if (!this.mPlayerMap) {
      this.mPlayerMap = new Map();
    }
    const content = packet.content;
    const sprites = content.sprites;
    const type = content.nodeType;
    if (type !== op_def.NodeType.CharacterNodeType) {
      return;
    }
    for (const sprite of sprites) {
      this._loadSprite(sprite);
      this.checkSuitAvatarSprite(sprite);
      const _sprite = new Sprite(sprite, content.nodeType);
      this._add(_sprite);
    }
  }
  checkSuitAvatarSprite(sprite) {
    if (this.mRoom.game.avatarType === op_def.AvatarStyle.SuitType) {
      if (!AvatarSuitType.hasAvatarSuit(sprite["attrs"])) {
        if (!sprite.avatar)
          sprite.avatar = AvatarSuitType.createBaseAvatar();
      }
    }
  }
  addComplete(packet) {
    this.hasAddComplete = true;
  }
  onRemove(packet) {
    const content = packet.content;
    const type = content.nodeType;
    const ids = content.ids;
    if (type !== op_def.NodeType.CharacterNodeType) {
      return;
    }
    for (const id of ids) {
      this.remove(id);
    }
  }
  onMove(packet) {
    const content = packet.content;
    if (content.movePath) {
      const movePaths = content.movePath;
      const len = movePaths.length;
      let movePath;
      let playID;
      let player;
      for (let i = 0; i < len; i++) {
        movePath = movePaths[i];
        playID = movePath.id;
        player = this.get(playID);
        if (player && movePath.movePos && movePath.movePos.length > 0) {
          player.move(movePath.movePos);
        }
      }
    }
  }
  onSetPosition(packet) {
    const content = packet.content;
    const type = content.nodeType;
    const id = content.id;
    if (type !== NodeType.CharacterNodeType) {
      return;
    }
    const role = this.get(id);
    if (role) {
      role.stopMove();
      role.setPosition(new LogicPos(content.position.x, content.position.y, content.position.z), id === this.mActor.id);
      this.mRoom.game.renderPeer.setPosition(id, content.position.x, content.position.y, content.position.z);
    }
  }
  onShowBubble(packet) {
    const content = packet.content;
    const player = this.get(content.chatSenderid);
    if (player) {
      player.showBubble(content.chatContext, content.chatSetting);
    }
  }
  onOnlyBubbleHandler(packet) {
    const content = packet.content;
    const player = this.get(content.receiverid);
    if (player) {
      player.showBubble(content.context, content.chatsetting);
    }
  }
  onClearBubbleHandler(packet) {
    const content = packet.content;
    const player = this.get(content.receiverid);
    if (player) {
      player.clearBubble();
    }
  }
  onShowEffect(packet) {
    const content = packet.content;
    const ids = content.id;
    let player;
    for (const id of ids) {
      player = this.get(id);
      if (player) {
        player.showEffected(null);
      }
    }
  }
  onChangeAnimation(packet) {
    const content = packet.content;
    if (content.nodeType !== NodeType.CharacterNodeType) {
      return;
    }
    let player = null;
    const ids = content.ids;
    for (const id of ids) {
      player = this.get(id);
      if (player) {
        player.setQueue(content.changeAnimation);
      }
    }
  }
  onBlockDeleteSprite(packet) {
    const content = packet.content;
    const { nodeType, spriteIds } = content;
    for (const id of spriteIds) {
      if (this.get(id)) {
        this.remove(id);
      }
    }
  }
  onQueryElementHandler(id) {
    const ele = this.get(id);
    this.mRoom.game.emitter.emit(EventType.SCENE_RETURN_FIND_ELEMENT, ele);
  }
  onActiveSpriteHandler(packet) {
    const content = packet.content;
    if (this.has(content.targetId)) {
      this.onActiveSprite(content.spriteId, content.targetId, content.param);
    }
  }
  onActiveSpriteEndHandler(packet) {
    const content = packet.content;
    const playerid = content.spriteId;
    if (this.has(playerid)) {
      const element = this.get(playerid);
      element.removeWeapon();
      element.play(PlayerState.IDLE);
    }
  }
  onSyncActorHandler(packet) {
    const content = packet.content;
    this.mActor.updateModel(content.actor);
  }
  get roomService() {
    return this.mRoom;
  }
  get connection() {
    if (this.mRoom) {
      return this.mRoom.connection;
    }
    Logger.getInstance().error("room is undefined");
  }
}
