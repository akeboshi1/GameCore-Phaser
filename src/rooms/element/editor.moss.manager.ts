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

export class EditorMossManager extends ElementManager {
    private taskQueue: Map<string, any> = new Map();
    private editorMosses: Map<string, any> = new Map();
    constructor(protected mRoom: EditorRoomService) {
        super(mRoom);
        if (this.connection) {
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_MOSSES, this.addMosses);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_MOSSES, this.removeMosses);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_MOSSES, this.removeMosses);
        }
    }

    update() {
        this.batchActionSprites();
    }

    protected addMosses(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_ADD_MOSSES = packet.content;
        const locs = content.locs;

        for (const loc of locs) {
            const locKey = this.genLocKey(loc.x, loc.y);
            const key = `${locKey}#${loc.key}`;
            this.taskQueue.set(key, {
                action: "ADD",
                loc,
            });
        }
    }

    protected removeMosses(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_MOSSES = packet.content;
        const locs = content.locs;

        for (const loc of locs) {
            const locKey = this.genLocKey(loc.x, loc.y);
            const key = `${locKey}#${loc.key}`;

            this.taskQueue.set(key, {
                action: "DELETE",
                loc,
            });
        }
    }

    protected syncMosses(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_MOSSES = packet.content;
        const locs = content.locs;

        for (const loc of locs) {
            const locKey = this.genLocKey(loc.x, loc.y);
            const key = `${locKey}#${loc.key}`;

            this.taskQueue.set(key, {
                action: "SYNC",
                loc,
            });
        }
    }

    protected createMoss(sprite: ISprite): Element {
        const mossKey = this.genLocKey(sprite.pos.x, sprite.pos.y);

        let moss = this.editorMosses.get(mossKey);

        if (moss) return moss;

        moss = new Element(sprite, this);
        moss.setBlockable(false);
        moss.setInputEnable(InputEnable.Enable);
        this.editorMosses.set(mossKey, moss);
        return moss;
    }

    protected tryRemove(id) {
        const moss = this.editorMosses.get(id);
        if (moss) {
            this.editorMosses.delete(id);
            moss.destroy();
            return moss;
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

    private batchActionSprites() {
        if (!Array.from(this.taskQueue.keys()).length) {
            return;
        }
        const batchTasksKeys = Array.from(this.taskQueue.keys()).splice(0, 200);

        const displays: DisplayObject[] = [];

        for (const key of batchTasksKeys) {
            const { action, loc } = this.taskQueue.get(key);
            this.taskQueue.delete(key);

            if (action === "ADD") {
                const moss = this.mRoom.world.elementStorage.getMossPalette(loc.key);
                if (!moss) {
                    return;
                }

                const ele = this.createMoss(moss.createSprite(op_def.NodeType.ElementNodeType, loc.x, loc.y));
                if (ele.getDisplay()) {
                    displays.push(ele.getDisplay());
                }
                continue;
            }

            if (action === "DELETE") {
                const locKey = this.genLocKey(loc.x, loc.y);
                this.tryRemove(locKey);
                continue;
            }
        }

        if (displays.length > 0) {
            this.mRoom.addToSurface(displays);
        }
    }

    private genLocKey(x: number, y: number) {
        return `${x}_${y}`;
    }

    get roomService(): EditorRoomService {
        return this.mRoom;
    }
}
