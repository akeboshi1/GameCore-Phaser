import { PacketHandler, PBpacket } from "net-socket-packet";
import { IDragonbonesModel, IFramesModel, ISprite, IPos, ConnectionService } from "structure";
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
    changeAllDisplayData(id: string): void;
    protected onSyncSprite(packet: PBpacket): void;
    protected onSyncTilemap(packet: PBpacket): void;
    protected checkDisplay(sprite: ISprite): IFramesModel | IDragonbonesModel;
    protected onChangeAnimation(packet: PBpacket): void;
    protected addEmpty(pos45: IPos): EmptyTerrain;
    get connection(): ConnectionService | undefined;
    get roomService(): IRoomService;
    private terrainPos2Idx;
    private changeGroundBySN;
    private changeGroundByTilesetIndex;
    private changeWalkable;
}
