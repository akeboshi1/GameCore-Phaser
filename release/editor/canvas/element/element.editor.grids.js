var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Logger } from "structure";
import Position45Utils from "../../utils/position45.utils";
import { ElementEditorBrushType } from "./element.editor.type";
export default class ElementEditorGrids extends Phaser.GameObjects.Container {
  constructor(scene, node) {
    super(scene);
    __publicField(this, "mRows", 5);
    __publicField(this, "mCols", 5);
    __publicField(this, "mAnchor");
    __publicField(this, "gridWidth", 30);
    __publicField(this, "gridHeight", 15);
    __publicField(this, "mPositionManager");
    __publicField(this, "mGridLayer");
    __publicField(this, "mWalkableLayer");
    __publicField(this, "mCollisionLayer");
    __publicField(this, "mInteractiveLayer");
    __publicField(this, "mWalkableArea");
    __publicField(this, "mBasicWalkableArea");
    __publicField(this, "mCollisionArea");
    __publicField(this, "mBasicCollisionArea");
    __publicField(this, "mInteractiveArea");
    __publicField(this, "mBasicInteractiveArea");
    __publicField(this, "mCurToolType");
    __publicField(this, "mAnimationData");
    const parentContainer = scene.add.container(0, 0);
    parentContainer.add(this);
    this.mPositionManager = new Position45Utils(this.gridWidth, this.gridHeight, this.gridWidth * this.mRows >> 1, 0);
    this.mGridLayer = this.scene.make.container(void 0, false);
    this.mCollisionLayer = this.scene.make.container(void 0, false);
    this.mWalkableLayer = this.scene.make.container(void 0, false);
    this.mInteractiveLayer = this.scene.make.container(void 0, false);
    this.add([this.mGridLayer, this.mWalkableLayer, this.mCollisionLayer, this.mInteractiveLayer]);
    this.scene.input.on("pointerdown", this.onDownHandler, this);
    this.scene.input.on("pointermove", this.onMoveHandler, this);
    this.scene.input.on("pointerup", this.onUpHandler, this);
    this.mCurToolType = ElementEditorBrushType.Drag;
    this.setAnimationData(node);
  }
  setAnimationData(animationData) {
    this.clear();
    this.mAnimationData = animationData;
    if (!this.mAnimationData) {
      Logger.getInstance().warn("wrong animation data");
      return;
    }
    this.mBasicCollisionArea = this.mAnimationData.basicCollisionArea;
    this.mBasicWalkableArea = this.mAnimationData.basicWalkableArea;
    this.mBasicInteractiveArea = this.mAnimationData.interactiveArea || [];
    this.setArea(this.mBasicCollisionArea.length, this.mBasicCollisionArea[0].length);
    this.drawFromData(this.mBasicCollisionArea, ElementEditorBrushType.Collision);
    this.drawFromData(this.mBasicWalkableArea, ElementEditorBrushType.Walkable);
    const area = [...this.mBasicInteractiveArea];
    for (const areaPoint of area) {
      this.drawInteractive(new Phaser.Geom.Point(areaPoint.x + Math.floor(this.mRows / 2), areaPoint.y + Math.floor(this.mCols / 2)));
    }
  }
  getAnchor90Point() {
    if (!this.mAnimationData)
      return;
    const baseLoc = this.mAnimationData.collisionOriginPoint || { x: 0, y: 0 };
    const point = new Phaser.Geom.Point(this.mAnchor.y, this.mAnchor.x);
    const p = this.mPositionManager.transformTo90(point);
    p.x += this.x;
    p.y += this.y;
    return p;
  }
  getOriginPoint() {
    if (!this.mAnimationData)
      return;
    const baseLoc = this.mAnimationData.collisionOriginPoint || { x: 0, y: 0 };
    const point = new Phaser.Geom.Point(baseLoc.y, baseLoc.x);
    const p = this.mPositionManager.transformTo90(point);
    p.x += this.x;
    p.y += this.y;
    return p;
  }
  clear() {
    if (this.mWalkableArea) {
      this.mWalkableArea.forEach((rows) => {
        rows.forEach((element) => {
          if (element) {
            element.clear();
            element.destroy();
          }
        });
      });
    }
    if (this.mCollisionArea) {
      this.mCollisionArea.forEach((rows) => {
        rows.forEach((element) => {
          if (element) {
            element.clear();
            element.destroy();
          }
        });
      });
    }
    if (this.mInteractiveArea) {
      this.mInteractiveArea.forEach((rows) => {
        rows.forEach((element) => {
          if (element) {
            element.clear();
            element.destroy();
          }
        });
      });
    }
    this.mGridLayer.removeAll();
    this.mWalkableLayer.removeAll();
    this.mCollisionLayer.removeAll();
    this.mInteractiveLayer.removeAll();
  }
  changeBrush(val) {
    this.mCurToolType = val;
  }
  setArea(rows, cols) {
    this.mRows = rows;
    this.mCols = cols;
    this.mWalkableArea = new Array(this.mRows);
    for (let i = 0; i < this.mRows; i++) {
      this.mWalkableArea[i] = new Array(this.mCols);
    }
    this.mCollisionArea = new Array(this.mRows);
    for (let i = 0; i < this.mRows; i++) {
      this.mCollisionArea[i] = new Array(this.mCols);
    }
    this.mInteractiveArea = new Array(this.mRows);
    for (let i = 0; i < this.mRows; i++) {
      this.mInteractiveArea[i] = new Array(this.mCols);
    }
    this.mAnchor = new Phaser.Geom.Point(this.mRows >> 1, this.mCols >> 1);
    if (this.mPositionManager) {
      this.mPositionManager.setOffset(this.gridWidth * this.mRows >> 1, 0);
    }
    this.drawGrid();
  }
  drawFromData(area, type) {
    for (let i = 0; i < this.mRows; i++) {
      for (let j = 0; j < this.mCols; j++) {
        if (area[i][j] === 1) {
          switch (type) {
            case ElementEditorBrushType.Collision:
              this.drawCollision(new Phaser.Geom.Point(j, i));
              break;
            case ElementEditorBrushType.Walkable:
              this.drawWalkable(new Phaser.Geom.Point(j, i));
              break;
          }
        }
      }
    }
  }
  onDownHandler(pointer, event) {
    if (pointer.leftButtonDown() || pointer.rightButtonDown())
      this.clickGrid(pointer);
  }
  onMoveHandler(pointer) {
    if (pointer.leftButtonDown() || pointer.rightButtonDown()) {
      this.clickGrid(pointer);
    } else if (pointer.middleButtonDown()) {
    }
  }
  onUpHandler(pointer) {
  }
  clickGrid(pointer) {
    const point = new Phaser.Geom.Point();
    point.x = pointer.x - this.x;
    point.y = pointer.y - this.y;
    const p = this.mPositionManager.transformTo45(point);
    if (p.x < 0 || p.y < 0 || p.x > this.mRows - 1 || p.y > this.mCols - 1) {
      return;
    }
    switch (this.mCurToolType) {
      case ElementEditorBrushType.Walkable:
        if (pointer.leftButtonDown())
          this.drawWalkable(p);
        else if (pointer.rightButtonDown())
          this.eraseWalkable(p);
        break;
      case ElementEditorBrushType.Collision:
        if (pointer.leftButtonDown())
          this.drawCollision(p);
        else if (pointer.rightButtonDown())
          this.eraseCollision(p);
        break;
      case ElementEditorBrushType.Interactive:
        if (pointer.leftButtonDown())
          this.drawInteractive(p);
        else if (pointer.rightButtonDown())
          this.eraseInteractive(p);
        break;
    }
    this.mAnimationData.cutBaseArea();
  }
  dragCamera(pointer) {
    const cam = this.scene.cameras.main;
    const dragScale = 0.1;
    cam.setPosition(cam.x + pointer.velocity.x * dragScale, cam.y + pointer.velocity.y * dragScale);
  }
  drawWalkable(loc) {
    let grid = this.mWalkableArea[loc.y][loc.x];
    if (grid)
      return;
    const point = this.mPositionManager.transformTo90(loc);
    grid = new WalkableGrid(this.scene, { x: point.x, y: point.y });
    grid.x -= grid.width >> 1;
    grid.y += grid.height >> 1;
    this.mWalkableLayer.add(grid);
    this.mWalkableArea[loc.y][loc.x] = grid;
    this.mBasicWalkableArea[loc.y][loc.x] = 1;
  }
  eraseWalkable(loc) {
    const grid = this.mWalkableArea[loc.y][loc.x];
    if (!grid)
      return;
    grid.clear();
    this.mWalkableLayer.remove(grid);
    this.mWalkableArea[loc.y][loc.x] = null;
    this.mBasicWalkableArea[loc.y][loc.x] = 0;
  }
  drawCollision(loc) {
    let grid = this.mCollisionArea[loc.y][loc.x];
    if (grid)
      return;
    const point = this.mPositionManager.transformTo90(loc);
    grid = new CollisionGrid(this.scene, { x: point.x, y: point.y });
    grid.x -= grid.width >> 1;
    this.mCollisionLayer.add(grid);
    this.mCollisionArea[loc.y][loc.x] = grid;
    this.mBasicCollisionArea[loc.y][loc.x] = 1;
  }
  eraseCollision(loc) {
    const grid = this.mCollisionArea[loc.y][loc.x];
    if (!grid)
      return;
    grid.clear();
    this.mCollisionLayer.remove(grid);
    this.mCollisionArea[loc.y][loc.x] = null;
    this.mBasicCollisionArea[loc.y][loc.x] = 0;
  }
  drawInteractive(loc) {
    let grid = this.mInteractiveArea[loc.y][loc.x];
    if (grid)
      return;
    const x = loc.x - Math.floor(this.mRows / 2);
    const y = loc.y - Math.floor(this.mCols / 2);
    const index = this.mBasicInteractiveArea.findIndex((p) => p.x === x && p.y === y);
    const point = this.mPositionManager.transformTo90(loc);
    grid = new InteractiveGrid(this.scene, { x: point.x, y: point.y });
    grid.x -= grid.width >> 1;
    grid.y += grid.height >> 1;
    this.mInteractiveLayer.add(grid);
    if (index < 0)
      this.mBasicInteractiveArea.push({ x, y });
    this.mInteractiveArea[loc.y][loc.x] = grid;
  }
  eraseInteractive(loc) {
    const grid = this.mInteractiveArea[loc.y][loc.x];
    if (!grid)
      return;
    const x = loc.x - Math.floor(this.mRows / 2);
    const y = loc.y - Math.floor(this.mCols / 2);
    const index = this.mBasicInteractiveArea.findIndex((p) => p.x === x && p.y === y);
    grid.clear();
    this.mInteractiveLayer.remove(grid);
    this.mInteractiveArea[loc.y][loc.x] = null;
    if (index >= 0)
      this.mBasicInteractiveArea.splice(index, 1);
  }
  drawGrid() {
    const graphics = this.scene.make.graphics(void 0, false);
    graphics.lineStyle(1, 16777215, 0.1);
    graphics.beginPath();
    for (let i = 0; i <= this.mRows; i++) {
      this.drawLine(graphics, 0, i, this.mRows, i);
    }
    for (let i = 0; i <= this.mCols; i++) {
      this.drawLine(graphics, i, 0, i, this.mCols);
    }
    graphics.closePath();
    graphics.strokePath();
    this.mGridLayer.add(graphics);
    const point = this.mPositionManager.transformTo90(this.mAnchor);
    const anchorView = this.scene.make.graphics(void 0, false);
    anchorView.fillStyle(16711680);
    anchorView.fillCircle(point.x, point.y, 3);
    anchorView.fillPath();
    this.mGridLayer.add(anchorView);
    const _w = (this.mRows + this.mCols) * (this.gridWidth / 2);
    const _h = (this.mRows + this.mCols) * (this.gridHeight / 2);
    this.x = this.scene.game.scale.width - _w >> 1;
    this.y = this.scene.game.scale.height - _h >> 1;
  }
  drawLine(graphics, startX, endX, startY, endY) {
    let point = new Phaser.Geom.Point(startX, endX);
    point = this.mPositionManager.transformTo90(point);
    graphics.moveTo(point.x, point.y);
    point = new Phaser.Geom.Point(startY, endY);
    point = this.mPositionManager.transformTo90(point);
    graphics.lineTo(point.x, point.y);
  }
}
class Grid extends Phaser.GameObjects.Graphics {
  constructor(scene, options, tileWidth = 30, tileHeight = 15, color = 0) {
    super(scene, options);
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.color = color;
    this.drawTile(this.color);
  }
  drawTile(color = 0, alpha = 0.5) {
    this.clear();
    this.lineStyle(1, color);
    this.fillStyle(color, alpha);
    this.moveTo(0, this.tileHeight >> 1);
    this.lineTo(this.tileWidth >> 1, 0);
    this.lineTo(this.tileWidth, this.tileHeight >> 1);
    this.lineTo(this.tileWidth >> 1, this.tileHeight);
    this.lineTo(0, this.tileHeight >> 1);
    this.fillPath();
  }
  get width() {
    return this.tileWidth;
  }
  get height() {
    return this.tileHeight;
  }
}
class WalkableGrid extends Grid {
  constructor(game, options) {
    super(game, options, 16, 8, 65280);
  }
}
class CollisionGrid extends Grid {
  constructor(game, options) {
    super(game, options, 28, 14, 16744448);
  }
}
class InteractiveGrid extends Grid {
  constructor(scene, options) {
    super(scene, options, 16, 8, 16776960);
  }
}
