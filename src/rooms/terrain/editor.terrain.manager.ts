import { TerrainManager } from "./terrain.manager";
import { ISprite, Sprite } from "../element/sprite";
import { PBpacket } from "net-socket-packet";
import { op_client, op_def, op_editor } from "pixelpai_proto";
import { IRoomService, SpriteAddCompletedListener } from "../room";
import { Terrain } from "./terrain";
import { Pos } from "../../utils/pos";
import { Logger } from "../../utils/log";
import { IElement, InputEnable } from "../element/element";
import { DisplayObject } from "../display/display.object";
import { EditorRoomService } from "../editor.room";

export class EditorTerrainManager extends TerrainManager {
    protected taskQueue: Map<string, any> = new Map();
    private mEditorTerrains: Map<string, number> = new Map();
    constructor(room: EditorRoomService, listener?: SpriteAddCompletedListener) {
        super(room, listener);
        if (this.connection) {
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_SPRITES_WITH_LOCS, this.handleAddTerrains);
            this.addHandlerFun(
                op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_SPRITES_WITH_LOCS,
                this.handleDeleteTerrains
            );
        }
    }

    addTerrains(terrainCoorData) {
        const { locs, key } = terrainCoorData;
        const drawLocs = locs.filter((loc) => this.canPut(loc, key));

        for (const loc of drawLocs) {
            const locId = this.genLocId(loc.x, loc.y);
            const oldKey = this.mEditorTerrains.get(locId);
            if (oldKey && oldKey !== key) {
                this.taskQueue.set(locId, {
                    action: "UPDATE",
                    loc: { ...loc, key },
                });
            } else {
                this.taskQueue.set(locId, {
                    action: "ADD",
                    loc: { ...loc, key },
                });
            }
        }

        this.reqEditorAddTerrainsData(drawLocs, key);
    }

    reqEditorAddTerrainsData(locs: op_def.IPBPoint3f[], key) {
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_ADD_TERRAINS);
        const content: op_editor.OP_CLIENT_REQ_EDITOR_ADD_TERRAINS = pkt.content;
        content.locs = locs;
        content.key = key;
        this.connection.send(pkt);
    }

    removeTerrains(locations: Pos[]) {
        for (const pos of locations) {
            const locId = this.genLocId(pos.x, pos.y);

            this.taskQueue.set(locId, {
                action: "DELETE",
                loc: {
                    x: pos.x,
                    y: pos.y,
                },
            });
        }

        this.reqEditorDeleteTerrainsData(locations);
    }

    reqEditorDeleteTerrainsData(loc: Pos[]) {
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_TERRAINS);
        const content: op_editor.OP_CLIENT_REQ_EDITOR_DELETE_TERRAINS = pkt.content;
        content.locs = loc.map((item) => ({ x: item.x, y: item.y, z: item.z }));
        this.connection.send(pkt);
    }

    update() {
        this.batchActionSprites();
    }

    protected handleAddTerrains(packet: PBpacket) {
        if (!this.mRoom.layerManager) {
            Logger.getInstance().error("layer manager does not exist");
            return;
        }

        const content: op_client.IOP_EDITOR_REQ_CLIENT_ADD_SPRITES_WITH_LOCS = packet.content;
        const locs = content.locs;
        const nodeType = content.nodeType;

        if (nodeType !== op_def.NodeType.TerrainNodeType) {
            return;
        }

        for (const loc of locs) {
            const locId = this.genLocId(loc.x, loc.y);

            const oldKey = this.mEditorTerrains.get(locId);
            if (oldKey && oldKey === loc.key) continue;

            this.taskQueue.set(locId, {
                action: "ADD",
                loc,
            });
        }
    }

    protected handleDeleteTerrains(packet: PBpacket) {
        if (!this.mRoom.layerManager) {
            Logger.getInstance().error("layer manager does not exist");
            return;
        }

        const content: op_client.IOP_EDITOR_REQ_CLIENT_ADD_SPRITES_WITH_LOCS = packet.content;
        const locs = content.locs;
        const nodeType = content.nodeType;

        if (nodeType !== op_def.NodeType.TerrainNodeType) {
            return;
        }

        for (const loc of locs) {
            const locId = this.genLocId(loc.x, loc.y);

            this.taskQueue.set(locId, {
                action: "DELETE",
                loc,
            });
        }
    }

    private canPut(pos: op_def.IPBPoint3f, key: number) {
        const locId = this.genLocId(pos.x, pos.y);
        const roomSize = this.roomService.roomSize;
        if (!roomSize) return false;
        if (pos.x < 0 || pos.y < 0 || pos.x >= roomSize.cols || pos.y >= roomSize.rows) {
            return false;
        }
        if (this.mEditorTerrains.get(locId) === key) {
            return false;
        }

        return true;
    }

    private batchActionSprites() {
        if (!Array.from(this.taskQueue.keys()).length) {
            return;
        }

        const batchTasksKeys = Array.from(this.taskQueue.keys()).splice(0, 200);

        for (const key of batchTasksKeys) {
            const { action, loc } = this.taskQueue.get(key);
            const locId = this.genLocId(loc.x, loc.y);

            this.taskQueue.delete(key);

            if (action === "ADD") {
                const palette = this.mRoom.world.elementStorage.getTerrainPalette(loc.key);

                if (!palette) continue;

                const sprite = palette.createSprite({
                    nodeType: op_def.NodeType.TerrainNodeType,
                    x: loc.x,
                    y: loc.y,
                });
                this.mEditorTerrains.set(locId, loc.key);
                (this.mRoom as EditorRoomService).spritePool.push("terrains", locId, sprite, this);
            } else if (action === "DELETE") {
                this.mEditorTerrains.delete(locId);
                (this.mRoom as EditorRoomService).spritePool.remove("terrains", locId);
            } else if (action === "UPDATE") {
                const palette = this.mRoom.world.elementStorage.getTerrainPalette(loc.key);
                if (!palette) continue;

                const sprite = palette.createSprite({
                    nodeType: op_def.NodeType.TerrainNodeType,
                    x: loc.x,
                    y: loc.y,
                });
                this.mEditorTerrains.set(locId, loc.key);
                (this.mRoom as EditorRoomService).spritePool.update("terrains", locId, sprite);
            }
        }
    }

    private genLocId(x: number, y: number) {
        return `${x}_${y}`;
    }
}
