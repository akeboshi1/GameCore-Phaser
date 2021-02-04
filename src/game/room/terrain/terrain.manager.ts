import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import { Terrain } from "./terrain";
import { IElementManager } from "../element/element.manager";
import { IElement } from "../element/element";
import NodeType = op_def.NodeType;
import { IRoomService, Room, SpriteAddCompletedListener } from "../room/room";
import { ISprite } from "structure";
import { ConnectionService } from "lib/net/connection.service";
import { IFramesModel } from "structure";
import { IDragonbonesModel } from "structure";
import { EmptyTerrain } from "./empty.terrain";
import { IPos, Logger, LogicPos } from "utils";
import { IElementStorage, Sprite } from "baseModel";
export class TerrainManager extends PacketHandler implements IElementManager {
    public hasAddComplete: boolean = false;
    protected mTerrains: Map<number, Terrain> = new Map<number, Terrain>();
    protected mGameConfig: IElementStorage;
    // add by 7 ----
    protected mPacketFrameCount: number = 0;
    protected mListener: SpriteAddCompletedListener;
    // ---- by 7
    protected mMap: number[][];
    private mEmptyMap: EmptyTerrain[][];
    private mDirty: boolean = false;

    constructor(protected mRoom: IRoomService, listener?: SpriteAddCompletedListener) {
        super();
        this.mListener = listener;
        if (this.connection) {
            this.connection.addPacketListener(this);

            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE, this.onAdd);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE_END, this.addComplete);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_SPRITE, this.onRemove);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_SPRITE, this.onSyncSprite);
            this.addHandlerFun(
                op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_CHANGE_SPRITE_ANIMATION,
                this.onChangeAnimation
            );
        }
        if (this.mRoom) {
            this.mGameConfig = this.mRoom.game.elementStorage;
        }

        const miniSize = this.roomService.miniSize;
        this.mMap = new Array(miniSize.rows);
        for (let i = 0; i < miniSize.rows; i++) {
            this.mMap[i] = new Array(miniSize.cols).fill(0);
        }
    }

    public init() {
        const roomSize = this.roomService.roomSize;
        this.mEmptyMap = new Array(roomSize.cols);
        for (let i = 0; i < roomSize.cols; i++) {
            this.mEmptyMap[i] = new Array(roomSize.rows);
            for (let j = 0; j < roomSize.rows; j++) {
                this.addEmpty(this.roomService.transformTo90(new LogicPos(i, j)));
            }
        }
    }

    public update(time: number, delta: number) {
        if (this.mDirty) {
            const len = this.mEmptyMap.length;
            for (let i: number = 0; i < len; i++) {
                const tmpList = this.mEmptyMap[i];
                const tmpLen: number = tmpList.length;
                for (let j: number = 0; j < tmpLen; j++) {
                    const terrain = tmpList[j];
                    if (terrain && terrain.dirty) {
                        this.mEmptyMap[i][j] = undefined;
                        terrain.destroy();
                    }
                }
            }
            this.mDirty = false;
        }
    }

    public destroy() {
        if (this.connection) {
            this.connection.removePacketListener(this);
        }
        if (!this.mTerrains) return;
        this.mTerrains.forEach((terrain) => this.remove(terrain.id));
        this.mTerrains.clear();
    }

    public get(id: number): Terrain {
        const terrain: Terrain = this.mTerrains.get(id);
        if (!terrain) {
            return;
        }
        return terrain;
    }

    public add(sprites: ISprite[]) {
        for (const sprite of sprites) {
            this._add(sprite);
        }
    }

    public remove(id: number): IElement {
        if (!this.mTerrains) return;
        const terrain = this.mTerrains.get(id);
        if (terrain) {
            this.mTerrains.delete(id);
            terrain.destroy();
        }
        return terrain;
    }

    public addToMap(sprite: ISprite) {
        if (!sprite) return;
        const collision = sprite.getCollisionArea();
        let walkable = sprite.getWalkableArea();
        const origin = sprite.getOriginPoint();
        if (!collision || !walkable) {
            return;
        }
        let rows = collision.length;
        let cols = collision[0].length;
        const { x, y } = sprite.pos;
        const pos = this.mRoom.transformTo45(new LogicPos(x, y));
        // terrain pos为60*30大格子
        pos.x *= 2;
        pos.y *= 2;
        if (!walkable) {
            walkable = new Array(rows);
            for (let i = 0; i < rows; i++) {
                walkable[i] = new Array(cols).fill(0);
            }
        }
        if (rows === 1 && cols === 1) {
            rows = 2;
            cols = 2;
        }
        let row = 0;
        let col = 0;
        for (let i = 0; i < rows; i++) {
            row = pos.y + i - origin.y;
            for (let j = 0; j < cols; j++) {
                col = pos.x + j - origin.x;
                if (row >= 0 && row < this.mMap.length && col >= 0 && col < this.mMap[row].length) {
                    if (collision.length > i && collision[i][j] === 1) {
                        this.mMap[row][col] = walkable[i][j];
                    } else {
                        this.mMap[row][col] = 1;
                    }
                    (<Room>this.roomService).setTerrainWalkable(row, col, this.mMap[row][col] === 1);
                }
            }
        }
    }

    public removeFromMap(sprite: ISprite) {
        if (!sprite) return;
        this.resetWalkable(sprite);
    }

    public resetWalkable(sprite: ISprite) {
        const collision = sprite.getCollisionArea();
        const walkable = sprite.getWalkableArea();
        const origin = sprite.getOriginPoint();
        if (!collision || !walkable) {
            return;
        }
        let rows = collision.length;
        let cols = collision[0].length;
        // const pos = sprite.pos;
        const { x, y } = sprite.pos;
        const pos = new LogicPos(x, y);
        // terrain pos为60*30大格子
        pos.x *= 2;
        pos.y *= 2;
        if (rows === 1 && cols === 1) {
            rows = 2;
            cols = 2;
        }
        let row = 0;
        let col = 0;
        for (let i = 0; i < rows; i++) {
            row = pos.y + i - origin.y;
            for (let j = 0; j < cols; j++) {
                col = pos.x + j - origin.x;
                if (row >= 0 && row < this.mMap.length && col >= 0 && col < this.mMap[row].length) {
                    this.mMap[row][col] = 0;
                    (<Room>this.roomService).setTerrainWalkable(row, col, false);
                }
            }
        }
    }

    public getElements(): IElement[] {
        return Array.from(this.mTerrains.values());
    }

    public onDisplayCreated(id: number) {
    }
    public onDisplayRemoved(id: number) {
    }

    protected onAdd(packet: PBpacket) {
        this.mPacketFrameCount++;
        if (!this.mGameConfig) {
            return;
        }
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE = packet.content;
        const sprites = content.sprites;
        const type = content.nodeType;
        const pf: op_def.IPacket = content.packet;

        if (type !== op_def.NodeType.TerrainNodeType) {
            return;
        }

        let point: op_def.IPBPoint3f;
        const ids = [];
        // sprites 服务端
        for (const sprite of sprites) {
            point = sprite.point3f;
            this.removeEmpty(new LogicPos(point.x, point.y));
            if (point) {
                const s = new Sprite(sprite, type);
                if (!s.displayInfo) {
                    this.checkTerrainDisplay(s);
                }
                if (!s.displayInfo) {
                    ids.push(s.id);
                }
                this._add(s);
            }
        }
        this.fetchDisplay(ids);

        if (this.mListener && this.mPacketFrameCount === pf.totalFrame) {
            this.mListener.onFullPacketReceived(type);
        }
    }

    protected _add(sprite: ISprite): Terrain {
        let terrain = this.mTerrains.get(sprite.id);
        if (!terrain) {
            terrain = new Terrain(sprite, this);
        } else {
            terrain.model = sprite;
        }
        // this.addMap(sprite);
        this.mTerrains.set(terrain.id || 0, terrain);
        return terrain;
    }

    protected addComplete(packet: PBpacket) {
        this.hasAddComplete = true;
    }

    protected onRemove(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_DELETE_SPRITE = packet.content;
        const type: number = content.nodeType;
        const ids: number[] = content.ids;
        if (type !== op_def.NodeType.TerrainNodeType) {
            return;
        }
        for (const id of ids) {
            const terrain = this.remove(id);
            if (terrain) {
                this.addEmpty(terrain.model.pos);
            }
        }
        // Logger.getInstance().debug("remove terrain length: ", ids.length);
    }

    protected onSyncSprite(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_SYNC_SPRITE = packet.content;
        if (content.nodeType !== op_def.NodeType.TerrainNodeType) {
            return;
        }
        let terrain: Terrain = null;
        const sprites = content.sprites;
        for (const sprite of sprites) {
            terrain = this.get(sprite.id);
            if (terrain) {
                const sp = new Sprite(sprite, content.nodeType);
                terrain.model = sp;
                // this.addMap(sp);
                // terrain.setRenderable(true);
            }
        }
    }

    protected checkDisplay(sprite: ISprite): IFramesModel | IDragonbonesModel {
        if (!sprite.displayInfo) {
            const displayInfo = this.roomService.game.elementStorage.getDisplayModel(sprite.bindID || sprite.id);
            if (displayInfo) {
                sprite.setDisplayInfo(displayInfo);
                return displayInfo;
            }
        }
    }

    protected checkTerrainDisplay(sprite: ISprite) {
        if (!sprite.displayInfo) {
            const palette = this.roomService.game.elementStorage.getTerrainPaletteByBindId(sprite.bindID);
            if (palette) {
                sprite.setDisplayInfo(palette);
            }
        }
    }

    protected fetchDisplay(ids: number[]) {
        if (ids.length === 0) {
            return;
        }
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_REQ_VIRTUAL_WORLD_QUERY_SPRITE_RESOURCE);
        const content: op_virtual_world.IOP_REQ_VIRTUAL_WORLD_QUERY_SPRITE_RESOURCE = packet.content;
        content.ids = ids;
        this.connection.send(packet);
    }

    protected removeMap(sprite: ISprite) {
        this.setMap(sprite, 1);
    }

    protected addMap(sprite: ISprite) {
        this.setMap(sprite, 0);
    }

    protected setMap(sprite: ISprite, type: number) {
        const displayInfo = sprite.displayInfo;
        if (!displayInfo) {
            return;
        }
        const curAni = sprite.currentAnimation;
        // const aniName = curAni.name;
        // const flip = false;
        // const collisionArea = displayInfo.getCollisionArea(aniName, flip);
        // const walkArea = displayInfo.getWalkableArea(aniName, flip);
        // const origin = displayInfo.getOriginPoint(aniName, flip);
        // let rows = collisionArea.length;
        // let cols = collisionArea[0].length;
        // let hasCollisionArea = true;
        // if (rows === 1 && cols === 1) {
        //     rows = 2;
        //     cols = 2;
        //     hasCollisionArea = false;
        // }
        // const pos = sprite.pos;
        // for (let i = 0; i < rows; i++) {
        //     for (let j = 0; j < cols; j++) {
        //         // if ((!hasCollisionArea) || collisionArea[i][j] === 1 && walkArea[i][j] === 1) {
        //         // this.mMap[pos.x + i - origin.x][pos.y + j - origin.y] = type;
        //         // }
        //     }
        // }
    }

    protected onChangeAnimation(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_CHANGE_SPRITE_ANIMATION = packet.content;
        if (content.nodeType !== NodeType.TerrainNodeType) {
            return;
        }
        const anis = content.changeAnimation;
        const ids = content.ids;
        let terrain: Terrain = null;
        for (const id of ids) {
            terrain = this.get(id);
            if (terrain) {
                // terrain.play(ani.animationName);
            }
        }
    }

    protected addEmpty(pos: IPos) {
        const tmpPos = this.roomService.transformTo45(pos);
        const block = new EmptyTerrain(this.roomService, pos, tmpPos.x, tmpPos.y);
        const pos45 = this.roomService.transformTo45(pos);
        this.mEmptyMap[pos45.x][pos45.y] = block;
    }

    protected removeEmpty(pos: IPos) {
        const pos45 = this.roomService.transformTo45(pos);
        if (pos45.x >= this.mEmptyMap.length || pos45.y >= this.mEmptyMap[0].length) {
            Logger.getInstance().debug(`position ${pos.x} ${pos.y} exceed the map boundary`);
            return;
        }
        if (!this.mEmptyMap[pos45.x] || !this.mEmptyMap[pos45.x][pos45.y]) return;
        const block = this.mEmptyMap[pos45.x][pos45.y];
        if (block) {
            block.dirty = true;
            this.mDirty = true;
        }
    }

    get connection(): ConnectionService | undefined {
        if (this.mRoom) {
            return this.mRoom.game.connection;
        }
        // Logger.getInstance().error("room manager is undefined");
    }

    get roomService(): IRoomService {
        return this.mRoom;
    }
    get map(): number[][] {
        return this.mMap;
    }
}
