import { PacketHandler, PBpacket } from "net-socket-packet";
import { IDragonbonesModel, IFramesModel, ISprite, ITilesetProperty, IPos, ConnectionService } from "structure";
import { EmptyTerrain } from "./empty.terrain";
import { IDisplayRef, IElementStorage } from "baseGame";
import { IRoomService, SpriteAddCompletedListener } from "../room";
export declare class TerrainManager extends PacketHandler {
    protected mRoom: IRoomService;
    hasAddComplete: boolean;
    /**
     * 配置文件等待渲染的物件。
     */
    protected mCacheDisplayRef: Map<number, IDisplayRef>;
    protected mGameConfig: IElementStorage;
    private mEmptyMap;
    private mDirty;
    private mIsDealEmptyTerrain;
    constructor(mRoom: IRoomService, listener?: SpriteAddCompletedListener);
    get isDealEmptyTerrain(): boolean;
    init(): Promise<any>;
    update(time: number, delta: number): void;
    dealEmptyTerrain(): void;
    destroy(): void;
    addDisplayRef(displays: IDisplayRef[]): void;
    protected onSyncSprite(packet: PBpacket): void;
    protected onSyncTilemap(packet: PBpacket): void;
    protected checkDisplay(sprite: ISprite): IFramesModel | IDragonbonesModel;
    protected onChangeAnimation(packet: PBpacket): void;
    protected addEmpty(pos45: IPos): EmptyTerrain;
    get connection(): ConnectionService | undefined;
    get roomService(): IRoomService;
    protected terrainPos2Idx(x: number, y: number): number;
    protected changeGroundBySN(pos45: IPos, sn: string): Promise<ITilesetProperty>;
    protected changeGroundByTilesetIndex(pos45: IPos, key: number): Promise<ITilesetProperty>;
    protected changeWalkable(pos45: IPos, walkable: boolean): void;
}
