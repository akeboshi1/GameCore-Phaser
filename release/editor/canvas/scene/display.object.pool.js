var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { BaseFramesDisplay } from "baseRender";
import { op_def } from "pixelpai_proto";
import { LogicPos, Position45 } from "structure";
export class DisplayObjectPool {
  constructor(sceneEditor) {
    this.sceneEditor = sceneEditor;
    __publicField(this, "terrains", new Map());
    __publicField(this, "mosses", new Map());
    __publicField(this, "elements", new Map());
    __publicField(this, "walls", new Map());
    __publicField(this, "caches", new Map());
    __publicField(this, "POOLOBJECTCONFIG", {
      terrains: BaseFramesDisplay,
      mosses: BaseFramesDisplay,
      elements: BaseFramesDisplay,
      walls: BaseFramesDisplay
    });
  }
  getPool(poolName) {
    return this[poolName];
  }
  push(poolName, id, sprite) {
    const pool = this[poolName];
    const obj = this.sceneEditor.factory.createDisplay(sprite);
    if (obj.nodeType === op_def.NodeType.ElementNodeType || obj.nodeType === op_def.NodeType.MossType || obj.nodeType === op_def.NodeType.SpawnPointType) {
      obj.setInteractive();
      obj.setPosition(sprite.pos.x, sprite.pos.y);
    } else if (obj.nodeType === op_def.NodeType.TerrainNodeType || obj.nodeType === op_def.NodeType.WallNodeType) {
      const pos = Position45.transformTo90(new LogicPos(sprite.pos.x, sprite.pos.y), this.sceneEditor.roomSize);
      obj.setPosition(pos.x, pos.y);
    }
    this.sceneEditor.scene.layerManager.addToLayer(sprite.layer.toString(), obj);
    pool.set(id, obj);
    if (this.caches) {
      this.caches.set(sprite.id, true);
      const cachelist = Array.from(this.caches.values());
      const result = cachelist.filter((bol) => bol === false);
      if (result.length === 0) {
        this.caches.forEach((value, key) => {
          const ele = this.get(key.toString());
          if (ele)
            ele.asociate();
        });
        this.caches.clear();
        this.caches = null;
      }
    }
  }
  remove(poolName, id) {
    const obj = this[poolName].get(id);
    if (obj) {
      this.tryDeleteMountSprites(obj.getMountIds());
      obj.isUsed = false;
      obj.destroy();
    }
    this[poolName].delete(id);
  }
  update(poolName, id, newSprite) {
    const pool = this[poolName];
    const obj = pool.get(id);
    if (obj) {
      obj.clear();
      obj.updateSprite(newSprite);
      if (obj.nodeType === op_def.NodeType.TerrainNodeType || obj.nodeType === op_def.NodeType.WallNodeType) {
        const pos = Position45.transformTo90(new LogicPos(newSprite.pos.x, newSprite.pos.y), this.sceneEditor.roomSize);
        obj.setPosition(pos.x, pos.y);
      }
    }
  }
  addCache(id) {
    if (this.caches)
      this.caches.set(id, false);
  }
  get(id) {
    const arys = [this.elements, this.mosses];
    for (const map of arys) {
      const ele = map.get(id);
      if (ele) {
        return ele;
      }
    }
  }
  destroy() {
    for (const key of Object.keys(this.POOLOBJECTCONFIG)) {
      this[key].clear();
    }
  }
  tryDeleteMountSprites(mountIds) {
    if (!mountIds || mountIds.length < 1) {
      return;
    }
    for (const mount of mountIds) {
      const ele = this.get(mount.toString());
      if (ele) {
        if (ele.isMoss) {
          this.sceneEditor.mossManager.deleteMosses([ele.id]);
        } else {
          this.sceneEditor.elementManager.deleteElements([ele.id]);
          if (ele.getMountIds) {
            this.tryDeleteMountSprites(ele.getMountIds());
          }
        }
      }
    }
  }
}
