import { PacketHandler, PBpacket } from "net-socket-packet";
import { ConnectionService } from "../../net/connection.service";
import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import { Terrain } from "./terrain";
import { IRoomService, SpriteAddCompletedListener } from "../room";
import { IElementManager } from "../element/element.manager";
import { IElementStorage } from "../../game/element.storage";
import { ISprite, Sprite } from "../element/Sprite";
import { IElement } from "../element/element";
import NodeType = op_def.NodeType;
import { IFramesModel } from "../display/frames.model";
import { IDragonbonesModel } from "../display/dragonbones.model";

export class TerrainManager extends PacketHandler implements IElementManager {
    public hasAddComplete: boolean = false;
    protected mTerrains: Map<number, Terrain> = new Map<number, Terrain>();
    protected mGameConfig: IElementStorage;
    // add by 7 ----
    protected mPacketFrameCount: number = 0;
    protected mListener: SpriteAddCompletedListener;
    // ---- by 7
    protected mMap: number[][];

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
        if (this.mRoom && this.mRoom.world) {
            this.mGameConfig = this.mRoom.world.elementStorage;
        }

        const miniSize = this.roomService.miniSize;
        this.mMap = new Array(miniSize.cols);
        for (let i = 0; i < miniSize.rows; i++) {
            this.mMap[i] = new Array(miniSize.rows).fill(0);
        }
    }

    public init() {
        // this.destroy();
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

    public getElements(): IElement[] {
        return Array.from(this.mTerrains.values());
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
            this.remove(id);
        }
        // Logger.getInstance().log("remove terrain length: ", ids.length);
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
            const displayInfo = this.roomService.world.elementStorage.getDisplayModel(sprite.bindID || sprite.id);
            if (displayInfo) {
                sprite.displayInfo = displayInfo;
                return displayInfo;
            }
        }
    }

    protected checkTerrainDisplay(sprite: ISprite) {
        if (!sprite.displayInfo) {
            const palette = this.roomService.world.elementStorage.getTerrainPaletteByBindId(sprite.bindID);
            if (palette) {
                sprite.displayInfo = palette;
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
        const aniName = curAni.animationName;
        const flip = false;
        const collisionArea = displayInfo.getCollisionArea(aniName, flip);
        const walkArea = displayInfo.getWalkableArea(aniName, flip);
        const origin = displayInfo.getOriginPoint(aniName, flip);
        let rows = collisionArea.length;
        let cols = collisionArea[0].length;
        let hasCollisionArea = true;
        if (rows === 1 && cols === 1) {
            rows = 2;
            cols = 2;
            hasCollisionArea = false;
        }
        const pos = sprite.pos;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                // if ((!hasCollisionArea) || collisionArea[i][j] === 1 && walkArea[i][j] === 1) {
                // this.mMap[pos.x + i - origin.x][pos.y + j - origin.y] = type;
                // }
            }
        }
    }

    private onChangeAnimation(packet: PBpacket) {
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

    get connection(): ConnectionService | undefined {
        if (this.mRoom) {
            return this.mRoom.connection;
        }
        // Logger.getInstance().error("room manager is undefined");
    }

    get roomService(): IRoomService {
        return this.mRoom;
    }

    get scene(): Phaser.Scene | undefined {
        if (this.mRoom) {
            return this.mRoom.scene;
        }
    }

    get camera(): Phaser.Cameras.Scene2D.Camera {
        return this.camera;
    }

    get map(): number[][] {
        return this.mMap;
    }
}
