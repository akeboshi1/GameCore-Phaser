import { IPoint } from "game-capsule";
import { AnimationDataNode } from "game-capsule";
import Position45Utils from "../../utils/position45.utils";
import { Logger } from "utils";
import { ElementEditorCanvas, ElementEditorBrushType } from "./element.editor.canvas";

export default class ElementEditorGrids extends Phaser.GameObjects.Container {
    private mRows = 5;
    private mCols = 5;
    private mAnchor: Phaser.Geom.Point;
    private readonly gridWidth = 30;
    private readonly gridHeight = 15;
    private mPositionManager: Position45Utils;

    private mGridLayer: Phaser.GameObjects.Container;
    private mWalkableLayer: Phaser.GameObjects.Container;
    private mCollisionLayer: Phaser.GameObjects.Container;
    private mInteractiveLayer: Phaser.GameObjects.Container;
    private mWalkableArea: WalkableGrid[][];
    private mBasicWalkableArea: number[][];
    private mCollisionArea: CollisionGrid[][];
    private mBasicCollisionArea: number[][];
    private mInteractiveArea: CollisionGrid[][];
    private mBasicInteractiveArea: IPoint[];
    private mCurToolType: ElementEditorBrushType;
    private mAnimationData: AnimationDataNode;

    constructor(scene: Phaser.Scene, node: AnimationDataNode) {
        super(scene);
        const parentContainer = scene.add.container(0, 0);
        parentContainer.add(this);
        this.mPositionManager = new Position45Utils(
            this.gridWidth,
            this.gridHeight,
            (this.gridWidth * this.mRows) >> 1,
            0
        );

        this.mGridLayer = this.scene.make.container(undefined, false);
        this.mCollisionLayer = this.scene.make.container(undefined, false);
        this.mWalkableLayer = this.scene.make.container(undefined, false);
        this.mInteractiveLayer = this.scene.make.container(undefined, false);
        this.add([this.mGridLayer, this.mWalkableLayer, this.mCollisionLayer, this.mInteractiveLayer]);
        this.scene.input.on("pointerdown", this.onDownHandler, this);
        this.scene.input.on("pointermove", this.onMoveHandler, this);
        this.scene.input.on("pointerup", this.onUpHandler, this);
        this.mCurToolType = ElementEditorBrushType.Drag;

        // init data
        this.setAnimationData(node);
    }

    public setAnimationData(animationData: AnimationDataNode) {
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
            this.drawInteractive(
                new Phaser.Geom.Point(
                    areaPoint.x + Math.floor(this.mRows / 2),
                    areaPoint.y + Math.floor(this.mCols / 2)
                )
            );
        }
    }

    public getAnchor90Point() {
        if (!this.mAnimationData) return;
        const baseLoc = this.mAnimationData.collisionOriginPoint || { x: 0, y: 0 };
        const point = new Phaser.Geom.Point(this.mAnchor.y, this.mAnchor.x);
        const p = this.mPositionManager.transformTo90(point);
        p.x += this.x;
        p.y += this.y;
        return p;
    }

    public getOriginPoint() {
        if (!this.mAnimationData) return;
        const baseLoc = this.mAnimationData.collisionOriginPoint || { x: 0, y: 0 };
        const point = new Phaser.Geom.Point(baseLoc.y, baseLoc.x);
        const p = this.mPositionManager.transformTo90(point);
        p.x += this.x;
        p.y += this.y;
        return p;
    }

    public clear() {
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

    public changeBrush(val: ElementEditorBrushType) {
        this.mCurToolType = val;
    }

    private setArea(rows: number, cols: number) {
        this.mRows = rows;
        this.mCols = cols;
        this.mWalkableArea = new Array<Grid[]>(this.mRows);
        for (let i = 0; i < this.mRows; i++) {
            this.mWalkableArea[i] = new Array<Grid>(this.mCols);
        }
        this.mCollisionArea = new Array<Grid[]>(this.mRows);
        for (let i = 0; i < this.mRows; i++) {
            this.mCollisionArea[i] = new Array<Grid>(this.mCols);
        }
        this.mInteractiveArea = new Array<Grid[]>(this.mRows);
        for (let i = 0; i < this.mRows; i++) {
            this.mInteractiveArea[i] = new Array<Grid>(this.mCols);
        }
        this.mAnchor = new Phaser.Geom.Point(this.mRows >> 1, this.mCols >> 1);
        if (this.mPositionManager) {
            this.mPositionManager.setOffset((this.gridWidth * this.mRows) >> 1, 0);
        }
        this.drawGrid();
    }

    private drawFromData(area: number[][], type: ElementEditorBrushType) {
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

    private onDownHandler(pointer: Phaser.Input.Pointer, event: any) {
        if (pointer.leftButtonDown() || pointer.rightButtonDown())
            this.clickGrid(pointer);
    }

    private onMoveHandler(pointer: Phaser.Input.Pointer) {
        // Logger.getInstance().log("Grids -> onMoveHandler -> pointer.isDown", pointer.isDown);
        if (pointer.leftButtonDown() || pointer.rightButtonDown()) {
            this.clickGrid(pointer);
        } else if (pointer.middleButtonDown()) {
            // this.dragCamera(pointer);
        }
    }

    private onUpHandler(pointer: Phaser.Input.Pointer) {

    }

    private clickGrid(pointer: Phaser.Input.Pointer) {
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

    private dragCamera(pointer: Phaser.Input.Pointer) {
        const cam = this.scene.cameras.main;
        const dragScale = 0.1;
        cam.setPosition(cam.x + pointer.velocity.x * dragScale, cam.y + pointer.velocity.y * dragScale);
    }

    private drawWalkable(loc: Phaser.Geom.Point) {
        let grid = this.mWalkableArea[loc.y][loc.x];

        if (grid) return;
        const point = this.mPositionManager.transformTo90(loc);
        grid = new WalkableGrid(this.scene, { x: point.x, y: point.y });
        grid.x -= grid.width >> 1;
        grid.y += grid.height >> 1;
        this.mWalkableLayer.add(grid);
        this.mWalkableArea[loc.y][loc.x] = grid;
        this.mBasicWalkableArea[loc.y][loc.x] = 1;
    }
    private eraseWalkable(loc: Phaser.Geom.Point) {
        const grid = this.mWalkableArea[loc.y][loc.x];
        if (!grid) return;

        grid.clear();
        this.mWalkableLayer.remove(grid);
        this.mWalkableArea[loc.y][loc.x] = null;
        this.mBasicWalkableArea[loc.y][loc.x] = 0;
    }

    private drawCollision(loc: Phaser.Geom.Point) {
        let grid = this.mCollisionArea[loc.y][loc.x];

        if (grid) return;
        const point = this.mPositionManager.transformTo90(loc);
        grid = new CollisionGrid(this.scene, { x: point.x, y: point.y });
        grid.x -= grid.width >> 1;
        // grid.y += grid.height >> 1;
        this.mCollisionLayer.add(grid);
        this.mCollisionArea[loc.y][loc.x] = grid;
        this.mBasicCollisionArea[loc.y][loc.x] = 1;
    }
    private eraseCollision(loc: Phaser.Geom.Point) {
        const grid = this.mCollisionArea[loc.y][loc.x];
        if (!grid) return;

        grid.clear();
        this.mCollisionLayer.remove(grid);
        this.mCollisionArea[loc.y][loc.x] = null;
        this.mBasicCollisionArea[loc.y][loc.x] = 0;
    }

    private drawInteractive(loc: Phaser.Geom.Point) {
        let grid = this.mInteractiveArea[loc.y][loc.x];
        if (grid) return;

        const x = loc.x - Math.floor(this.mRows / 2);
        const y = loc.y - Math.floor(this.mCols / 2);
        const index = this.mBasicInteractiveArea.findIndex((p) => p.x === x && p.y === y);

        const point = this.mPositionManager.transformTo90(loc);
        grid = new InteractiveGrid(this.scene, { x: point.x, y: point.y });
        grid.x -= grid.width >> 1;
        grid.y += grid.height >> 1;
        this.mInteractiveLayer.add(grid);
        if (index < 0) this.mBasicInteractiveArea.push({ x, y });
        this.mInteractiveArea[loc.y][loc.x] = grid;
    }
    private eraseInteractive(loc: Phaser.Geom.Point) {
        const grid = this.mInteractiveArea[loc.y][loc.x];
        if (!grid) return;

        const x = loc.x - Math.floor(this.mRows / 2);
        const y = loc.y - Math.floor(this.mCols / 2);
        const index = this.mBasicInteractiveArea.findIndex((p) => p.x === x && p.y === y);

        grid.clear();
        this.mInteractiveLayer.remove(grid);
        this.mInteractiveArea[loc.y][loc.x] = null;
        if (index >= 0) this.mBasicInteractiveArea.splice(index, 1);
    }

    private drawGrid() {
        const graphics = this.scene.make.graphics(undefined, false);
        graphics.lineStyle(1, 0xffffff, 0.1);
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
        const anchorView = this.scene.make.graphics(undefined, false);
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
        const _w = (this.mRows + this.mCols) * (this.gridWidth / 2);
        const _h = (this.mRows + this.mCols) * (this.gridHeight / 2);
        this.x = (this.scene.game.scale.width - _w) >> 1;
        this.y = (this.scene.game.scale.height - _h) >> 1;
    }

    private drawLine(
        graphics: Phaser.GameObjects.Graphics,
        startX: number,
        endX: number,
        startY: number,
        endY: number
    ) {
        let point = new Phaser.Geom.Point(startX, endX);
        point = this.mPositionManager.transformTo90(point);
        graphics.moveTo(point.x, point.y);
        point = new Phaser.Geom.Point(startY, endY);
        point = this.mPositionManager.transformTo90(point);
        graphics.lineTo(point.x, point.y);
    }
}

class Grid extends Phaser.GameObjects.Graphics {
    constructor(
        scene: Phaser.Scene,
        options: Phaser.Types.GameObjects.Graphics.Options,
        private tileWidth: number = 30,
        private tileHeight: number = 15,
        private color: number = 0
    ) {
        super(scene, options);
        this.drawTile(this.color);
    }

    private drawTile(color: number = 0, alpha: number = 0.5) {
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
    }

    get width() {
        return this.tileWidth;
    }

    get height() {
        return this.tileHeight;
    }
}

class WalkableGrid extends Grid {
    constructor(game: Phaser.Scene, options: Phaser.Types.GameObjects.Graphics.Options) {
        super(game, options, 16, 8, 0x00ff00);
    }
}

class CollisionGrid extends Grid {
    constructor(game: Phaser.Scene, options: Phaser.Types.GameObjects.Graphics.Options) {
        super(game, options, 28, 14, 0xff8000);
    }
}

class InteractiveGrid extends Grid {
    constructor(scene: Phaser.Scene, options: Phaser.Types.GameObjects.Graphics.Options) {
        super(scene, options, 16, 8, 0xffff00);
    }
}
