var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { op_gameconfig_01, op_def } from "pixelpai_proto";
import { LogicPoint } from "./logic.point";
export class AnimationModel {
  constructor(ani) {
    __publicField(this, "id");
    __publicField(this, "name");
    __publicField(this, "frameName");
    __publicField(this, "frameRate");
    __publicField(this, "loop");
    __publicField(this, "baseLoc");
    __publicField(this, "collisionArea");
    __publicField(this, "walkableArea");
    __publicField(this, "originPoint");
    __publicField(this, "layer");
    __publicField(this, "interactiveArea");
    __publicField(this, "mountLayer");
    __publicField(this, "mNode");
    const tmpBaseLoc = ani.baseLoc.split(",");
    this.mNode = ani.node;
    this.id = ani.node.id;
    this.name = ani.node.name;
    this.frameName = ani.frameName;
    if (!ani.frameName || this.frameName.length < 1) {
    }
    this.loop = ani.loop;
    if (!ani.loop) {
    }
    if (!ani.frameRate) {
    }
    if (ani.originPoint) {
    }
    if (!ani.baseLoc) {
    }
    this.frameRate = ani.frameRate;
    this.baseLoc = new LogicPoint(parseInt(tmpBaseLoc[0], 10), parseInt(tmpBaseLoc[1], 10));
    const origin = ani.originPoint;
    this.originPoint = new LogicPoint(origin[0], origin[1]);
    if (typeof ani.collisionArea === "string") {
      this.collisionArea = this.stringToArray(ani.collisionArea, ",", "&") || [[0]];
    } else {
      this.collisionArea = ani.collisionArea || [[0]];
    }
    if (typeof ani.walkableArea === "string") {
      this.walkableArea = this.stringToArray(ani.walkableArea, ",", "&") || [[0]];
    } else {
      this.walkableArea = ani.walkableArea || [[0]];
    }
    this.interactiveArea = ani.interactiveArea;
    this.changeLayer(ani.layer);
    this.mountLayer = ani.mountLayer;
  }
  changeLayer(layer) {
    this.layer = layer;
    if (this.layer.length < 1) {
      this.layer = [{
        frameName: this.frameName,
        offsetLoc: this.baseLoc
      }];
    }
  }
  createProtocolObject() {
    const ani = op_gameconfig_01.AnimationData.create();
    ani.node = this.mNode;
    ani.baseLoc = `${this.baseLoc.x},${this.baseLoc.y}`;
    ani.node.name = this.name;
    ani.loop = this.loop;
    ani.frameRate = this.frameRate;
    ani.frameName = this.frameName;
    ani.originPoint = [this.originPoint.x, this.originPoint.y];
    ani.walkOriginPoint = [this.originPoint.x, this.originPoint.y];
    ani.walkableArea = this.arrayToString(this.walkableArea, ",", "&");
    ani.collisionArea = this.arrayToString(this.collisionArea, ",", "&");
    ani.interactiveArea = this.interactiveArea;
    const layers = [];
    for (const layer of this.layer) {
      layers.push(op_gameconfig_01.AnimationLayer.create(layer));
    }
    ani.layer = layers;
    this.changeLayer(ani.layer);
    ani.mountLayer = this.mountLayer;
    return ani;
  }
  createMountPoint(index) {
    if (!this.mountLayer) {
      this.mountLayer = op_gameconfig_01.AnimationMountLayer.create();
      this.mountLayer.mountPoint = [op_def.PBPoint3f.create({ x: 0, y: 0 })];
      this.mountLayer.index = this.layer.length;
    } else {
      const mountPoint = this.mountLayer.mountPoint;
      if (index >= mountPoint.length) {
        mountPoint.push(op_def.PBPoint3f.create({ x: 0, y: 0 }));
      }
    }
  }
  updateMountPoint(index, x, y) {
    if (!this.mountLayer) {
      return;
    }
    if (index < 0 || index >= this.mountLayer.mountPoint.length) {
      return;
    }
    const pos = this.mountLayer.mountPoint[index];
    pos.x -= x;
    pos.y -= y;
  }
  stringToArray(string, fristJoin, lastJoin) {
    if (!string) {
      return;
    }
    const tmp = string.split(lastJoin);
    const result = [];
    for (const ary of tmp) {
      const tmpAry = ary.split(fristJoin);
      result.push(tmpAry.map((value) => parseInt(value, 10)));
    }
    return result;
  }
  arrayToString(array, fristJoin, lastJoin) {
    if (!array)
      return "";
    const tmp = [];
    for (const ary of array) {
      tmp.push(ary.join(fristJoin));
    }
    return tmp.join(lastJoin);
  }
}
