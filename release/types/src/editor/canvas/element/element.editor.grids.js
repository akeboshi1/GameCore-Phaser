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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import { Logger } from "structure";
import Position45Utils from "../../utils/position45.utils";
import { ElementEditorBrushType } from "./element.editor.type";
var ElementEditorGrids = /** @class */ (function (_super) {
    __extends_1(ElementEditorGrids, _super);
    function ElementEditorGrids(scene, node) {
        var _this = _super.call(this, scene) || this;
        _this.mRows = 5;
        _this.mCols = 5;
        _this.gridWidth = 30;
        _this.gridHeight = 15;
        var parentContainer = scene.add.container(0, 0);
        parentContainer.add(_this);
        _this.mPositionManager = new Position45Utils(_this.gridWidth, _this.gridHeight, (_this.gridWidth * _this.mRows) >> 1, 0);
        _this.mGridLayer = _this.scene.make.container(undefined, false);
        _this.mCollisionLayer = _this.scene.make.container(undefined, false);
        _this.mWalkableLayer = _this.scene.make.container(undefined, false);
        _this.mInteractiveLayer = _this.scene.make.container(undefined, false);
        _this.add([_this.mGridLayer, _this.mWalkableLayer, _this.mCollisionLayer, _this.mInteractiveLayer]);
        _this.scene.input.on("pointerdown", _this.onDownHandler, _this);
        _this.scene.input.on("pointermove", _this.onMoveHandler, _this);
        _this.scene.input.on("pointerup", _this.onUpHandler, _this);
        _this.mCurToolType = ElementEditorBrushType.Drag;
        // init data
        _this.setAnimationData(node);
        return _this;
    }
    ElementEditorGrids.prototype.setAnimationData = function (animationData) {
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
        var area = __spreadArrays(this.mBasicInteractiveArea);
        for (var _i = 0, area_1 = area; _i < area_1.length; _i++) {
            var areaPoint = area_1[_i];
            this.drawInteractive(new Phaser.Geom.Point(areaPoint.x + Math.floor(this.mRows / 2), areaPoint.y + Math.floor(this.mCols / 2)));
        }
    };
    ElementEditorGrids.prototype.getAnchor90Point = function () {
        if (!this.mAnimationData)
            return;
        var baseLoc = this.mAnimationData.collisionOriginPoint || { x: 0, y: 0 };
        var point = new Phaser.Geom.Point(this.mAnchor.y, this.mAnchor.x);
        var p = this.mPositionManager.transformTo90(point);
        p.x += this.x;
        p.y += this.y;
        return p;
    };
    ElementEditorGrids.prototype.getOriginPoint = function () {
        if (!this.mAnimationData)
            return;
        var baseLoc = this.mAnimationData.collisionOriginPoint || { x: 0, y: 0 };
        var point = new Phaser.Geom.Point(baseLoc.y, baseLoc.x);
        var p = this.mPositionManager.transformTo90(point);
        p.x += this.x;
        p.y += this.y;
        return p;
    };
    ElementEditorGrids.prototype.clear = function () {
        if (this.mWalkableArea) {
            this.mWalkableArea.forEach(function (rows) {
                rows.forEach(function (element) {
                    if (element) {
                        element.clear();
                        element.destroy();
                    }
                });
            });
        }
        if (this.mCollisionArea) {
            this.mCollisionArea.forEach(function (rows) {
                rows.forEach(function (element) {
                    if (element) {
                        element.clear();
                        element.destroy();
                    }
                });
            });
        }
        if (this.mInteractiveArea) {
            this.mInteractiveArea.forEach(function (rows) {
                rows.forEach(function (element) {
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
    };
    ElementEditorGrids.prototype.changeBrush = function (val) {
        this.mCurToolType = val;
    };
    ElementEditorGrids.prototype.setArea = function (rows, cols) {
        this.mRows = rows;
        this.mCols = cols;
        this.mWalkableArea = new Array(this.mRows);
        for (var i = 0; i < this.mRows; i++) {
            this.mWalkableArea[i] = new Array(this.mCols);
        }
        this.mCollisionArea = new Array(this.mRows);
        for (var i = 0; i < this.mRows; i++) {
            this.mCollisionArea[i] = new Array(this.mCols);
        }
        this.mInteractiveArea = new Array(this.mRows);
        for (var i = 0; i < this.mRows; i++) {
            this.mInteractiveArea[i] = new Array(this.mCols);
        }
        this.mAnchor = new Phaser.Geom.Point(this.mRows >> 1, this.mCols >> 1);
        if (this.mPositionManager) {
            this.mPositionManager.setOffset((this.gridWidth * this.mRows) >> 1, 0);
        }
        this.drawGrid();
    };
    ElementEditorGrids.prototype.drawFromData = function (area, type) {
        for (var i = 0; i < this.mRows; i++) {
            for (var j = 0; j < this.mCols; j++) {
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
    };
    ElementEditorGrids.prototype.onDownHandler = function (pointer, event) {
        if (pointer.leftButtonDown() || pointer.rightButtonDown())
            this.clickGrid(pointer);
    };
    ElementEditorGrids.prototype.onMoveHandler = function (pointer) {
        // Logger.getInstance().log("Grids -> onMoveHandler -> pointer.isDown", pointer.isDown);
        if (pointer.leftButtonDown() || pointer.rightButtonDown()) {
            this.clickGrid(pointer);
        }
        else if (pointer.middleButtonDown()) {
            // this.dragCamera(pointer);
        }
    };
    ElementEditorGrids.prototype.onUpHandler = function (pointer) {
    };
    ElementEditorGrids.prototype.clickGrid = function (pointer) {
        var point = new Phaser.Geom.Point();
        point.x = pointer.x - this.x;
        point.y = pointer.y - this.y;
        var p = this.mPositionManager.transformTo45(point);
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
    };
    ElementEditorGrids.prototype.dragCamera = function (pointer) {
        var cam = this.scene.cameras.main;
        var dragScale = 0.1;
        cam.setPosition(cam.x + pointer.velocity.x * dragScale, cam.y + pointer.velocity.y * dragScale);
    };
    ElementEditorGrids.prototype.drawWalkable = function (loc) {
        var grid = this.mWalkableArea[loc.y][loc.x];
        if (grid)
            return;
        var point = this.mPositionManager.transformTo90(loc);
        grid = new WalkableGrid(this.scene, { x: point.x, y: point.y });
        grid.x -= grid.width >> 1;
        grid.y += grid.height >> 1;
        this.mWalkableLayer.add(grid);
        this.mWalkableArea[loc.y][loc.x] = grid;
        this.mBasicWalkableArea[loc.y][loc.x] = 1;
    };
    ElementEditorGrids.prototype.eraseWalkable = function (loc) {
        var grid = this.mWalkableArea[loc.y][loc.x];
        if (!grid)
            return;
        grid.clear();
        this.mWalkableLayer.remove(grid);
        this.mWalkableArea[loc.y][loc.x] = null;
        this.mBasicWalkableArea[loc.y][loc.x] = 0;
    };
    ElementEditorGrids.prototype.drawCollision = function (loc) {
        var grid = this.mCollisionArea[loc.y][loc.x];
        if (grid)
            return;
        var point = this.mPositionManager.transformTo90(loc);
        grid = new CollisionGrid(this.scene, { x: point.x, y: point.y });
        grid.x -= grid.width >> 1;
        // grid.y += grid.height >> 1;
        this.mCollisionLayer.add(grid);
        this.mCollisionArea[loc.y][loc.x] = grid;
        this.mBasicCollisionArea[loc.y][loc.x] = 1;
    };
    ElementEditorGrids.prototype.eraseCollision = function (loc) {
        var grid = this.mCollisionArea[loc.y][loc.x];
        if (!grid)
            return;
        grid.clear();
        this.mCollisionLayer.remove(grid);
        this.mCollisionArea[loc.y][loc.x] = null;
        this.mBasicCollisionArea[loc.y][loc.x] = 0;
    };
    ElementEditorGrids.prototype.drawInteractive = function (loc) {
        var grid = this.mInteractiveArea[loc.y][loc.x];
        if (grid)
            return;
        var x = loc.x - Math.floor(this.mRows / 2);
        var y = loc.y - Math.floor(this.mCols / 2);
        var index = this.mBasicInteractiveArea.findIndex(function (p) { return p.x === x && p.y === y; });
        var point = this.mPositionManager.transformTo90(loc);
        grid = new InteractiveGrid(this.scene, { x: point.x, y: point.y });
        grid.x -= grid.width >> 1;
        grid.y += grid.height >> 1;
        this.mInteractiveLayer.add(grid);
        if (index < 0)
            this.mBasicInteractiveArea.push({ x: x, y: y });
        this.mInteractiveArea[loc.y][loc.x] = grid;
    };
    ElementEditorGrids.prototype.eraseInteractive = function (loc) {
        var grid = this.mInteractiveArea[loc.y][loc.x];
        if (!grid)
            return;
        var x = loc.x - Math.floor(this.mRows / 2);
        var y = loc.y - Math.floor(this.mCols / 2);
        var index = this.mBasicInteractiveArea.findIndex(function (p) { return p.x === x && p.y === y; });
        grid.clear();
        this.mInteractiveLayer.remove(grid);
        this.mInteractiveArea[loc.y][loc.x] = null;
        if (index >= 0)
            this.mBasicInteractiveArea.splice(index, 1);
    };
    ElementEditorGrids.prototype.drawGrid = function () {
        var graphics = this.scene.make.graphics(undefined, false);
        graphics.lineStyle(1, 0xffffff, 0.1);
        graphics.beginPath();
        for (var i = 0; i <= this.mRows; i++) {
            this.drawLine(graphics, 0, i, this.mRows, i);
        }
        for (var i = 0; i <= this.mCols; i++) {
            this.drawLine(graphics, i, 0, i, this.mCols);
        }
        graphics.closePath();
        graphics.strokePath();
        this.mGridLayer.add(graphics);
        var point = this.mPositionManager.transformTo90(this.mAnchor);
        var anchorView = this.scene.make.graphics(undefined, false);
        anchorView.fillStyle(0xff0000);
        anchorView.fillCircle(point.x, point.y, 3);
        anchorView.fillPath();
        // anchorView.beginFill(0xff0000);
        // anchorView.drawCircle(point.x, point.y, 6);
        // anchorView.endFill();
        // this.drawLine(anchorView, this.anchor.x - 1, this.anchor.y, this.anchor.x + 1, this.anchor.y);
        // this.drawLine(anchorView, this.anchor.x, this.anchor.y - 1, this.anchor.x, this.anchor.y + 1);
        this.mGridLayer.add(anchorView);
        // this.x = (this.game.width - this.width) >> 1;
        // this.y = (this.game.height - this.height) >> 1;
        var _w = (this.mRows + this.mCols) * (this.gridWidth / 2);
        var _h = (this.mRows + this.mCols) * (this.gridHeight / 2);
        this.x = (this.scene.game.scale.width - _w) >> 1;
        this.y = (this.scene.game.scale.height - _h) >> 1;
    };
    ElementEditorGrids.prototype.drawLine = function (graphics, startX, endX, startY, endY) {
        var point = new Phaser.Geom.Point(startX, endX);
        point = this.mPositionManager.transformTo90(point);
        graphics.moveTo(point.x, point.y);
        point = new Phaser.Geom.Point(startY, endY);
        point = this.mPositionManager.transformTo90(point);
        graphics.lineTo(point.x, point.y);
    };
    return ElementEditorGrids;
}(Phaser.GameObjects.Container));
export default ElementEditorGrids;
var Grid = /** @class */ (function (_super) {
    __extends_1(Grid, _super);
    function Grid(scene, options, tileWidth, tileHeight, color) {
        if (tileWidth === void 0) { tileWidth = 30; }
        if (tileHeight === void 0) { tileHeight = 15; }
        if (color === void 0) { color = 0; }
        var _this = _super.call(this, scene, options) || this;
        _this.tileWidth = tileWidth;
        _this.tileHeight = tileHeight;
        _this.color = color;
        _this.drawTile(_this.color);
        return _this;
    }
    Grid.prototype.drawTile = function (color, alpha) {
        if (color === void 0) { color = 0; }
        if (alpha === void 0) { alpha = 0.5; }
        this.clear();
        this.lineStyle(1, color);
        // this.beginFill(color, alpha);
        this.fillStyle(color, alpha);
        this.moveTo(0, this.tileHeight >> 1);
        this.lineTo(this.tileWidth >> 1, 0);
        this.lineTo(this.tileWidth, this.tileHeight >> 1);
        this.lineTo(this.tileWidth >> 1, this.tileHeight);
        this.lineTo(0, this.tileHeight >> 1);
        this.fillPath();
    };
    Object.defineProperty(Grid.prototype, "width", {
        get: function () {
            return this.tileWidth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Grid.prototype, "height", {
        get: function () {
            return this.tileHeight;
        },
        enumerable: true,
        configurable: true
    });
    return Grid;
}(Phaser.GameObjects.Graphics));
var WalkableGrid = /** @class */ (function (_super) {
    __extends_1(WalkableGrid, _super);
    function WalkableGrid(game, options) {
        return _super.call(this, game, options, 16, 8, 0x00ff00) || this;
    }
    return WalkableGrid;
}(Grid));
var CollisionGrid = /** @class */ (function (_super) {
    __extends_1(CollisionGrid, _super);
    function CollisionGrid(game, options) {
        return _super.call(this, game, options, 28, 14, 0xff8000) || this;
    }
    return CollisionGrid;
}(Grid));
var InteractiveGrid = /** @class */ (function (_super) {
    __extends_1(InteractiveGrid, _super);
    function InteractiveGrid(scene, options) {
        return _super.call(this, scene, options, 16, 8, 0xffff00) || this;
    }
    return InteractiveGrid;
}(Grid));
//# sourceMappingURL=element.editor.grids.js.map