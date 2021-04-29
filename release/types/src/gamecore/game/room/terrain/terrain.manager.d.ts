import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client } from "pixelpai_proto";
import { Terrain } from "./terrain";
import { IElementManager } from "../element/element.manager";
import { IElement } from "../element/element";
import { IRoomService, SpriteAddCompletedListener } from "../room";
import { ISprite, IPos, IDragonbonesModel, IFramesModel } from "structure";
import { ConnectionService } from "src/structure/net";
import { IElementStorage } from "baseGame";
export declare class TerrainManager extends PacketHandler implements IElementManager {
    protected mRoom: IRoomService;
    hasAddComplete: boolean;
    protected mTerrains: Map<number, Terrain>;
    protected mGameConfig: IElementStorage;
    protected mPacketFrameCount: number;
    protected mListener: SpriteAddCompletedListener;
    private mEmptyMap;
    private mDirty;
    private mTerrainCache;
    private mIsDealEmptyTerrain;
    constructor(mRoom: IRoomService, listener?: SpriteAddCompletedListener);
    get isDealEmptyTerrain(): boolean;
    init(): void;
    update(time: number, delta: number): void;
    dealEmptyTerrain(): void;
    addSpritesToCache(sprites: op_client.ISprite[]): void;
    destroy(): void;
    get(id: number): Terrain;
    add(sprites: ISprite[]): void;
    remove(id: number): IElement;
    getElements(): IElement[];
    onDisplayCreated(id: number): void;
    onDisplayRemoved(id: number): void;
    protected onAdd(packet: PBpacket): void;
    protected _add(sprite: ISprite): Terrain;
    protected addComplete(packet: PBpacket): void;
    protected onRemove(packet: PBpacket): void;
    protected onSyncSprite(packet: PBpacket): void;
    protected checkDisplay(sprite: ISprite): IFramesModel | IDragonbonesModel;
    protected checkTerrainDisplay(sprite: ISprite): void;
    protected fetchDisplay(ids: number[]): void;
    protected removeMap(sprite: ISprite): void;
    protected addMap(sprite: ISprite): void;
    protected setMap(sprite: ISprite, type: number): void;
    protected onChangeAnimation(packet: PBpacket): void;
    protected addEmpty(pos: IPos): void;
    protected removeEmpty(pos: IPos): void;
    private dealTerrainCache;
    get connection(): ConnectionService | undefined;
    get roomService(): IRoomService;
}
