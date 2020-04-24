import { ElementManager, Task } from "./element.manager";
import { PBpacket } from "net-socket-packet";
import { op_editor, op_def, op_client } from "pixelpai_proto";
import { Logger } from "../../utils/log";
import { Pos } from "../../utils/pos";
import { EditorRoomService } from "../editor.room";
import { SelectedElement } from "../editor/selected.element";
import Helpers from "../../utils/helpers";

export class EditorMossManager extends ElementManager {
    private taskQueue: Map<number, Task> = new Map();
    private editorMosses: Map<number, any> = new Map();
    constructor(protected mRoom: EditorRoomService) {
        super(mRoom);
        if (this.connection) {
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_MOSSES, this.handleAddMosses);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_MOSSES, this.handleDeleteMosses);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_SYNC_MOSSES, this.handleUpdateMosses);
        }
    }

    update() {
        this.batchActionSprites();
    }

    public addMosses(coorData) {
        const placeLocs = [];
        const { locs, key } = coorData;
        for (const loc of locs) {
            const id = Helpers.genId();
            const placeLoc: Partial<op_def.IMossMetaData> = {
                x: loc.x,
                y: loc.y,
                z: loc.z,
                key,
                id,
            };
            this.taskQueue.set(id, {
                action: "ADD",
                loc: placeLoc,
            });

            placeLocs.push(placeLoc);
        }

        this.reqEditorCreateMossData(placeLocs);
    }

    reqEditorCreateMossData(locs: op_def.IMossMetaData[]) {
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_CREATE_MOSSES);
        const content: op_editor.OP_CLIENT_REQ_EDITOR_CREATE_MOSSES = pkt.content;
        content.locs = locs;
        this.connection.send(pkt);
    }

    public updateMosses(elements: SelectedElement[]) {
        const updateLocs = [];
        for (const element of elements) {
            const sprite = element.display.element.model.toSprite();

            const originLoc = this.editorMosses.get(sprite.id);
            const loc: op_def.IMossMetaData = {
                x: sprite.point3f.x,
                y: sprite.point3f.y,
                z: sprite.point3f.z,
                id: sprite.id,
                dir: sprite.direction,
                key: originLoc.key,
            };
            this.taskQueue.set(sprite.id, {
                action: "UPDATE",
                loc,
            });

            updateLocs.push(loc);
        }

        this.reqEditorUpdateMossData(updateLocs);
    }

    reqEditorUpdateMossData(locs: op_def.IMossMetaData[]) {
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_SYNC_MOSSES);
        const content: op_editor.OP_CLIENT_REQ_EDITOR_SYNC_MOSSES = pkt.content;
        content.locs = locs;
        this.connection.send(pkt);
    }

    protected handleAddMosses(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_ADD_MOSSES = packet.content;
        const locs = content.locs;

        for (const loc of locs) {
            this.taskQueue.set(loc.id, {
                action: "ADD",
                loc,
            });
        }
    }

    protected handleDeleteMosses(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_DELETE_MOSSES = packet.content;
        const ids = content.ids;

        for (const id of ids) {
            this.taskQueue.set(id, {
                action: "DELETE",
                loc: this.editorMosses.get(id),
            });
        }

        this.roomService.removeSelected();
    }

    protected handleUpdateMosses(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_SYNC_MOSSES = packet.content;
        const locs = content.locs;

        for (const loc of locs) {
            this.taskQueue.set(loc.id, {
                action: "UPDATE",
                loc,
            });
        }
    }

    private batchActionSprites() {
        if (!Array.from(this.taskQueue.keys()).length) {
            return;
        }
        const batchTasksKeys = Array.from(this.taskQueue.keys()).splice(0, 200);

        for (const key of batchTasksKeys) {
            const { action, loc } = this.taskQueue.get(key);
            this.taskQueue.delete(key);

            if (action === "ADD") {
                const moss = this.mRoom.world.elementStorage.getMossPalette(loc.key);
                if (!moss) continue;

                const sprite = moss.createSprite({
                    ...loc,
                    nodeType: op_def.NodeType.ElementNodeType,
                    isMoss: true,
                });
                this.editorMosses.set(loc.id, loc);
                this.mRoom.displayObjectPool.push("mosses", loc.id.toString(), sprite, this);
            } else if (action === "DELETE") {
                if (loc) {
                    this.editorMosses.delete(loc.id);
                    this.mRoom.displayObjectPool.remove("mosses", loc.id.toString());
                }
            } else if (action === "UPDATE") {
                const moss = this.mRoom.world.elementStorage.getMossPalette(loc.key);
                if (!moss) continue;
                const sprite = moss.createSprite({
                    ...loc,
                    nodeType: op_def.NodeType.ElementNodeType,
                    isMoss: true,
                });
                this.editorMosses.set(loc.id, loc);
                this.mRoom.displayObjectPool.update("mosses", loc.id.toString(), sprite);
            }
        }
    }

    get roomService(): EditorRoomService {
        return this.mRoom;
    }
}
