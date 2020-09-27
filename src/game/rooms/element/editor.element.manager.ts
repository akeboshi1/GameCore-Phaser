import { ElementManager } from "./element.manager";
import { ISprite, Sprite } from "./sprite";
import { PBpacket } from "net-socket-packet";
import { op_editor, op_def, op_client } from "pixelpai_proto";
import { Logger } from "../../game/core/utils/log";
import { Pos } from "../../game/core/utils/pos";
import { Element, InputEnable } from "./element";
import NodeType = op_def.NodeType;
import { EditorRoomService } from "../editor.room";
import { DisplayObject } from "../display/display.object";

export class EditorElementManager extends ElementManager {
    private taskQueue: Map<number, any> = new Map();
    constructor(protected mRoom: EditorRoomService) {
        super(mRoom);
        if (this.connection) {
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_CREATE_SPRITE, this.handleCreateElements);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_SPRITE, this.handleDeleteElements);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_SYNC_SPRITE, this.handleSyncElements);
        }
    }

    update() {
        this.batchActionSprites();
    }

    addElements(sprites: ISprite[]) {
        for (const sprite of sprites) {
            this.taskQueue.set(sprite.id, {
                action: "ADD",
                sprite,
            });
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

    updateElements(sprites: op_client.ISprite[]) {
        this.callEditorUpdateElementData(sprites);
    }

    callEditorUpdateElementData(sprites: op_client.ISprite[]) {
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_SYNC_SPRITE);
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_SYNC_SPRITE = pkt.content;
        content.sprites = sprites;
        this.connection.send(pkt);
    }

    // removeEditor(id: number) {
    //     const ele = this.tryRemove(id);
    //     if (ele) {
    //         const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_SPRITE);
    //         const content: op_editor.IOP_CLIENT_REQ_EDITOR_DELETE_SPRITE = pkt.content;
    //         content.ids = [id];
    //         this.connection.send(pkt);
    //     }
    //     return ele;
    // }
    deleteElements(ids: number[]) {
        for (const id of ids) {
            this.taskQueue.set(id, {
                action: "DELETE",
                sprite: { id },
            });
        }

        this.callEditorDeleteElementData(ids);
    }

    callEditorDeleteElementData(ids: number[]) {
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_SPRITE);
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_DELETE_SPRITE = pkt.content;
        content.ids = ids;
        content.nodeType = op_def.NodeType.ElementNodeType;

        this.connection.send(pkt);
    }

    protected handleCreateElements(packet: PBpacket) {
        if (!this.mRoom.layerManager) {
            Logger.getInstance().error("layer manager does not exist");
            return;
        }
        const content: op_client.IOP_EDITOR_REQ_CLIENT_CREATE_SPRITE = packet.content;
        const { sprites, nodeType } = content;

        for (const sprite of sprites) {
            this.taskQueue.set(sprite.id, {
                action: "ADD",
                sprite: new Sprite(sprite),
            });
        }

        // if (!sprites) return;
        // if (nodeType !== NodeType.ElementNodeType && nodeType !== NodeType.SpawnPointType) {
        //     return;
        // }
        // let point: op_def.IPBPoint3f;
        // const displays = [];
        // let ele: Element = null;
        // for (const sprite of sprites) {
        //     point = sprite.point3f;
        //     if (point) {
        //         ele = this._add(new Sprite(sprite, nodeType));
        //         if (ele.getDisplay()) displays.push(ele.getDisplay());
        //     }
        // }
        // this.mRoom.addToSurface(displays);
    }

    protected handleDeleteElements(packet: PBpacket) {
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_DELETE_SPRITE = packet.content;
        const { ids, nodeType } = content;
        if (nodeType !== NodeType.ElementNodeType && nodeType !== NodeType.SpawnPointType) {
            return;
        }
        // for (const id of ids) {
        //     this.tryRemove(id);
        // }
        // this.roomService.removeSelected();
        for (const id of ids) {
            this.taskQueue.set(id, {
                action: "DELETE",
                sprite: { id },
            });
        }

        this.roomService.removeSelected();
    }

    protected handleSyncElements(packet: PBpacket) {
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_SYNC_SPRITE = packet.content;
        const { sprites } = content;
        if (content.nodeType !== op_def.NodeType.ElementNodeType) {
            return;
        }
        for (const sprite of sprites) {
            // this.trySync(sprite);
            this.taskQueue.set(sprite.id, {
                action: "UPDATE",
                sprite: new Sprite(sprite),
            });
        }
    }

    // protected _add(sprite: ISprite): Element {
    //     let ele = this.mElements.get(sprite.id);
    //     if (!ele) ele = new Element(sprite, this);
    //     ele.setBlockable(false);
    //     ele.setRenderable(true);
    //     ele.setInputEnable(InputEnable.Enable);
    //     this.mElements.set(ele.id, ele);
    //     return ele;
    // }

    // protected tryRemove(id) {
    //     const element = this.mElements.get(id);
    //     if (element) {
    //         this.mElements.delete(id);
    //         element.destroy();
    //         if (this.roomService) {
    //             this.roomService.blocks.remove(element);
    //         }
    //         return element;
    //     }
    // }

    // protected trySync(sprite: op_client.ISprite) {
    //     const element = this.mElements.get(sprite.id);
    //     if (!element) {
    //         Logger.getInstance().log("can't find element", sprite);
    //         return;
    //     }
    //     const point = sprite.point3f;
    //     if (point) {
    //         element.setPosition(new Pos(point.x, point.y, point.z));
    //     }
    //     if (sprite.direction) {
    //         element.setDirection(sprite.direction);
    //     }
    // }

    private batchActionSprites() {
        if (!Array.from(this.taskQueue.keys()).length) {
            return;
        }

        const batchTasksKeys = Array.from(this.taskQueue.keys()).splice(0, 200);

        for (const key of batchTasksKeys) {
            const { action, sprite } = this.taskQueue.get(key);
            this.taskQueue.delete(key);

            if (action === "ADD") {
                this.mRoom.displayObjectPool.push("elements", sprite.id.toString(), sprite, this);
            } else if (action === "DELETE") {
                this.mRoom.displayObjectPool.remove("elements", sprite.id.toString());
            } else if (action === "UPDATE") {
                this.mRoom.displayObjectPool.update("elements", sprite.id.toString(), sprite);
            }
        }
    }

    get roomService(): EditorRoomService {
        return this.mRoom;
    }
}
