var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { FramesModel } from "baseGame";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_virtual_world, op_client, op_def } from "pixelpai_proto";
import { AnimationModel } from "structure";
import { Effect } from "./effect";
export class EffectManager extends PacketHandler {
  constructor(room) {
    super();
    this.room = room;
    __publicField(this, "mEffects");
    this.mEffects = new Map();
    this.connection.addPacketListener(this);
    this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_HOT_BLOCK_SYNC_SPRITE, this.onSyncSprite);
  }
  add(ownerID, id) {
    let effect = this.mEffects.get(ownerID);
    if (!effect) {
      effect = new Effect(this.room.game, ownerID, id);
    }
    this.mEffects.set(ownerID, effect);
    this.updateDisplay(effect);
    return effect;
  }
  remove(ownerID) {
    const effect = this.mEffects.get(ownerID);
    if (!effect) {
      return;
    }
    this.mEffects.delete(ownerID);
    effect.destroy();
  }
  getByOwner(ownerID) {
    let effect = this.mEffects.get(ownerID);
    if (!effect) {
      effect = this.add(ownerID);
    }
    return effect;
  }
  getByID(id) {
    const effects = Array.from(this.mEffects.values());
    return effects.filter((effect) => id === effect.bindId);
  }
  destroy() {
    this.mEffects.forEach((effect) => {
      effect.destroy();
    });
    this.mEffects.clear();
    this.connection.removePacketListener(this);
  }
  updateDisplay(effect) {
    const id = effect.bindId;
    const display = this.room.game.elementStorage.getDisplayModel(id);
    if (display) {
      effect.displayInfo = display;
    } else {
      this.fetchDisplay([id]);
    }
  }
  fetchDisplay(ids) {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_REQ_VIRTUAL_WORLD_QUERY_SPRITE_RESOURCE);
    const content = packet.content;
    content.ids = ids;
    this.connection.send(packet);
  }
  onSyncSprite(packet) {
    const content = packet.content;
    if (content.nodeType !== op_def.NodeType.ElementNodeType) {
      return;
    }
    const sprites = content.sprites;
    for (const sprite of sprites) {
      this.mEffects.forEach((effect) => {
        if (effect.bindId === sprite.id) {
          const framesModel = this.createFramesModel(sprite);
          if (framesModel) {
            effect.updateDisplayInfo(framesModel);
            this.room.game.elementStorage.add(framesModel);
          }
        }
      });
    }
  }
  createFramesModel(sprite) {
    const { display, animations } = sprite;
    if (display && animations) {
      const anis = [];
      for (const ani of animations) {
        anis.push(new AnimationModel(ani));
      }
      const framesModel = new FramesModel({
        id: sprite.bindId || sprite.id,
        animations: {
          defaultAnimationName: sprite.currentAnimationName,
          display,
          animationData: anis
        }
      });
      return framesModel;
    }
  }
  get connection() {
    return this.room.game.connection;
  }
}
