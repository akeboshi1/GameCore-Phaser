import { IFramesModel } from "../display/frames.model";
import { FramesDisplay } from "../display/frames.display";
import { LayerManager } from "../layer/layer.manager";
import { EditorRoomService } from "../editor.room";
import { IElementManager } from "../element/element.manager";
import { op_client, op_def } from "pixelpai_proto";
import NodeType = op_def.NodeType;
import { ISprite, Sprite } from "../element/sprite";
import { Pos } from "../../utils/pos";
import { IRoomService } from "../room";
import { IPosition45Obj, Position45 } from "../../utils/position45";

export class MouseFollow {
    private mNodeType: NodeType;
    private mDisplay: MouseDisplayContainer;
    private mLayerManager: LayerManager;
    private mElementManager: IElementManager;
    private mSprite: ISprite;
    private mAlignGrid: boolean;
    private mScaleRatio: number = 1;

    /**
     * 笔触大小
     */
    private mSize: number = 1;
    constructor(private mScene: Phaser.Scene, private mRoomService: EditorRoomService) {
        this.mLayerManager = this.mRoomService.layerManager;
        this.mScaleRatio = this.mRoomService.world.scaleRatio;
    }

    setDisplay(content: op_client.IOP_EDITOR_REQ_CLIENT_MOUSE_SELECTED_SPRITE) {
        if (!this.mScene) return;
        if (this.mDisplay) {
            this.mDisplay.destroy();
            this.mDisplay = null;
        }
        this.mNodeType = content.nodeType;
        this.mSprite = new Sprite(content.sprite, content.nodeType);
        this.mDisplay = new MouseDisplayContainer(this.mScene, this.mRoomService);
        const size = this.mNodeType === NodeType.TerrainNodeType ? this.mSize : 1;
        this.mDisplay.setDisplay(this.mSprite, size);
        this.mDisplay.scale = this.mScaleRatio;
        this.mLayerManager.addToSceneToUI(this.mDisplay);
        if (this.mNodeType === NodeType.TerrainNodeType) {
            this.mElementManager = this.mRoomService.terrainManager;
        } else if (this.mNodeType === NodeType.ElementNodeType || this.mNodeType === NodeType.SpawnPointType) {
            this.mElementManager = this.mRoomService.elementManager;
        }

        this.mScene.input.on("pointermove", this.onPointerMoveHandler, this);
        this.mScene.input.on("wheel", this.onWheelHandler, this);
    }

    showEraserArea() {
        if (!this.mScene) return;
        if (this.mDisplay) {
            this.mDisplay.destroy();
        }
        this.mDisplay = new EraserArea(this.mScene, this.mRoomService);
        this.mDisplay.setDisplay(null, this.mSize);
        this.mNodeType = NodeType.TerrainNodeType;
        this.mLayerManager.addToSceneToUI(this.mDisplay);

        this.mScene.input.on("pointermove", this.onPointerMoveHandler, this);
        this.mScene.input.on("wheel", this.onWheelHandler, this);
    }

    createSprites(): ISprite[] {
        if (!this.mSprite) {
            return;
        }
        const result = [];
        let sprite: ISprite = null;
        const displays = this.mDisplay.displays;
        for (const display of displays) {
            // deep clone
            sprite = Object.assign(Object.create(Object.getPrototypeOf(this.mSprite)), this.mSprite);
            sprite.newID();
            sprite.pos = this.getPosition(display.x, display.y);
            sprite.bindID = this.mSprite.id;
            sprite.sn = this.mSprite.sn;
            // sprite.nodeType = this.mSprite.node
            result.push(sprite);
        }
        return result;
    }

    getEaserPosition(): Pos[] {
        const result: Pos[] = [];
        if (!this.display) {
            return;
        }
        let pos: Pos = null;
        for (let i = 0; i < this.mSize; i++) {
            for (let j = 0; j < this.mSize; j++) {
                pos = this.display.transformTo90(i, j);
                result.push(this.getPosition(pos.x, pos.y));
                // result.push(this.mRoomService.transformTo45(new Pos(i, j)));
            }
        }
        // result.push(this.getPosition());
        return result;
    }

    transitionGrid(x: number, y: number) {
        const source = new Pos(x, y);
        const pos =
            this.mNodeType === op_def.NodeType.TerrainNodeType
                ? this.mRoomService.transformTo45(source)
                : this.mRoomService.transformToMini45(source);
        if (this.mAlignGrid === false) {
            return this.checkBound(pos, source);
        }

        return this.checkBound(pos);
    }

    /**
     * 边界检查
     * @param pos 45度坐标，
     * @param source 没有超出边界并不贴边就返回原始坐标
     */
    checkBound(pos: Pos, source?: Pos) {
        const bound = new Pos(pos.x, pos.y);
        const size =
            this.mNodeType === op_def.NodeType.TerrainNodeType
                ? this.mRoomService.roomSize
                : this.mRoomService.miniSize;
        if (pos.x < 0) {
            bound.x = 0;
        } else if (pos.x > size.cols) {
            bound.x = size.cols;
        }

        if (pos.y < 0) {
            bound.y = 0;
        } else if (pos.y > size.rows) {
            bound.y = size.rows;
        }
        if (bound.equal(pos) && source) {
            return source;
        }
        if (this.mNodeType === op_def.NodeType.TerrainNodeType) {
            return this.mRoomService.transformTo90(bound);
        }
        return this.mRoomService.transformToMini90(bound);
    }

    destroy() {
        if (this.mScene) {
            this.mScene.input.off("pointermove", this.onPointerMoveHandler, this);
            this.mScene.input.off("wheel", this.onWheelHandler, this);
        }
        if (this.mDisplay) {
            this.mDisplay.destroy();
            this.mDisplay = null;
        }
        this.mNodeType = NodeType.UnknownNodeType;
    }

    private onPointerMoveHandler(pointer) {
        this.updatePos(pointer.worldX / this.mScaleRatio, pointer.worldY / this.mScaleRatio);
    }

    private getPosition(rows: number = 0, cols: number = 0) {
        if (this.mNodeType === op_def.NodeType.TerrainNodeType) {
            const pos45 = this.mRoomService.transformTo45(new Pos(this.mDisplay.x / this.mScaleRatio + rows, this.mDisplay.y / this.mScaleRatio + cols));
            return pos45;
        }
        // TODO 多个物件仅支持地块
        const pos = new Pos(this.mDisplay.x / this.mScaleRatio + rows, this.mDisplay.y / this.mScaleRatio + cols, this.mDisplay.z);
        return pos;
    }

    private onWheelHandler(pointer) {
        if (this.mNodeType !== NodeType.TerrainNodeType) {
            return;
        }
        if (pointer.deltaY < 0) {
            this.size--;
        } else {
            this.size++;
        }
        this.updatePos(pointer.worldX / this.mScaleRatio, pointer.worldY / this.mScaleRatio);
    }

    private updatePos(worldX: number, worldY: number) {
        if (!this.mDisplay) {
            return;
        }
        const pos = this.transitionGrid(worldX, worldY);
        if (!pos) {
            return;
        }
        this.mDisplay.setLocation(pos.x * this.mScaleRatio, pos.y * this.mScaleRatio);
    }

    set alignGrid(val: boolean) {
        this.mAlignGrid = val;
    }

    get display() {
        return this.mDisplay;
    }

    get sprite(): ISprite {
        return this.mSprite;
    }

    get nodeType(): NodeType {
        return this.mNodeType;
    }

    get elementManager(): IElementManager {
        return this.mElementManager;
    }

    get size(): number {
        return this.mSize;
    }

    set size(val: number) {
        if (val < 1) {
            val = 1;
        }
        if (val > 10) {
            val = 10;
        }
        this.mSize = val;
        this.mDisplay.setDisplay(this.mSprite, this.mSize);
    }
}

class MouseDisplayContainer extends Phaser.GameObjects.Container {
    protected mTileSize: IPosition45Obj;
    protected mOffset: Phaser.Geom.Point;
    private mDisplay: FramesDisplay[];
    private mNodeType: op_def.NodeType;
    private mScaleRatio: number = 1;
    constructor(scene: Phaser.Scene, protected mRoomService: IRoomService) {
        super(scene);
        this.mScaleRatio = this.mRoomService.world.scaleRatio;
        this.mOffset = new Phaser.Geom.Point();
    }

    setDisplay(sprite: ISprite, size: number) {
        this.clear();
        this.mDisplay = [];
        if (!sprite) {
            return;
        }
        const frame = <IFramesModel> sprite.displayInfo;
        this.mNodeType = sprite.nodeType;
        let frameDisplay: FramesDisplay;
        const { tileWidth, tileHeight } = this.mRoomService.roomSize;
        this.mTileSize = {
            tileWidth,
            tileHeight,
            rows: size,
            cols: size,
            sceneWidth: (size + size) * (tileWidth / 2),
            sceneHeight: (size + size) * (tileHeight / 2)
        };

        this.mOffset.x = -(this.mTileSize.sceneWidth / 2 * this.mScaleRatio);
        this.mOffset.y = -((this.mTileSize.sceneHeight / this.mScaleRatio - (size % 2 === 0 ? 0 : tileHeight)) / 2);

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                frameDisplay = new FramesDisplay(this.scene, this.mRoomService);
                frameDisplay.setAlpha(0.8);
                frameDisplay.once("initialized", this.onInitializedHandler, this);
                frameDisplay.load(frame);
                const pos = Position45.transformTo90(new Pos(i, j), this.mTileSize);
                frameDisplay.x = pos.x;
                frameDisplay.y = pos.y;
                this.add(frameDisplay);
                this.mDisplay.push(frameDisplay);
            }
        }
    }

    transformTo90(row: number, col: number) {
        return Position45.transformTo90(new Pos(row, col), this.mTileSize);
    }

    transformTo45(x: number, y: number) {
        return Position45.transformTo45(new Pos(x, y), this.mTileSize);
    }

    setLocation(x: number, y: number) {
        // return super.setPosition(x + this.mOffset.x, y + this.mOffset.y);
        this.x = x + this.mOffset.x;
        this.y = y + this.mOffset.y;
        return this;
    }

    clear() {
        this.removeAll(true);
        this.mDisplay = undefined;
    }

    destroy(fromScene?: boolean): void {
        this.clear();
        super.destroy(fromScene);
    }

    get displays() {
        return this.mDisplay;
    }

    get tileWidth(): number {
        let tmp = this.mTileSize.tileHeight;
        if (this.mTileSize.rows % 2 === 0) {
            tmp = 0;
        }
        return this.mTileSize.sceneWidth - tmp;
    }

    get tileHeight(): number {
        return this.mTileSize.sceneHeight;
    }

    private onInitializedHandler(obj: FramesDisplay) {
        if (obj) {
            if (this.mNodeType !== op_def.NodeType.TerrainNodeType) {
                obj.showRefernceArea();
            }
        }
    }
}

class EraserArea extends MouseDisplayContainer {
    private area: Phaser.GameObjects.Graphics;
    constructor(scene: Phaser.Scene, roomService: IRoomService) {
        super(scene, roomService);
    }

    setDisplay(frame: ISprite, size: number) {
        if (this.area) {
            this.area.clear();
        }
        const { tileWidth, tileHeight } = this.mRoomService.roomSize;
        this.mTileSize = {
            tileWidth,
            tileHeight,
            rows: size,
            cols: size,
            sceneWidth: (size + size) * (tileWidth / 2),
            sceneHeight: (size + size) * (tileHeight / 2)
        };

        this.mOffset.x = -(this.mTileSize.sceneWidth / 2);
        this.mOffset.y = -((this.mTileSize.sceneHeight - (size % 2 === 0 ? 0 : tileHeight)) / 2);
        let p1: Pos;
        let p2: Pos;
        let p3: Pos;
        let p4: Pos;
        this.area = this.scene.make.graphics(undefined, false);
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                this.area.lineStyle(2, 0);
                p1 = Position45.transformTo90(new Pos(x, y), this.mTileSize);
                p2 = Position45.transformTo90(new Pos(x + 1, y), this.mTileSize);
                p3 = Position45.transformTo90(new Pos(x + 1, y + 1), this.mTileSize);
                p4 = Position45.transformTo90(new Pos(x, y + 1), this.mTileSize);
                this.area.beginPath();
                this.area.fillStyle(0, 0.5);
                this.area.strokePoints([p1.toPoint(), p2.toPoint(), p3.toPoint(), p4.toPoint()], true, true);
                this.area.fillPath();
            }
        }
        this.add(this.area);
    }
}
