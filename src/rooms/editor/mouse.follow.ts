import {IFramesModel} from "../display/frames.model";
import {FramesDisplay} from "../display/frames.display";
import {LayerManager} from "../layer/layer.manager";
import {EditorRoomService} from "../editor.room";
import {IElementManager} from "../element/element.manager";
import {op_client, op_def} from "pixelpai_proto";
import NodeType = op_def.NodeType;
import {ISprite, Sprite} from "../element/sprite";
import { Pos } from "../../utils/pos";
import {Logger} from "../../utils/log";
import {IRoomService} from "../room";
import {IPosition45Obj, Position45} from "../../utils/position45";

export class MouseFollow {
    private mNodeType: NodeType;
    private mDisplay: MouseDisplayContainer;
    private mLayerManager: LayerManager;
    private mElementManager: IElementManager;
    private mSprite: ISprite;
    private mAlignGrid: boolean;

    /**
     * 笔触大小
     */
    private mSize: number = 1;
    constructor(private mScene: Phaser.Scene, private mRoomService: EditorRoomService) { }

    setDisplay(content: op_client.IOP_EDITOR_REQ_CLIENT_MOUSE_SELECTED_SPRITE) {
        if (!this.mScene) return;
        if (this.mDisplay) {
            this.mDisplay.destroy();
            this.mDisplay = null;
        }
        this.mSprite = new Sprite(content.sprite);
        this.mLayerManager = this.mRoomService.layerManager;
        this.mDisplay = new MouseDisplayContainer(this.mScene, this.mRoomService);
        this.mDisplay.setDisplay(<IFramesModel> this.mSprite.displayInfo, this.mSize);
        this.mLayerManager.addToSceneToUI(this.mDisplay);

        this.mNodeType = content.nodeType;
        if (this.mNodeType === NodeType.TerrainNodeType) {
            this.mElementManager = this.mRoomService.terrainManager;
        } else if (this.mNodeType === NodeType.ElementNodeType) {
            this.mElementManager = this.mRoomService.elementManager;
        }

        this.mScene.input.on("pointermove", this.onPointerMoveHandler, this);
        this.mScene.input.on("wheel", this.onWheelHandler, this);
        // this.mDisplay.x = 0;
        // this.mDisplay.y = 0;
    }

    createSprites(): ISprite[] {
        if (!this.mSprite) {
            return;
        }
        const resule = [];
        const count = this.mSize * this.mSize;
        let sprite: ISprite = null;
        const displays = this.mDisplay.displays;
        for (const display of displays) {
            sprite = Object.assign(Object.create(Object.getPrototypeOf(this.mSprite)), this.mSprite);
            sprite.newID();
            sprite.pos = this.getPosition(display.x, display.y);
            sprite.bindID = this.mSprite.id;
            resule.push(sprite);
        }
        return resule;
    }

    transitionGrid(x: number, y: number, ) {
        const source = new Pos(x, y);
        const pos = this.mRoomService.transformToMini45(source);
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
        const size = this.mRoomService.miniSize;
        if (pos.x < 0) {
            bound.x = 0;
        } else if (pos.x > size.rows) {
            bound.x = size.rows;
        }

        if (pos.y < 0) {
            bound.y = 0;
        } else if (pos.y > size.cols) {
            bound.y = size.cols;
        }
        if (bound.equal(pos) && source) {
            return source;
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
        if (!this.mDisplay) {
            return;
        }
        const pos = this.transitionGrid(pointer.worldX, pointer.worldY);
        if (!pos) {
            return;
        }
        this.mDisplay.x = pos.x - (this.mDisplay.tileWidth >> 1);
        this.mDisplay.y = pos.y - (this.mDisplay.tileHeight >> 1);
    }

    private getPosition(rows: number = 0, cols: number = 0) {
        if (this.mNodeType === op_def.NodeType.TerrainNodeType) {
            return  this.mRoomService.transformTo45(new Pos(this.mDisplay.x + rows, this.mDisplay.y + cols));
            // pos.x += rows;
            // pos.y += cols;
            // return pos;
        }
        // TODO 多个物件仅支持地块
        const pos = new Pos(this.mDisplay.x + rows, this.mDisplay.y + cols, this.mDisplay.z);
        pos.y += this.mRoomService.miniSize.tileHeight >> 1;
        return pos;
    }

    private onWheelHandler(pointer, currentOver, dx, dy) {
        if (pointer.deltaY < 0) {
            this.size--;
        } else {
            this.size++;
        }
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
        this.mDisplay.setDisplay(<IFramesModel> this.mSprite.displayInfo, this.mSize);
    }
}

class MouseDisplayContainer extends Phaser.GameObjects.Container {
    private mDisplay: FramesDisplay[];
    private mTileSize: IPosition45Obj;
    constructor(scene: Phaser.Scene, private mRoomService: IRoomService) {
        super(scene);
    }

    setDisplay(frame: IFramesModel, size: number) {
        this.clear();
        this.mDisplay = [];
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

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                frameDisplay = new FramesDisplay(this.scene, this.mRoomService);
                frameDisplay.setAlpha(0.8);
                frameDisplay.load(frame);
                frameDisplay.once("initialized", this.onInitializedHandler, this);
                const pos = Position45.transformTo90(new Pos(i, j), this.mTileSize);
                frameDisplay.x = pos.x;
                frameDisplay.y = pos.y;
                this.add(frameDisplay);
                this.mDisplay.push(frameDisplay);
            }
        }
    }

    clear() {
        this.removeAll(true);
        this.mDisplay = undefined;
    }

    destroy(fromScene?: boolean): void {
        this.clear();
        super.destroy(fromScene);
    }

    getPosition() {
        if (!this.parentContainer) {
            return;
        }
        const pos = new Pos(this.parentContainer.x, this.parentContainer.y);
    }

    get tileWidth(): number {
        return this.mTileSize.sceneWidth;
    }

    get tileHeight(): number {
        return this.mTileSize.sceneHeight;
    }

    get displays() {
        return this.mDisplay;
    }

    private onInitializedHandler(obj: FramesDisplay) {
        if (obj) {
            obj.showRefernceArea();
        }
    }
}
