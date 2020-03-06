import {DecoratePanel} from "./decorate.panel";
import {LayerManager} from "../../rooms/layer/layer.manager";
import { FramesDisplay } from "../../rooms/display/frames.display";
import { DragonbonesDisplay } from "../../rooms/display/dragonbones.display";
import { EditorRoomService } from "../../rooms/editor.room";
import { DisplayObject } from "../../rooms/display/display.object";
import { IRoomService } from "../../rooms/room";
import { DecorateRoom } from "../../rooms/decorate.room";
import { Pos } from "../../utils/pos";
import { ISprite } from "../../rooms/element/sprite";
import { PBpacket } from "net-socket-packet";
import { op_virtual_world, op_def } from "pixelpai_proto";

export class DecorateManager extends Phaser.Events.EventEmitter {
    private mPanel: DecoratePanel;
    private mLayerManager: LayerManager;
    private mRoomService: IRoomService;
    constructor(scene: Phaser.Scene, roomService: IRoomService) {
        super();
        this.mPanel = new DecoratePanel(scene, <DecorateRoom> roomService);
        this.mPanel.on("moveElement", this.onMoveElementHandler, this);
        this.mPanel.on("addSprite", this.onAddSpriteHandler, this);
        this.mRoomService = roomService;
        this.mLayerManager = roomService.layerManager;
    }

    public setElement(ele: DisplayObject, sprite: ISprite) {
        this.mPanel.setElement(ele, sprite);
        this.mLayerManager.addToSceneToUI(this.mPanel);
        this.mPanel.show();
    }

    public remove() {
        // TODO panel只有destroy。需要封装个仅移除的方法
        if (this.mPanel.parentContainer) {
            this.mPanel.parentContainer.remove(this.mPanel);
        }
        this.mPanel.close();
    }

    public updatePos(x: number, y: number) {
        if (!this.mPanel) {
            return;
        }
        this.mPanel.updatePos(x, y);
    }

    private onMoveElementHandler(pos: Pos) {
        this.emit("moveElement", pos);
    }

    private onAddSpriteHandler(sprite: ISprite, points: Pos[]) {
        this.sendAddSpriteByType(sprite, points);
    }

    private sendAddSpriteByType(sprite: ISprite, points: Pos[]) {
        if (!sprite || !points || points.length < 1) {
            return;
        }
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ADD_SPRITE_BY_TYPE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ADD_SPRITE_BY_TYPE = packet.content;
        const pos = [];
        for (const point of points) {
            const p = op_def.PBPoint3f.create();
            p.x = point.x;
            p.y = point.y;
            pos.push(p);
        }
        content.nodeType = op_def.NodeType.ElementNodeType;
        content.sprite = sprite.toSprite();
        content.points = pos;
        this.mRoomService.connection.send(packet);
    }
}
