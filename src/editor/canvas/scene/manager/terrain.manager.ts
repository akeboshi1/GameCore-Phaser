import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_def, op_client, op_editor } from "pixelpai_proto";
import { ThreeSliceButton } from "src/render/ui";
import { IPos } from "utils";
import { SceneEditorCanvas } from "../scene.editor.canvas";

export class EditorTerrainManager extends PacketHandler {
    protected taskQueue: Map<string, any> = new Map();
    private mEditorTerrains: Map<string, number> = new Map();
    constructor(protected sceneEditor: SceneEditorCanvas) {
        super();
        const connection = this.sceneEditor.connection;
        if (connection) {
            connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_SPRITES_WITH_LOCS, this.handleAddTerrains);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_SPRITES_WITH_LOCS,
                this.handleDeleteTerrains
            );
        }
    }

    destroy() {
        const connection = this.sceneEditor.connection;
        if (connection) {
            connection.removePacketListener(this);
        }
    }

    addTerrains(terrainCoorData) {
        const { locs, key } = terrainCoorData;
        const drawLocs = locs.filter((loc) => this.exist(loc, key));

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
        this.sceneEditor.connection.send(pkt);
    }

    removeTerrains(locations: IPos[]) {
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

    reqEditorDeleteTerrainsData(loc: IPos[]) {
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_TERRAINS);
        const content: op_editor.OP_CLIENT_REQ_EDITOR_DELETE_TERRAINS = pkt.content;
        content.locs = loc.map((item) => ({ x: item.x, y: item.y, z: item.z }));
        this.sceneEditor.connection.send(pkt);
    }

    update() {
        this.batchActionSprites();
    }

    addToMap() {
    }

    removeFromMap() {
    }

    existTerrain(x: number, y: number) {
        const locId = this.genLocId(x, y);
        return this.mEditorTerrains.has(locId);
    }

    protected handleAddTerrains(packet: PBpacket) {
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

    private exist(pos: op_def.IPBPoint3f, key: number) {
        const locId = this.genLocId(pos.x, pos.y);
        const roomSize = this.sceneEditor.roomSize;
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
                const palette = this.sceneEditor.elementStorage.getTerrainPalette(loc.key);
                if (!palette) continue;

                const sprite = palette.createSprite({
                    nodeType: op_def.NodeType.TerrainNodeType,
                    x: loc.x,
                    y: loc.y,
                    z: 0
                });
                this.mEditorTerrains.set(locId, loc.key);
                this.sceneEditor.displayObjectPool.push("terrains", locId, sprite);
            } else if (action === "DELETE") {
                this.mEditorTerrains.delete(locId);
                this.sceneEditor.displayObjectPool.remove("terrains", locId);
            } else if (action === "UPDATE") {
                const palette = this.sceneEditor.elementStorage.getTerrainPalette(loc.key);
                if (!palette) continue;

                const sprite = palette.createSprite({
                    nodeType: op_def.NodeType.TerrainNodeType,
                    x: loc.x,
                    y: loc.y,
                    z: 0
                });
                this.mEditorTerrains.set(locId, loc.key);
                this.sceneEditor.displayObjectPool.update("terrains", locId, sprite);
            }
        }
    }

    private genLocId(x: number, y: number) {
        return `${x}_${y}`;
    }
}
