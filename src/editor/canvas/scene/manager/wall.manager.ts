import { LayerEnum } from "game-capsule";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_editor, op_def, op_client } from "pixelpai_proto";
import {Direction, IPos, LogicPos, Position45} from "structure";
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
            if (!this.canPut(loc)) continue;
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
            if (loc.dir === Direction.concave) {
                this.removeDuplicate(loc.x, loc.y);
            }
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

    // 在墙面上
    public isInWallRect(pos: IPos): boolean {
        const pos45 = Position45.transformTo45(pos, this.sceneEditor.roomSize);
        // 10的由来：
        // 墙高：12倍地块高度，其中有1倍被藏在地块下，所以可放置区域只有11倍地块高的区域，所以xy范围为[-10, 0]
        let result = false;
        this.walls.forEach((col) => {
            const minX = col.x - 10;
            const maxX = col.x;
            const minY = col.y - 10;
            const maxY = col.y;
            if (pos45.x >= minX && pos45.x <= maxX && pos45.y >= minY && pos45.y <= maxY) {
                result = true;
                return;
            }
        });
        return result;
    }

    // 靠墙，按照miniSize坐标系
    // public isAgainstWall(pos: IPos, originPoint: IPos): boolean {
    //     const pos45 = Position45.transformTo45(pos, this.roomService.miniSize);
    //     const checkPos45 = new LogicPos(pos45.x - originPoint.x, pos45.y - originPoint.y);
    //     for (const wall of this.walls) {
    //         const roomSizePos = wall.model.pos;
    //         const miniSizePoses = [
    //             new LogicPos(roomSizePos.x * 2, roomSizePos.y * 2),
    //             new LogicPos(roomSizePos.x * 2, roomSizePos.y * 2 + 1),
    //             new LogicPos(roomSizePos.x * 2 + 1, roomSizePos.y * 2),
    //             new LogicPos(roomSizePos.x * 2 + 1, roomSizePos.y * 2 + 1)];
    //         if (wall.model.direction === Direction.concave) {
    //             // 凹角的墙会删除相邻阴面阳面的墙，所以这里需要额外判断两块墙体的位置
    //             const yinPos = new LogicPos(roomSizePos.x, roomSizePos.y + 1);
    //             miniSizePoses.push(new LogicPos(yinPos.x * 2, yinPos.y * 2));
    //             miniSizePoses.push(new LogicPos(yinPos.x * 2, yinPos.y * 2 + 1));
    //             miniSizePoses.push(new LogicPos(yinPos.x * 2 + 1, yinPos.y * 2));
    //             miniSizePoses.push(new LogicPos(yinPos.x * 2 + 1, yinPos.y * 2 + 1));
    //             const yangPos = new LogicPos(roomSizePos.x + 1, roomSizePos.y);
    //             miniSizePoses.push(new LogicPos(yangPos.x * 2, yangPos.y * 2));
    //             miniSizePoses.push(new LogicPos(yangPos.x * 2, yangPos.y * 2 + 1));
    //             miniSizePoses.push(new LogicPos(yangPos.x * 2 + 1, yangPos.y * 2));
    //             miniSizePoses.push(new LogicPos(yangPos.x * 2 + 1, yangPos.y * 2 + 1));
    //         }
    //         for (const miniSizePose of miniSizePoses) {
    //             if ((miniSizePose.y === checkPos45.y && (miniSizePose.x === checkPos45.x + 1 || miniSizePose.x === checkPos45.x - 1)) ||
    //                 (miniSizePose.x === checkPos45.x && (miniSizePose.y === checkPos45.y + 1 || miniSizePose.y === checkPos45.y - 1))) {
    //                 return true;
    //             }
    //         }
    //     }
    //
    //     return false;
    // }

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
                    sn:palette.frameModel.type,
                    dir: loc.dir,
                    layer: LayerEnum.Wall
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
                    sn:palette.frameModel.type,
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

    private removeDuplicate(x: number, y: number) {
        // 放置17转角时，检查两边重复墙壁。删除3和5方向
        const locs = [{ x: x + 1, y }, { x, y: y + 1 }];
        const removes = [];
        for (const loc of locs) {
            const l = this.genLocId(loc.x, loc.y);
            const wall = this.walls.get(l);
            if (wall) {
                if (wall.dir === Direction.west_south || wall.dir === Direction.south_east) removes.push(loc);
            }
        }
        if (removes.length > 0) this.removeWalls(removes);
    }

    private canPut(loc) {
        const { x, y, dir } = loc;
        let key = null;
        if (dir === Direction.west_south) {
            key = this.genLocId(x - 1, y );
        } else if (dir === Direction.south_east) {
            key = this.genLocId(x, y - 1);
        }
        if (!key) return true;
        const wall = this.walls.get(key);
        if (!wall) return true;
        return wall.dir !== Direction.concave;
    }

    private genLocId(x: number, y: number) {
        return `${x}_${y}`;
    }
}
