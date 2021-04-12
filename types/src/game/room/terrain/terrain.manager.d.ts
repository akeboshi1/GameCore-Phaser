import { PacketHandler, PBpacket } from "net-socket-packet";
import { Terrain } from "./terrain";
import { IElementManager } from "../element/element.manager";
import { IElement } from "../element/element";
import { IRoomService, SpriteAddCompletedListener } from "../room/room";
import { ISprite } from "structure";
import { ConnectionService } from "lib/net/connection.service";
import { IFramesModel } from "structure";
import { IDragonbonesModel } from "structure";
import { IPos } from "utils";
import { IElementStorage } from "baseModel";
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
