import { TerrainManager } from "./terrain.manager";
import { ISprite } from "../element/sprite";
import { PBpacket } from "net-socket-packet";
import { op_client, op_def, op_editor } from "pixelpai_proto";
import { IRoomService, SpriteAddCompletedListener } from "../room";
import { Terrain } from "./terrain";
import { Pos } from "../../utils/pos";
import { Logger } from "../../utils/log";
import { IElement, InputEnable } from "../element/element";
import { DisplayObject } from "../display/display.object";

export class EditorTerrainManager extends TerrainManager {
    private mEditorTerrains: Map<string, Terrain> = new Map();
    constructor(room: IRoomService, listener?: SpriteAddCompletedListener) {
        super(room, listener);
        if (this.connection) {
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_CREATE_SPRITE, this.onAdd);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_SYNC_SPRITE, this.onSync);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_SPRITE, this.onRemove);

            // NEW PROTO
            this.addHandlerFun(
                op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITES_WITH_LOCS,
                this.addSpritesWithLocs
            );
            this.addHandlerFun(
                op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_SPRITES_WITH_LOCS,
                this.removeSpritesWithLocs
            );
        }
    }

    add(sprites: ISprite[]) {
        const clientSprites = [];
        for (const sprite of sprites) {
            if (!this.canPut(sprite)) {
                continue;
            }
            this._add(sprite);
            clientSprites.push(sprite.toSprite());
        }
        if (clientSprites.length === 0) return;

        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_CREATE_SPRITE);
        const content: op_editor.OP_CLIENT_REQ_EDITOR_CREATE_SPRITE = pkt.content;
        content.nodeType = op_def.NodeType.TerrainNodeType;
        content.sprites = clientSprites;
        this.connection.send(pkt);
    }

    callEditorDeleteTerrainsData(loc: Pos[]) {
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_TERRAINS);
        const content: op_editor.OP_CLIENT_REQ_EDITOR_DELETE_TERRAINS = pkt.content;
        content.locs = loc.map((item) => ({ x: item.x, y: item.y, z: item.z }));
        content.nodeType = op_def.NodeType.TerrainNodeType;
        this.connection.send(pkt);
    }

    removeByPositions(locations: Pos[]) {
        for (const pos of locations) {
            const key = this.genTerrainLocKey(pos.x, pos.y);

            this.actionSpritesCache.set(key, {
                action: "DELETE",
                loc: {
                    x: pos.x,
                    y: pos.y,
                },
            });
        }

        this.callEditorDeleteTerrainsData(locations);
    }

    update() {
        this.batchActionSprites();
    }

    protected addSpritesWithLocs(packet: PBpacket) {
        if (!this.mRoom.layerManager) {
            Logger.getInstance().error("layer manager does not exist");
            return;
        }

        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITES_WITH_LOCS = packet.content;
        const locs = content.locs;
        const nodeType = content.nodeType;

        if (nodeType !== op_def.NodeType.TerrainNodeType) {
            return;
        }

        for (const loc of locs) {
            const locKey = this.genTerrainLocKey(loc.x, loc.y);
            const key = `${locKey}#${loc.key}`;

            this.actionSpritesCache.set(key, {
                action: "ADD",
                loc,
            });
        }
    }

    protected removeSpritesWithLocs(packet: PBpacket) {
        if (!this.mRoom.layerManager) {
            Logger.getInstance().error("layer manager does not exist");
            return;
        }

        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITES_WITH_LOCS = packet.content;
        const locs = content.locs;
        const nodeType = content.nodeType;

        if (nodeType !== op_def.NodeType.TerrainNodeType) {
            return;
        }

        for (const loc of locs) {
            const locKey = this.genTerrainLocKey(loc.x, loc.y);
            const key = `${locKey}#${loc.key}`;

            this.actionSpritesCache.set(key, {
                action: "DELETE",
                loc,
            });
        }
    }

    protected _add(sprite: ISprite, paletteKey?: number) {
        const terrainKey = this.genTerrainLocKey(sprite.pos.x, sprite.pos.y);

        let terrain = this.mEditorTerrains.get(terrainKey);

        if (terrain) {
            return terrain;
        }
        terrain = new Terrain(sprite, this);
        terrain.setBlockable(false);
        terrain.setRenderable(true);

        if (paletteKey) {
            (terrain as any).paletteKey = paletteKey;
        }

        this.mEditorTerrains.set(terrainKey, terrain);
        this.mTerrains.set(terrain.id, terrain);
        return terrain;
    }

    protected onRemove(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_SPRITE = packet.content;
        const type: number = content.nodeType;
        const ids: number[] = content.ids;
        if (type !== op_def.NodeType.TerrainNodeType) {
            return;
        }
        for (const id of ids) {
            const pos = this.mTerrains.get(id).getPosition();
            const key = this.genTerrainLocKey(pos.x, pos.y);
            this.tryRemove(key);
        }
    }

    protected onSync(packet: PBpacket) {
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_SYNC_SPRITE = packet.content;
        if (content.nodeType !== op_def.NodeType.TerrainNodeType) {
            return;
        }
        const sprites = content.sprites;
        for (const sprite of sprites) {
            this.trySync(sprite);
        }
    }

    protected trySync(sprite: op_client.ISprite) {
        const key = this.genTerrainLocKey(sprite.point3f.x, sprite.point3f.y);
        const terrain = this.mEditorTerrains.get(key);
        if (!terrain) {
            Logger.getInstance().log("can't find terrain", sprite);
            return;
        }
        const point = sprite.point3f;
        if (point) {
            terrain.setPosition(new Pos(point.x, point.y, point.z));
        }
    }

    protected removeMap(sprite: ISprite) {}

    protected addMap(sprite: ISprite) {}

    private tryRemove(key: string): Terrain {
        const terrain = this.mEditorTerrains.get(key);
        if (terrain) {
            this.mEditorTerrains.delete(key);
            terrain.destroy();
            if (this.roomService) {
                this.roomService.blocks.remove(terrain);
            }
            return terrain;
        }
    }

    private canPut(sprite: ISprite) {
        const pos = sprite.pos;
        const roomSize = this.roomService.roomSize;
        if (!roomSize) return false;
        if (pos.x < 0 || pos.y < 0 || pos.x >= roomSize.cols || pos.y >= roomSize.rows) {
            return false;
        }
        const terrains = Array.from(this.mEditorTerrains.values());
        for (const ter of terrains) {
            const pos45 = ter.getPosition45();
            if (sprite.pos.equal(pos45)) {
                if (sprite.bindID !== ter.model.bindID) {
                    // 编辑器判断重叠地块
                    // this.removeEditor(ter.id);
                    return true;
                }
                return false;
            }
        }
        return true;
    }

    private batchActionSprites() {
        if (!Array.from(this.actionSpritesCache.keys()).length) {
            return;
        }
        const batchLocsKeys = Array.from(this.actionSpritesCache.keys()).splice(0, 200);

        const displays: DisplayObject[] = [];

        for (const key of batchLocsKeys) {
            const { action, loc } = this.actionSpritesCache.get(key);
            this.actionSpritesCache.delete(key);

            if (action === "ADD") {
                const palette = this.mRoom.world.elementStorage.getTerrainPalette(loc.key);

                if (!palette) {
                    continue;
                }
                const ele = this._add(palette.createSprite(op_def.NodeType.TerrainNodeType, loc.x, loc.y), loc.key);
                if (ele.getDisplay()) {
                    displays.push(ele.getDisplay());
                }
                continue;
            }

            if (action === "DELETE") {
                const locKey = this.genTerrainLocKey(loc.x, loc.y);
                this.tryRemove(locKey);
                continue;
            }
        }

        if (displays.length > 0) {
            this.mRoom.addToGround(displays);
        }
    }

    private genTerrainLocKey(x, y) {
        return `${x}_${y}`;
    }
}
