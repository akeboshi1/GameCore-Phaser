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
import { LogicPos, Position45 } from "structure";
import { BasicScene } from "baseRender";
var PointsShowType;
(function(PointsShowType2) {
  PointsShowType2[PointsShowType2["None"] = 0] = "None";
  PointsShowType2[PointsShowType2["All"] = 1] = "All";
  PointsShowType2[PointsShowType2["OnlyWalkable"] = 2] = "OnlyWalkable";
  PointsShowType2[PointsShowType2["OnlyNotWalkable"] = 3] = "OnlyNotWalkable";
})(PointsShowType || (PointsShowType = {}));
export class AstarDebugger {
  constructor(render) {
    this.render = render;
    __publicField(this, "isDebug", false);
    __publicField(this, "CIRCLE_RADIUS_POINTS", 2);
    __publicField(this, "CIRCLE_RADIUS_START_POSITION", 4);
    __publicField(this, "CIRCLE_RADIUS_TARGET_POSITION", 4);
    __publicField(this, "CIRCLE_COLOR_POINTS_PASS", 65280);
    __publicField(this, "CIRCLE_COLOR_POINTS_NOTPASS", 16711680);
    __publicField(this, "CIRCLE_COLOR_START_POSITION", 16776960);
    __publicField(this, "CIRCLE_COLOR_TARGET_POSITION", 16776960);
    __publicField(this, "LINE_COLOR_PATH", 16776960);
    __publicField(this, "mPointsShowType", 0);
    __publicField(this, "mPoints_Walkable", null);
    __publicField(this, "mPoints_NotWalkable", null);
    __publicField(this, "mPath", null);
    __publicField(this, "mAstarSize");
  }
  q() {
    this.isDebug = false;
    this.clearAll();
  }
  v() {
    if (!this.isDebug) {
      this.drawPoints();
    }
    this.isDebug = true;
  }
  destroy() {
    this.clearAll();
    if (this.mAstarSize)
      this.mAstarSize = null;
  }
  init(map, size) {
    this.mAstarSize = size;
    if (this.isDebug) {
      this.drawPoints();
    } else {
      this.clearAll();
    }
  }
  update(x, y, val) {
    if (!this.mAstarSize)
      return;
    if (this.isDebug) {
      this.drawPoints();
    } else {
      this.clearAll();
    }
  }
  showPath(start, tar, path) {
    if (!this.mAstarSize)
      return;
    if (this.isDebug) {
      this.drawPath(start, tar, path);
    } else {
      this.clearPath();
    }
  }
  drawPoints() {
    return __async(this, null, function* () {
      if (this.mPointsShowType === 0)
        return;
      if (!this.mAstarSize)
        return;
      const scene = this.render.sceneManager.getMainScene();
      if (!scene || !(scene instanceof BasicScene)) {
        return;
      }
      this.clearAll();
      const walkablePoses = [];
      const notWalkablePoses = [];
      for (let y = 0; y < this.mAstarSize.rows; y++) {
        for (let x = 0; x < this.mAstarSize.cols; x++) {
          throw new Error("\u5220\u9664\u7269\u7406\u8FDB\u7A0B");
          const walkable = true;
          if (this.mPointsShowType === 2 && !walkable)
            continue;
          if (this.mPointsShowType === 3 && walkable)
            continue;
          let pos = new LogicPos(x, y);
          pos = Position45.transformTo90(pos, this.mAstarSize);
          pos.y += this.mAstarSize.tileHeight / 2;
          if (walkable) {
            walkablePoses.push(pos);
          } else {
            notWalkablePoses.push(pos);
          }
        }
      }
      if (walkablePoses.length > 0) {
        this.mPoints_Walkable = scene.make.graphics(void 0, false);
        this.mPoints_Walkable.clear();
        this.mPoints_Walkable.fillStyle(this.CIRCLE_COLOR_POINTS_PASS, 1);
        for (const pos of walkablePoses) {
          this.mPoints_Walkable.fillCircle(pos.x, pos.y, this.CIRCLE_RADIUS_POINTS);
        }
        scene.layerManager.addToLayer("middleLayer", this.mPoints_Walkable);
      }
      if (notWalkablePoses.length > 0) {
        this.mPoints_NotWalkable = scene.make.graphics(void 0, false);
        this.mPoints_NotWalkable.clear();
        this.mPoints_NotWalkable.fillStyle(this.CIRCLE_COLOR_POINTS_NOTPASS, 1);
        for (const pos of notWalkablePoses) {
          this.mPoints_NotWalkable.fillCircle(pos.x, pos.y, this.CIRCLE_RADIUS_POINTS);
        }
        scene.layerManager.addToLayer("middleLayer", this.mPoints_NotWalkable);
      }
    });
  }
  clearAll() {
    if (this.mPoints_Walkable) {
      this.mPoints_Walkable.destroy();
      this.mPoints_Walkable = null;
    }
    if (this.mPoints_NotWalkable) {
      this.mPoints_NotWalkable.destroy();
      this.mPoints_NotWalkable = null;
    }
    this.clearPath();
  }
  clearPath() {
    if (this.mPath) {
      this.mPath.destroy();
      this.mPath = null;
    }
  }
  drawPath(start, tar, path) {
    if (!this.mAstarSize)
      return;
    const scene = this.render.sceneManager.getMainScene();
    if (!scene || !(scene instanceof BasicScene)) {
      return;
    }
    if (!this.mPath) {
      this.mPath = scene.make.graphics(void 0, false);
    }
    this.mPath.clear();
    this.mPath.fillStyle(this.CIRCLE_COLOR_START_POSITION, 1);
    this.mPath.fillCircle(start.x, start.y, this.CIRCLE_RADIUS_START_POSITION);
    this.mPath.fillStyle(this.CIRCLE_COLOR_TARGET_POSITION, 1);
    this.mPath.fillCircle(tar.x, tar.y, this.CIRCLE_RADIUS_TARGET_POSITION);
    if (path.length > 1) {
      this.mPath.lineStyle(1, this.LINE_COLOR_PATH);
      this.mPath.beginPath();
      for (let i = 0; i < path.length - 1; i++) {
        let iPo = path[i];
        let point = new LogicPos(iPo.x, iPo.y);
        this.mPath.moveTo(point.x, point.y);
        iPo = path[i + 1];
        point = new LogicPos(iPo.x, iPo.y);
        this.mPath.lineTo(point.x, point.y);
      }
      this.mPath.closePath();
      this.mPath.strokePath();
    }
    scene.layerManager.addToLayer("middleLayer", this.mPath);
  }
}
