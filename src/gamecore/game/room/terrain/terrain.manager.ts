import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_def } from "pixelpai_proto";
import { IDragonbonesModel, IFramesModel, ISprite, ITilesetProperty, Logger, LogicPos, IPos, Position45, ConnectionService } from "structure";
import { EmptyTerrain } from "./empty.terrain";
import { Tool } from "utils";
import NodeType = op_def.NodeType;
import { IDisplayRef, IElementStorage } from "baseGame";
import { IRoomService, SpriteAddCompletedListener } from "../room";

// todo: rename to GroundManager
export class TerrainManager extends PacketHandler {
    public hasAddComplete: boolean = false;
    /**
     * 配置文件等待渲染的物件。
     */
    protected mCacheDisplayRef: Map<number, IDisplayRef> = new Map();
    protected mGameConfig: IElementStorage;
    // idx = x + y * cols
    private mEmptyMap: Map<number, EmptyTerrain> = new Map<number, EmptyTerrain>();
    private mDirty: boolean = false;
    private mIsDealEmptyTerrain: boolean = false;

    constructor(protected mRoom: IRoomService, listener?: SpriteAddCompletedListener) {
        super();
        if (this.connection) {
            this.connection.addPacketListener(this);

            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_SPRITE, this.onSyncSprite);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_CHANGE_SPRITE_ANIMATION, this.onChangeAnimation);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_TILE_MAP, this.onSyncTilemap);
        }
        if (this.mRoom) {
            this.mGameConfig = this.mRoom.game.elementStorage;
        }
    }

    public get isDealEmptyTerrain(): boolean {
        return this.mIsDealEmptyTerrain;
    }

    public init(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.mIsDealEmptyTerrain = false;
            const roomSize = this.roomService.roomSize;

            const scenePIUrl = this.mRoom.game.getCurSceneConfigUrl();
            const sceneID = Tool.baseName(scenePIUrl);
            const urlRoot = Tool.rootName(scenePIUrl);
            this.mRoom.game.renderPeer.addGround({ id: sceneID, resRoot: urlRoot })
                .then((properties: ITilesetProperty[]) => {
                    this.mRoom.game.elementStorage.updateTilesets(properties);
                    resolve(null);
                }).catch((error) => {
                    // tslint:disable-next-line:no-console
                    console.log(error);
                    reject(error);
                });

            // set walkable
            const walkableArray = this.mRoom.game.elementStorage.getGroundWalkableCollection().data;
            let tempX = 0;
            let tempY = 0;
            for (let i = 0; i < walkableArray.length; i++) {
                const walkable = walkableArray[i];
                tempX = i % roomSize.cols;
                tempY = Math.floor(i / roomSize.cols);
                this.mRoom.setGroundWalkable(new LogicPos(tempX, tempY), walkable);
                if (!walkable) {
                    this.addEmpty(new LogicPos(tempX, tempY));
                }
            }
        });
    }

    public update(time: number, delta: number) {
        if (this.mDirty) {
            const removeIds = [];
            this.mEmptyMap.forEach((terrain, idx) => {
                if (terrain && terrain.dirty) {
                    removeIds.push(idx);
                    terrain.destroy();
                }
            });
            for (const removeId of removeIds) {
                this.mEmptyMap.delete(removeId);
            }
            this.mDirty = false;
        }
    }

    public dealEmptyTerrain() {
        this.mIsDealEmptyTerrain = true;
        this.mEmptyMap.forEach((emptyTerrain) => {
            if (emptyTerrain) emptyTerrain.addDisplay();
        });

        // todo 处理完地块后开始加载其他scene的pi
        this.mRoom.game.loadTotalSceneConfig();
    }

    public destroy() {
        this.mIsDealEmptyTerrain = false;
        //  this.roomService.game.emitter.off(ElementManager.ELEMENT_READY, this.dealTerrainCache, this);
        if (this.connection) {
            this.connection.removePacketListener(this);
        }
        this.mEmptyMap.forEach((terrain) => {
            terrain.destroy();
        });
        this.mEmptyMap.clear();
        this.mRoom.game.renderPeer.removeGround();
    }

    public addDisplayRef(displays: IDisplayRef[]) {
        for (const ref of displays) {
            if (!this.mCacheDisplayRef.get(ref.id)) this.mCacheDisplayRef.set(ref.id, ref);
        }
    }

    protected onSyncSprite(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_SYNC_SPRITE = packet.content;
        if (content.nodeType !== op_def.NodeType.TerrainNodeType) {
            return;
        }
        const sprites = content.sprites;
    }

    protected onSyncTilemap(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_TILE_MAP = packet.content;
        for (const oneGroup of content.terrainGroup) {
            for (const onePos of oneGroup.positionList) {
                this.changeGroundBySN(onePos, oneGroup.sn);
            }
        }
        for (let i = 0; i < content.walkableCollection.value.length; i++) {
            const x = i % this.roomService.roomSize.cols;
            const y = Math.floor(i / this.roomService.roomSize.cols);
            this.changeWalkable(new LogicPos(x, y), content.walkableCollection.value[i]);
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

    protected onChangeAnimation(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_CHANGE_SPRITE_ANIMATION = packet.content;
        if (content.nodeType !== NodeType.TerrainNodeType) {
            return;
        }
        const anis = content.changeAnimation;
        const ids = content.ids;
    }

    protected addEmpty(pos45: IPos): EmptyTerrain {
        const pos90 = Position45.transformTo90(pos45, this.roomService.roomSize);
        const block = new EmptyTerrain(this.roomService, pos90, pos45.x, pos45.y);
        this.mEmptyMap.set(this.terrainPos2Idx(pos45.x, pos45.y), block);
        return block;
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

    protected terrainPos2Idx(x: number, y: number): number {
        return x + y * this.mRoom.roomSize.cols;
    }

    protected changeGroundBySN(pos45: IPos, sn: string): Promise<ITilesetProperty> {
        const index = this.mRoom.game.elementStorage.getTilesetIndexBySN(sn);
        return this.changeGroundByTilesetIndex(pos45, index);
    }

    protected changeGroundByTilesetIndex(pos45: IPos, key: number): Promise<ITilesetProperty> {
        return new Promise<ITilesetProperty>((resolve, reject) => {
            this.mRoom.game.renderPeer.changeGround(pos45, key)
                .then((prop: ITilesetProperty) => {
                    resolve(prop);
                })
                .catch((reason) => {
                    reject(reason);
                });
        });
    }

    protected changeWalkable(pos45: IPos, walkable: boolean) {
        const terrainIdx = this.terrainPos2Idx(pos45.x, pos45.y);
        // set empty
        if (walkable && this.mEmptyMap.has(terrainIdx)) {
            this.mEmptyMap.get(terrainIdx).dirty = true;
            this.mDirty = true;
        } else if (!walkable && !this.mEmptyMap.has(terrainIdx)) {
            const empty = this.addEmpty(pos45);
            if (this.mIsDealEmptyTerrain) empty.addDisplay();
        }
        // set astar
        this.mRoom.setGroundWalkable(pos45, walkable);
    }
}
