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

export class MouseFollow {
    private mNodeType: NodeType;
    private mDisplay: FramesDisplay;
    private mLayerManager: LayerManager;
    private mElementManager: IElementManager;
    private mSprite: ISprite;
    private mAlignGrid: boolean;
    constructor(private mScene: Phaser.Scene, private mRoomService: EditorRoomService) { }

    setDisplay(content: op_client.IOP_EDITOR_REQ_CLIENT_MOUSE_SELECTED_SPRITE) {
        if (!this.mScene) return;
        if (this.mDisplay) {
            this.mDisplay.destroy();
            this.mDisplay = null;
        }
        this.mSprite = new Sprite(content.sprite);
        this.mLayerManager = this.mRoomService.layerManager;
        this.mDisplay = new FramesDisplay(this.mScene, this.mRoomService);
        this.mDisplay.load(<IFramesModel> this.mSprite.displayInfo);
        this.mDisplay.changeAlpha(0.8);
        this.mDisplay.once("initialized", this.onInitializedHandler, this);
        this.mLayerManager.addToSceneToUI(this.mDisplay);

        this.mNodeType = content.nodeType;
        if (this.mNodeType === NodeType.TerrainNodeType) {
            this.mElementManager = this.mRoomService.terrainManager;
        } else if (this.mNodeType === NodeType.ElementNodeType) {
            this.mElementManager = this.mRoomService.elementManager;
        }

        this.mScene.input.on("pointermove", this.onPointerMoveHandler, this);
    }

    getSprite() {
        if (!this.mSprite) {
            return;
        }
        const sprite: ISprite = Object.assign(Object.create(Object.getPrototypeOf(this.mSprite)), this.mSprite);
        sprite.newID();
        sprite.pos = this.getPosition();
        sprite.bindID = this.mSprite.id;
        return sprite;
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
        if (this.mScene) this.mScene.input.off("pointermove", this.onPointerMoveHandler, this);
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
        this.mDisplay.x = pos.x;
        this.mDisplay.y = pos.y;
    }

    private getPosition() {
        if (this.mNodeType === op_def.NodeType.TerrainNodeType) {
            return this.mRoomService.transformTo45(new Pos(this.mDisplay.x, this.mDisplay.y));
        }
        return new Pos(this.mDisplay.x, this.mDisplay.y, this.mDisplay.z);
    }

    private onInitializedHandler() {
        if (!this.mDisplay) {
            return;
        }
        this.mDisplay.showRefernceArea();
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
}
