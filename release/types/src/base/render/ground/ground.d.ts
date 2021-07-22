/// <reference types="tooqingphaser" />
import { ListenerManager } from "../listener.manager/listener.manager";
import { ITilesetProperty } from "../../../structure/tilemap";
import { IGround, IPos } from "structure";
import { Url } from "utils";
export declare class Ground extends Phaser.GameObjects.Container {
    private url;
    private scaleRatio;
    id: string;
    protected tilemapLayer: Phaser.Tilemaps.TilemapLayer;
    protected listenerMng: ListenerManager;
    private readonly MAP_JSON_TILESET_NAME;
    private readonly MAP_JSON_LAYER_NAME;
    constructor(scene: Phaser.Scene, url: Url, scaleRatio: number);
    load(data: IGround): Promise<any>;
    changeAt(pos45: IPos, newIndex: number): boolean;
    destroy(fromScene?: boolean): void;
    getTilePropertiesByPos(x: number, y: number): ITilesetProperty;
    getAllTilesetProperties(): ITilesetProperty[];
    existTerrain(x: number, y: number): boolean;
    protected get mapJsonKey(): string;
    protected get tilesetImgKey(): string;
    protected loadTilemap(mapJsonUrl: string, tilesetsImgUrl: string): Promise<any>;
    protected createTilemap(): void;
    private loadTilemap_MapJson;
    private loadTilemap_TilesetImg;
    private getTileProperties;
    private getTilesetProperties;
}
