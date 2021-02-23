import { LayerEnum } from "game-capsule";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_editor, op_def, op_client } from "pixelpai_proto";
import { IPos } from "utils";
import { SceneEditorCanvas } from "../scene.editor.canvas";

export class EditorWallManager extends PacketHandler {
    protected taskQueue: Map<string, any> = new Map();
    private walls: Map<string, any> = new Map();

    constructor(protected sceneEditor: SceneEditorCanvas) {
        super();
        const connection = this.sceneEditor.connection;
        if (connection) {
            connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_SPRITES_WITH_LOCS, this.handleCreateWalls);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_SPRITES_WITH_LOCS, this.handleDeleteWalls);
        }
    }

    update() {
        this.batchActionSprites();
    }

    addWalls(terrainCoorData) {
        const { locs, key } = terrainCoorData;
        const drawLocs = locs.filter((loc) => this.exist(loc, key));
        const placeLocs = [];
        for (const loc of drawLocs) {
            const locId = this.genLocId(loc.x, loc.y);
            const placeLoc = {
                ...loc,
                key,
                id: 0
            };
            const oldWall = this.walls.get(locId);
            if (oldWall && oldWall.key !== key) {
                this.taskQueue.set(locId, {
                    action: "UPDATE",
                    loc: placeLoc,
                });
            } else {
                this.taskQueue.set(locId, {
                    action: "ADD",
                    loc:placeLoc,
                });
            }
            placeLocs.push(placeLoc);
        }

        this.reqEditorAddTerrainsData(placeLocs);
    }

    removeWalls(locations: IPos[]) {
        const removeWalls = [];
        for (const pos of locations) {
            const locId = this.genLocId(pos.x, pos.y);
            const wall = this.walls.get(locId);
            if (!wall) {
                continue;
            }
            removeWalls.push(wall);
            this.taskQueue.set(locId, {
                action: "DELETE",
                loc: {
                    x: pos.x,
                    y: pos.y,
                },
            });
        }

        if (removeWalls.length > 0) this.reqEditorDeleteTerrainsData(removeWalls);
    }

    private handleCreateWalls(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_ADD_SPRITES_WITH_LOCS = packet.content;
        const { locs, nodeType } = content;
        if (nodeType !== op_def.NodeType.WallNodeType) {
            return;
        }
        for (const loc of locs) {
            const locId = this.genLocId(loc.x, loc.y);
            const placeLoc = {
                ...loc,
                key: loc.key,
                id: loc.id
            };
            this.taskQueue.set(locId, {
                action: "ADD",
                loc: placeLoc,
            });
        }
    }

    private handleDeleteWalls(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_DELETE_SPRITES_WITH_LOCS = packet.content;
        const { locs, nodeType } = content;
        if (nodeType !== op_def.NodeType.WallNodeType) {
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
                const palette = this.sceneEditor.elementStorage.getMossPalette(loc.key);
                if (!palette) continue;

                const sprite = palette.frameModel.createSprite({
                    nodeType: op_def.NodeType.WallNodeType,
                    x: loc.x,
                    y: loc.y,
                    z: 0,
                    dir: loc.dir,
                    layer: LayerEnum.Terrain
                });
                this.walls.set(locId, loc);
                this.sceneEditor.displayObjectPool.push("walls", locId, sprite);
            } else if (action === "DELETE") {
                this.walls.delete(locId);
                this.sceneEditor.displayObjectPool.remove("walls", locId);
            } else if (action === "UPDATE") {
                const palette = this.sceneEditor.elementStorage.getMossPalette(loc.key);
                if (!palette) continue;

                const sprite = palette.frameModel.createSprite({
                    nodeType: op_def.NodeType.WallNodeType,
                    x: loc.x,
                    y: loc.y,
                    z: 0,
                    dir: loc.dir,
                    layer: palette.layer
                });
                this.walls.set(locId, loc);
                this.sceneEditor.displayObjectPool.update("walls", locId, sprite);
            }
        }
    }

    private reqEditorAddTerrainsData(locs) {
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_CREATE_WALLS);
        const content: op_editor.OP_CLIENT_REQ_EDITOR_CREATE_WALLS = pkt.content;
        content.locs = locs;
        // content.key = key;
        this.sceneEditor.connection.send(pkt);
    }

    private reqEditorDeleteTerrainsData(loc) {
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_WALLS);
        const content: op_editor.OP_CLIENT_REQ_EDITOR_DELETE_WALLS = pkt.content;
        content.locs = loc;
        this.sceneEditor.connection.send(pkt);
    }

    private exist(pos: op_def.IPBPoint3f, key: number) {
        const locId = this.genLocId(pos.x, pos.y);
        const roomSize = this.sceneEditor.roomSize;
        if (!roomSize) return false;
        if (pos.x < 0 || pos.y < 0 || pos.x >= roomSize.cols || pos.y >= roomSize.rows) {
            return false;
        }
        const oldWall = this.walls.get(locId);
        if (oldWall && oldWall.key === key) {
            return false;
        }

        return true;
    }

    private genLocId(x: number, y: number) {
        return `${x}_${y}`;
    }
}
