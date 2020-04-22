import { ElementManager } from "./element.manager";
import { ISprite, Sprite } from "./sprite";
import { PBpacket } from "net-socket-packet";
import { op_editor, op_def, op_client } from "pixelpai_proto";
import { Logger } from "../../utils/log";
import { Pos } from "../../utils/pos";
import { Element, InputEnable } from "./element";
import NodeType = op_def.NodeType;
import { EditorRoomService } from "../editor.room";
import { DisplayObject } from "../display/display.object";

export class EditorElementManager extends ElementManager {
    private mossTaskQueue: Map<string, any> = new Map();
    private taskQueue: Map<number, any> = new Map();
    private editorMosses: Map<string, any> = new Map();
    constructor(protected mRoom: EditorRoomService) {
        super(mRoom);
        if (this.connection) {
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_CREATE_SPRITE, this.handleCreateElements);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_SYNC_SPRITE, this.handleSyncElements);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_SPRITE, this.handleDeleteElements);
        }
    }

    update() {}

    addElements(sprites: ISprite[]) {
        for (const sprite of sprites) {
            this._add(sprite);
        }

        this.callEditorCreateElementData(sprites);
    }

    callEditorCreateElementData(sprites: ISprite[]) {
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_CREATE_SPRITE);
        const content: op_editor.OP_CLIENT_REQ_EDITOR_CREATE_SPRITE = pkt.content;
        content.nodeType = sprites[0].nodeType;
        content.sprites = sprites.map((sprite) => sprite.toSprite());
        this.connection.send(pkt);
        Logger.getInstance().log("add sprites: ", content);
    }

    removeEditor(id: number) {
        const ele = this.tryRemove(id);
        if (ele) {
            const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_SPRITE);
            const content: op_editor.IOP_CLIENT_REQ_EDITOR_DELETE_SPRITE = pkt.content;
            content.ids = [id];
            this.connection.send(pkt);
        }
        return ele;
    }

    protected handleCreateElements(packet: PBpacket) {
        if (!this.mRoom.layerManager) {
            Logger.getInstance().error("layer manager does not exist");
            return;
        }
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE = packet.content;
        const objs: op_client.ISprite[] | undefined = content.sprites;
        if (!objs) return;
        const nodeType = content.nodeType;
        if (nodeType !== NodeType.ElementNodeType && nodeType !== NodeType.SpawnPointType) {
            return;
        }
        let point: op_def.IPBPoint3f;
        const displays = [];
        let ele: Element = null;
        for (const obj of objs) {
            point = obj.point3f;
            if (point) {
                ele = this._add(new Sprite(obj, nodeType));
                if (ele.getDisplay()) displays.push(ele.getDisplay());
            }
        }
        this.mRoom.addToSurface(displays);
    }

    protected _add(sprite: ISprite): Element {
        let ele = this.mElements.get(sprite.id);
        if (!ele) ele = new Element(sprite, this);
        ele.setBlockable(false);
        ele.setInputEnable(InputEnable.Enable);
        this.mElements.set(ele.id, ele);
        return ele;
    }

    protected tryRemove(id) {
        const element = this.mElements.get(id);
        if (element) {
            this.mElements.delete(id);
            element.destroy();
            if (this.roomService) {
                this.roomService.blocks.remove(element);
            }
            return element;
        }
    }

    protected handleDeleteElements(packet: PBpacket) {
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_DELETE_SPRITE = packet.content;
        const type: number = content.nodeType;
        const ids: number[] = content.ids;
        if (type !== NodeType.ElementNodeType && type !== NodeType.SpawnPointType) {
            return;
        }
        for (const id of ids) {
            this.tryRemove(id);
        }
        this.roomService.removeSelected();
    }

    protected handleSyncElements(packet: PBpacket) {
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_SYNC_SPRITE = packet.content;
        if (content.nodeType !== op_def.NodeType.ElementNodeType) {
            return;
        }
        const sprites = content.sprites;
        for (const sprite of sprites) {
            this.trySync(sprite);
        }
    }

    protected trySync(sprite: op_client.ISprite) {
        const element = this.mElements.get(sprite.id);
        if (!element) {
            Logger.getInstance().log("can't find element", sprite);
            return;
        }
        const point = sprite.point3f;
        if (point) {
            element.setPosition(new Pos(point.x, point.y, point.z));
        }
        if (sprite.direction) {
            element.setDirection(sprite.direction);
        }
    }

    get roomService(): EditorRoomService {
        return this.mRoom;
    }
}
