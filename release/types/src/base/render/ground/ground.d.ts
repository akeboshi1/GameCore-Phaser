/// <reference types="tooqingphaser" />
import { ListenerManager } from "../listener.manager/listener.manager";
import { IRender } from "../render";
import { ITilesetProperty } from "../../../structure/tilemap";
import { IGround, IPos } from "structure";
export declare class Ground extends Phaser.GameObjects.Container {
    private render;
    id: string;
    protected tilemapLayer: Phaser.Tilemaps.TilemapLayer;
    protected listenerMng: ListenerManager;
    private readonly MAP_JSON_TILESET_NAME;
    private readonly MAP_JSON_LAYER_NAME;
    constructor(render: IRender, scene: Phaser.Scene);
    load(data: IGround): Promise<any>;
    changeAt(pos45: IPos, newIndex: number): boolean;
    destroy(fromScene?: boolean): void;
    getTilePropertiesByPos(x: number, y: number): ITilesetProperty;
    getAllTilesetProperties(): ITilesetProperty[];
    protected get mapJsonKey(): string;
    protected get tilesetImgKey(): string;
    protected loadTilemap(mapJsonUrl: string, tilesetsImgUrl: string): Promise<any>;
    protected createTilemap(): void;
    private loadTilemap_MapJson;
    private loadTilemap_TilesetImg;
    private getTileProperties;
    private getTilesetProperties;
}
