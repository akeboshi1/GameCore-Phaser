var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
export class GridLayoutGroup extends Phaser.GameObjects.Container {
  constructor(scene, width, height, config) {
    super(scene);
    __publicField(this, "_padding");
    __publicField(this, "_cellSize");
    __publicField(this, "_spacing");
    __publicField(this, "_alignmentType");
    __publicField(this, "_startCorner");
    __publicField(this, "_startAxis");
    __publicField(this, "_constraint");
    __publicField(this, "_constraintCount");
    __publicField(this, "layoutElements", []);
    this.setSize(width, height);
    this._padding = config.padding || new Phaser.Math.Vector4(0, 0, 0, 0);
    this._cellSize = config.cellSize || new Phaser.Math.Vector2(100, 100);
    this._spacing = config.space || new Phaser.Math.Vector2(0, 0);
    this._alignmentType = config.alignmentType || AlignmentType.UpperLeft;
    this._startCorner = config.startCorner || CornerType.UpperLeft;
    this._startAxis = config.startAxis || AxisType.Horizontal;
    this._constraint = config.constraint || ConstraintType.Flexible;
    this._constraintCount = config.constraintCount || 4;
  }
  onPlay() {
  }
  start() {
  }
  set padding(value) {
    if (value === void 0)
      return;
    this._padding = value;
  }
  get padding() {
    return this._padding;
  }
  set cellSize(value) {
    if (value === void 0)
      return;
    if (value.x < 0)
      value.x = 0;
    if (value.y < 0)
      value.y = 0;
    this._cellSize = value;
  }
  get cellSize() {
    return this._cellSize;
  }
  set spacing(value) {
    if (value === void 0)
      return;
    this._spacing = value;
  }
  get spacing() {
    return this._spacing;
  }
  set alignmentType(value) {
    if (value === this._alignmentType)
      return;
    this._alignmentType = value;
  }
  get alignmentType() {
    return this._alignmentType;
  }
  set startCorner(value) {
    if (value === this._startCorner)
      return;
    this._startCorner = value;
  }
  get startCorner() {
    return this._startCorner;
  }
  set startAxis(value) {
    if (value === this._startAxis)
      return;
    this._startAxis = value;
  }
  get startAxis() {
    return this._startAxis;
  }
  set constraint(value) {
    if (value === this._constraint)
      return;
    this._constraint = value;
  }
  get constraint() {
    return this._constraint;
  }
  set constraintCount(value) {
    if (value === void 0 || isNaN(value))
      return;
    this._constraintCount = value;
  }
  get constraintCount() {
    return this._constraintCount;
  }
  Layout() {
    this.layoutElements.length = 0;
    const list = this.list;
    for (const child of list) {
      if (child.visible)
        this.layoutElements.push(child);
    }
    if (this.layoutElements.length === 0)
      return;
    const cornerX = this._startCorner % 2;
    const cornerY = Math.floor(this._startCorner / 2);
    let cellsPerMainAxis = 0, actualCellCountX = 0, actualCellCountY = 0;
    const cellCount = this.getCellCount();
    if (this._startAxis === AxisType.Horizontal) {
      cellsPerMainAxis = cellCount.x;
      actualCellCountX = Phaser.Math.Clamp(cellCount.x, 1, this.layoutElements.length);
      actualCellCountY = Phaser.Math.Clamp(cellCount.y, 1, Math.ceil(this.layoutElements.length / cellsPerMainAxis));
    } else {
      cellsPerMainAxis = cellCount.y;
      actualCellCountY = Phaser.Math.Clamp(cellCount.y, 1, this.layoutElements.length);
      actualCellCountX = Phaser.Math.Clamp(cellCount.x, 1, Math.ceil(this.layoutElements.length / cellsPerMainAxis));
    }
    const requiredSpace = new Phaser.Math.Vector2(actualCellCountX * this._cellSize.x + (actualCellCountX - 1) * this._spacing.x, actualCellCountY * this._cellSize.y + (actualCellCountY - 1) * this._spacing.y);
    const startOffset = new Phaser.Math.Vector2(this.getStartOffset(0, requiredSpace.x), this.getStartOffset(1, requiredSpace.y));
    let positionX = 0;
    let positionY = 0;
    for (let i = 0; i < this.layoutElements.length; i++) {
      if (this._startAxis === AxisType.Horizontal) {
        positionX = i % cellsPerMainAxis;
        positionY = Math.floor(i / cellsPerMainAxis);
      } else {
        positionX = Math.floor(i / cellsPerMainAxis);
        positionY = i % cellsPerMainAxis;
      }
      if (cornerX === 1)
        positionX = actualCellCountX - 1 - positionX;
      if (cornerY === 1)
        positionY = actualCellCountY - 1 - positionY;
      this.setChildAlongAxis(this.layoutElements[i], 0, startOffset.x + (this._cellSize.x + this._spacing.x) * positionX, this._cellSize.x);
      this.setChildAlongAxis(this.layoutElements[i], 1, startOffset.y + (this._cellSize.y + this._spacing.y) * positionY, this._cellSize.y);
    }
    const maxWidth = startOffset.x + (this._cellSize.x + this._spacing.x) * (positionX + 1);
    const maxHeight = startOffset.y + (this._cellSize.y + this._spacing.y) * (positionY + 1);
    if (this.startAxis === AxisType.Horizontal) {
      this.height = maxHeight;
    } else {
      this.width = maxWidth;
    }
    this.setAllChildPositionOffset(0);
    this.setAllChildPositionOffset(1);
  }
  setChildAlongAxis(child, axis, pos, size) {
    if (axis === 0) {
      child.width = size;
    } else {
      child.height = size;
    }
    const value = pos;
    if (axis === 0) {
      child.x = value + size * child.originX;
    } else {
      child.y = value + size * child.originY;
    }
  }
  setAllChildPositionOffset(axis) {
    for (const child of this.layoutElements) {
      if (axis === 0) {
        const offset = this.width * 0.5;
        child.x -= offset;
      } else {
        const offset = this.height * 0.5;
        child.y -= offset;
      }
    }
  }
  getStartOffset(axis, requiredSpaceWithoutPadding) {
    const requiredSpace = requiredSpaceWithoutPadding + (axis === 0 ? this.paddingHorizontal() : this.paddingVertical());
    const availableSpace = axis === 0 ? this.width : this.height;
    const surplusSpace = availableSpace - requiredSpace;
    const alignmentOnAxis = this.getAlignmentOnAxis(axis);
    return (axis === 0 ? this._padding.x : this._padding.z) + surplusSpace * alignmentOnAxis;
  }
  getAlignmentOnAxis(axis) {
    if (axis === 0)
      return this._alignmentType % 3 * 0.5;
    else
      return Math.floor(this._alignmentType / 3) * 0.5;
  }
  getCellCount() {
    const cell = new Phaser.Math.Vector2();
    if (this._constraint === ConstraintType.FixedColumnCount) {
      cell.x = this._constraintCount;
      if (this.layoutElements.length >= cell.x) {
        cell.y = Math.floor(this.layoutElements.length / cell.x) + (this.layoutElements.length % cell.x > 0 ? 1 : 0);
      }
    } else if (this._constraint === ConstraintType.FixedRowCount) {
      cell.y = this._constraintCount;
      if (this.layoutElements.length >= cell.y) {
        cell.x = Math.floor(this.layoutElements.length / cell.y) + (this.layoutElements.length % cell.y > 0 ? 1 : 0);
      }
    } else {
      cell.x = Math.max(1, Math.floor((this.width - this.paddingHorizontal() + this._spacing.x + 1e-3) / (this._cellSize.x + this._spacing.x)));
      cell.y = Math.max(1, Math.floor((this.height - this.paddingVertical() + this._spacing.y + 1e-3) / (this._cellSize.y + this._spacing.y)));
    }
    return cell;
  }
  paddingHorizontal() {
    return this._padding.x + this._padding.y;
  }
  paddingVertical() {
    return this._padding.z + this._padding.w;
  }
}
__publicField(GridLayoutGroup, "ClassName", "gridLayoutGroup");
export var AlignmentType;
(function(AlignmentType2) {
  AlignmentType2[AlignmentType2["UpperLeft"] = 0] = "UpperLeft";
  AlignmentType2[AlignmentType2["UpperCenter"] = 1] = "UpperCenter";
  AlignmentType2[AlignmentType2["UpperRight"] = 2] = "UpperRight";
  AlignmentType2[AlignmentType2["MiddleLeft"] = 3] = "MiddleLeft";
  AlignmentType2[AlignmentType2["MiddleCenter"] = 4] = "MiddleCenter";
  AlignmentType2[AlignmentType2["MiddleRight"] = 5] = "MiddleRight";
  AlignmentType2[AlignmentType2["LowerLeft"] = 6] = "LowerLeft";
  AlignmentType2[AlignmentType2["LowerCenter"] = 7] = "LowerCenter";
  AlignmentType2[AlignmentType2["LowerRight"] = 8] = "LowerRight";
})(AlignmentType || (AlignmentType = {}));
export var CornerType;
(function(CornerType2) {
  CornerType2[CornerType2["UpperLeft"] = 0] = "UpperLeft";
  CornerType2[CornerType2["UpperRight"] = 1] = "UpperRight";
  CornerType2[CornerType2["LowerLeft"] = 2] = "LowerLeft";
  CornerType2[CornerType2["LowerRight"] = 3] = "LowerRight";
})(CornerType || (CornerType = {}));
export var AxisType;
(function(AxisType2) {
  AxisType2[AxisType2["Horizontal"] = 0] = "Horizontal";
  AxisType2[AxisType2["Vertical"] = 1] = "Vertical";
})(AxisType || (AxisType = {}));
export var ConstraintType;
(function(ConstraintType2) {
  ConstraintType2[ConstraintType2["Flexible"] = 0] = "Flexible";
  ConstraintType2[ConstraintType2["FixedColumnCount"] = 1] = "FixedColumnCount";
  ConstraintType2[ConstraintType2["FixedRowCount"] = 2] = "FixedRowCount";
})(ConstraintType || (ConstraintType = {}));
