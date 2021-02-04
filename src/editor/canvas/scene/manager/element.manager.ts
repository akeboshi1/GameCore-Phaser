import { Sprite } from "baseModel";
import { LayerEnum } from "game-capsule";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_editor, op_def } from "pixelpai_proto";
import { ISprite } from "structure";
import { IPos, Position45 } from "utils";
import { SceneEditorCanvas } from "../scene.editor.canvas";

export class EditorElementManager extends PacketHandler {
    private taskQueue: Map<number, any> = new Map();
    private mMap: number[][] = [];
    constructor(protected sceneEditor: SceneEditorCanvas) {
        super();
        const connection = this.sceneEditor.connection;
        if (connection) {
            connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_CREATE_SPRITE, this.handleCreateElements);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_SPRITE, this.handleDeleteElements);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_SYNC_SPRITE, this.handleSyncElements);
        }
    }

    init() {
        const size = this.sceneEditor.miniRoomSize;
        this.mMap = new Array(size.rows);
        for (let i = 0; i < this.mMap.length; i++) {
            this.mMap[i] = new Array(size.cols).fill(0);
        }
    }

    update() {
        this.batchActionSprites();
    }

    destroy() {
        const connection = this.sceneEditor.connection;
        if (connection) {
            connection.removePacketListener(this);
        }
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
        this.sceneEditor.connection.send(pkt);
    }

    updateElements(sprites: op_client.ISprite[]) {
        this.callEditorUpdateElementData(sprites);
    }

    callEditorUpdateElementData(sprites: op_client.ISprite[]) {
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_SYNC_SPRITE);
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_SYNC_SPRITE = pkt.content;
        content.sprites = sprites;
        this.sceneEditor.connection.send(pkt);
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

        this.sceneEditor.connection.send(pkt);
    }

    addToMap(sprite: ISprite) {
        if (!sprite) return;
        return this.setMap(sprite, true);
    }

    removeFromMap(sprite: ISprite) {
        if (!sprite) return;
        return this.setMap(sprite, false);
    }

    checkCollision(pos: IPos, sprite: ISprite): boolean {
        if (sprite.layer === LayerEnum.Floor) {
            return true;
        }
        const collision = sprite.getCollisionArea();
        const origin = sprite.getOriginPoint();
        if (!collision) {
            return false;
        }
        const miniSize = this.sceneEditor.miniRoomSize;
        const pos45 = Position45.transformTo45(pos, miniSize);
        const rows = collision.length;
        const cols = collision[0].length;
        let row = 0, col = 0;

        for (let i = 0; i < rows; i++) {
            row = pos45.y + i - origin.y;
            for (let j = 0; j < cols; j++) {
                if (collision[i][j] === 1) {
                    col = pos45.x + j - origin.x;
                    if (row >= 0 && row < this.mMap.length && col >= 0 && col < this.mMap[row].length) {
                        if (this.mMap[row][col] === 1) return false;
                    }
                }
            }
        }
        return true;
    }

    protected handleCreateElements(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_CREATE_SPRITE = packet.content;
        const { sprites, nodeType } = content;

        for (const sprite of sprites) {
            this.taskQueue.set(sprite.id, {
                action: "ADD",
                sprite: new Sprite(sprite,content.nodeType),
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
        if (nodeType !== op_def.NodeType.ElementNodeType && nodeType !== op_def.NodeType.SpawnPointType) {
            return;
        }
        this.sceneEditor.unselectElement();
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

    protected setMap(sprite: ISprite, isAdd: boolean) {
        if (sprite.layer === LayerEnum.Floor) {
            return;
        }
        const collision = sprite.getCollisionArea();
        const origin = sprite.getOriginPoint();
        if (!collision) {
            return;
        }
        const miniSize = this.sceneEditor.miniRoomSize;
        const pos = Position45.transformTo45(sprite.pos, miniSize);
        const rows = collision.length;
        const cols = collision[0].length;
        let row = 0, col = 0;
        let overlap = false;
        for (let i = 0; i < rows; i++) {
            row = pos.y + i - origin.y;
            for (let j = 0; j < cols; j++) {
                if (collision[i][j] === 1) {
                    col = pos.x + j - origin.x;
                    if (row >= 0 && row < this.mMap.length && col >= 0 && col < this.mMap[row].length) {
                        if (isAdd && this.mMap[row][col] === 1) {
                            overlap = true;
                        }
                        this.mMap[row][col] = isAdd ? collision[i][j] : 0;
                    }
                }
            }
        }
        return overlap;
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
                this.sceneEditor.displayObjectPool.push("elements", sprite.id.toString(), sprite, this);
            } else if (action === "DELETE") {
                this.sceneEditor.displayObjectPool.remove("elements", sprite.id.toString());
            } else if (action === "UPDATE") {
                this.sceneEditor.displayObjectPool.update("elements", sprite.id.toString(), sprite);
            }
        }
    }
}
