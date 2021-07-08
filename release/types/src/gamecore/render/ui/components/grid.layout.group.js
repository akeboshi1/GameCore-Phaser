var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var GridLayoutGroup = /** @class */ (function (_super) {
    __extends_1(GridLayoutGroup, _super);
    function GridLayoutGroup(scene, width, height, config) {
        var _this = _super.call(this, scene) || this;
        _this.layoutElements = [];
        _this.setSize(width, height);
        _this._padding = config.padding || new Phaser.Math.Vector4(0, 0, 0, 0);
        _this._cellSize = config.cellSize || new Phaser.Math.Vector2(100, 100);
        _this._spacing = config.space || new Phaser.Math.Vector2(0, 0);
        _this._alignmentType = config.alignmentType || AlignmentType.UpperLeft;
        _this._startCorner = config.startCorner || CornerType.UpperLeft;
        _this._startAxis = config.startAxis || AxisType.Horizontal;
        _this._constraint = config.constraint || ConstraintType.Flexible;
        _this._constraintCount = config.constraintCount || 4;
        return _this;
    }
    GridLayoutGroup.prototype.onPlay = function () {
    };
    GridLayoutGroup.prototype.start = function () {
    };
    Object.defineProperty(GridLayoutGroup.prototype, "padding", {
        get: function () {
            return this._padding;
        },
        set: function (value) {
            if (value === undefined)
                return;
            this._padding = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridLayoutGroup.prototype, "cellSize", {
        get: function () {
            return this._cellSize;
        },
        /**
         * vec2(width,height);
         */
        set: function (value) {
            if (value === undefined)
                return;
            if (value.x < 0)
                value.x = 0;
            if (value.y < 0)
                value.y = 0;
            this._cellSize = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridLayoutGroup.prototype, "spacing", {
        get: function () {
            return this._spacing;
        },
        /**
         * vec2(x,y);
         */
        set: function (value) {
            if (value === undefined)
                return;
            this._spacing = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridLayoutGroup.prototype, "alignmentType", {
        get: function () {
            return this._alignmentType;
        },
        set: function (value) {
            if (value === this._alignmentType)
                return;
            this._alignmentType = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridLayoutGroup.prototype, "startCorner", {
        get: function () {
            return this._startCorner;
        },
        set: function (value) {
            if (value === this._startCorner)
                return;
            this._startCorner = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridLayoutGroup.prototype, "startAxis", {
        get: function () {
            return this._startAxis;
        },
        set: function (value) {
            if (value === this._startAxis)
                return;
            this._startAxis = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridLayoutGroup.prototype, "constraint", {
        get: function () {
            return this._constraint;
        },
        set: function (value) {
            if (value === this._constraint)
                return;
            this._constraint = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridLayoutGroup.prototype, "constraintCount", {
        get: function () {
            return this._constraintCount;
        },
        set: function (value) {
            if (value === undefined || isNaN(value))
                return;
            this._constraintCount = value;
        },
        enumerable: true,
        configurable: true
    });
    GridLayoutGroup.prototype.Layout = function () {
        this.layoutElements.length = 0;
        var list = this.list;
        for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
            var child = list_1[_i];
            if (child.visible)
                this.layoutElements.push(child);
        }
        if (this.layoutElements.length === 0)
            return;
        var cornerX = this._startCorner % 2;
        var cornerY = Math.floor(this._startCorner / 2);
        var cellsPerMainAxis = 0, actualCellCountX = 0, actualCellCountY = 0;
        var cellCount = this.getCellCount();
        if (this._startAxis === AxisType.Horizontal) {
            cellsPerMainAxis = cellCount.x;
            actualCellCountX = Phaser.Math.Clamp(cellCount.x, 1, this.layoutElements.length);
            actualCellCountY = Phaser.Math.Clamp(cellCount.y, 1, Math.ceil(this.layoutElements.length / cellsPerMainAxis));
        }
        else {
            cellsPerMainAxis = cellCount.y;
            actualCellCountY = Phaser.Math.Clamp(cellCount.y, 1, this.layoutElements.length);
            actualCellCountX = Phaser.Math.Clamp(cellCount.x, 1, Math.ceil(this.layoutElements.length / cellsPerMainAxis));
        }
        var requiredSpace = new Phaser.Math.Vector2(actualCellCountX * this._cellSize.x + (actualCellCountX - 1) * this._spacing.x, actualCellCountY * this._cellSize.y + (actualCellCountY - 1) * this._spacing.y);
        var startOffset = new Phaser.Math.Vector2(this.getStartOffset(0, requiredSpace.x), this.getStartOffset(1, requiredSpace.y));
        var positionX = 0;
        var positionY = 0;
        for (var i = 0; i < this.layoutElements.length; i++) {
            if (this._startAxis === AxisType.Horizontal) {
                positionX = i % cellsPerMainAxis;
                positionY = Math.floor(i / cellsPerMainAxis);
            }
            else {
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
        var maxWidth = startOffset.x + (this._cellSize.x + this._spacing.x) * (positionX + 1);
        var maxHeight = startOffset.y + (this._cellSize.y + this._spacing.y) * (positionY + 1);
        if (this.startAxis === AxisType.Horizontal) {
            this.height = maxHeight;
        }
        else {
            this.width = maxWidth;
        }
        this.setAllChildPositionOffset(0);
        this.setAllChildPositionOffset(1);
    };
    GridLayoutGroup.prototype.setChildAlongAxis = function (child, axis, pos, size) {
        if (axis === 0) {
            child.width = size;
        }
        else {
            child.height = size;
        }
        var value = pos;
        if (axis === 0) {
            child.x = value + size * child.originX;
        }
        else {
            child.y = value + size * child.originY;
        }
    };
    GridLayoutGroup.prototype.setAllChildPositionOffset = function (axis) {
        for (var _i = 0, _a = this.layoutElements; _i < _a.length; _i++) {
            var child = _a[_i];
            if (axis === 0) {
                var offset = this.width * 0.5;
                child.x -= offset;
            }
            else {
                var offset = this.height * 0.5;
                child.y -= offset;
            }
        }
    };
    GridLayoutGroup.prototype.getStartOffset = function (axis, requiredSpaceWithoutPadding) {
        var requiredSpace = requiredSpaceWithoutPadding + (axis === 0 ? this.paddingHorizontal() : this.paddingVertical());
        var availableSpace = (axis === 0 ? this.width : this.height);
        var surplusSpace = availableSpace - requiredSpace;
        var alignmentOnAxis = this.getAlignmentOnAxis(axis);
        return (axis === 0 ? this._padding.x : this._padding.z) + surplusSpace * alignmentOnAxis;
    };
    GridLayoutGroup.prototype.getAlignmentOnAxis = function (axis) {
        if (axis === 0)
            return (this._alignmentType % 3) * 0.5;
        else
            return Math.floor(this._alignmentType / 3) * 0.5;
    };
    GridLayoutGroup.prototype.getCellCount = function () {
        var cell = new Phaser.Math.Vector2();
        if (this._constraint === ConstraintType.FixedColumnCount) {
            cell.x = this._constraintCount;
            if (this.layoutElements.length >= cell.x) {
                cell.y = Math.floor(this.layoutElements.length / cell.x) + (this.layoutElements.length % cell.x > 0 ? 1 : 0);
            }
        }
        else if (this._constraint === ConstraintType.FixedRowCount) {
            cell.y = this._constraintCount;
            if (this.layoutElements.length >= cell.y) {
                cell.x = Math.floor(this.layoutElements.length / cell.y) + (this.layoutElements.length % cell.y > 0 ? 1 : 0);
            }
        }
        else {
            cell.x = Math.max(1, Math.floor((this.width - this.paddingHorizontal() + this._spacing.x + 0.001) / (this._cellSize.x + this._spacing.x)));
            cell.y = Math.max(1, Math.floor((this.height - this.paddingVertical() + this._spacing.y + 0.001) / (this._cellSize.y + this._spacing.y)));
        }
        return cell;
    };
    GridLayoutGroup.prototype.paddingHorizontal = function () {
        return this._padding.x + this._padding.y;
    };
    GridLayoutGroup.prototype.paddingVertical = function () {
        return this._padding.z + this._padding.w;
    };
    GridLayoutGroup.ClassName = "gridLayoutGroup";
    return GridLayoutGroup;
}(Phaser.GameObjects.Container));
export { GridLayoutGroup };
export var AlignmentType;
(function (AlignmentType) {
    AlignmentType[AlignmentType["UpperLeft"] = 0] = "UpperLeft";
    AlignmentType[AlignmentType["UpperCenter"] = 1] = "UpperCenter";
    AlignmentType[AlignmentType["UpperRight"] = 2] = "UpperRight";
    AlignmentType[AlignmentType["MiddleLeft"] = 3] = "MiddleLeft";
    AlignmentType[AlignmentType["MiddleCenter"] = 4] = "MiddleCenter";
    AlignmentType[AlignmentType["MiddleRight"] = 5] = "MiddleRight";
    AlignmentType[AlignmentType["LowerLeft"] = 6] = "LowerLeft";
    AlignmentType[AlignmentType["LowerCenter"] = 7] = "LowerCenter";
    AlignmentType[AlignmentType["LowerRight"] = 8] = "LowerRight";
})(AlignmentType || (AlignmentType = {}));
export var CornerType;
(function (CornerType) {
    CornerType[CornerType["UpperLeft"] = 0] = "UpperLeft";
    CornerType[CornerType["UpperRight"] = 1] = "UpperRight";
    CornerType[CornerType["LowerLeft"] = 2] = "LowerLeft";
    CornerType[CornerType["LowerRight"] = 3] = "LowerRight";
})(CornerType || (CornerType = {}));
export var AxisType;
(function (AxisType) {
    AxisType[AxisType["Horizontal"] = 0] = "Horizontal";
    AxisType[AxisType["Vertical"] = 1] = "Vertical";
})(AxisType || (AxisType = {}));
export var ConstraintType;
(function (ConstraintType) {
    ConstraintType[ConstraintType["Flexible"] = 0] = "Flexible";
    ConstraintType[ConstraintType["FixedColumnCount"] = 1] = "FixedColumnCount";
    ConstraintType[ConstraintType["FixedRowCount"] = 2] = "FixedRowCount";
})(ConstraintType || (ConstraintType = {}));
//# sourceMappingURL=grid.layout.group.js.map