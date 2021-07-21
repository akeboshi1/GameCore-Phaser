import {ListenerManager, PhaserListenerType} from "../listener.manager/listener.manager";
import Tile = Phaser.Tilemaps.Tile;
import Tileset = Phaser.Tilemaps.Tileset;
import {ITilesetProperty} from "../../../structure/tilemap";
import { IGround, IPos, Logger } from "structure";
import {Url} from "utils";

export class Ground extends Phaser.GameObjects.Container {
    public id: string;

    protected tilemapLayer: Phaser.Tilemaps.TilemapLayer;
    protected listenerMng: ListenerManager;

    private readonly MAP_JSON_TILESET_NAME: string = "ground";
    private readonly MAP_JSON_LAYER_NAME: string = "ground-layer";

    constructor(scene: Phaser.Scene, private url: Url, private scaleRatio: number) {
        super(scene);
        this.listenerMng = new ListenerManager(scene);
    }

    public load(data: IGround): Promise<any> {
        this.id = data.id;
        const urls = this.url.getTilemapUrls(data.resRoot, data.id);
        return new Promise<any>((resolve, reject) => {
            this.loadTilemap(urls.mapJson, urls.tilesetImg)
                .then(() => {
                    this.createTilemap();
                    resolve(null);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    public changeAt(pos45: IPos, newIndex: number) {
        if (!this.tilemapLayer) return false;

        const tile = this.tilemapLayer.getTileAt(pos45.x, pos45.y);
        if (!tile) {
            Logger.getInstance().warn("cannot find tile at pos: ", pos45);
            return false;
        }

        const curIdx = tile.index;
        const tileX = tile.x;
        const tileY = tile.y;
        this.tilemapLayer.replaceByIndex(curIdx, newIndex, tileX, tileY, 1, 1);
    }

    public destroy(fromScene?: boolean) {
        if (this.tilemapLayer) {
            this.tilemapLayer.tilemap.destroy();
            this.tilemapLayer.destroy();
        }
        this.listenerMng.destroy();
        super.destroy(fromScene);
    }

    public getTilePropertiesByPos(x: number, y: number): ITilesetProperty {
        if (!this.tilemapLayer) return null;

        const tile = this.tilemapLayer.getTileAt(x, y);
        return this.getTileProperties(tile);
    }

    public getAllTilesetProperties(): ITilesetProperty[] {
        if (!this.tilemapLayer) return [];

        const result = [];
        for (const tileset of this.tilemapLayer.tileset) {
            for (let i = tileset.firstgid; i < tileset.firstgid + tileset.total; i++) {
                const prop = this.getTilesetProperties(tileset, i);
                result.push(prop);
            }
        }
        return result;
    }

    public existTerrain(x: number, y: number) {
        const tile = this.tilemapLayer.getTileAt(x, y);
        if (!tile) return false;
        return tile.index >= 0;
    }

    protected get mapJsonKey() {
        return "tilemapJson_" + this.id;
    }

    protected get tilesetImgKey() {
        return "tilesetImg_" + this.id;
    }

    protected loadTilemap(mapJsonUrl: string, tilesetsImgUrl: string): Promise<any> {
        if (this.scene.load.cacheManager.tilemap.has(this.mapJsonKey) && this.scene.textures.exists(this.tilesetImgKey)) {
            return Promise.resolve();
        }

        return Promise.all([this.loadTilemap_MapJson(mapJsonUrl), this.loadTilemap_TilesetImg(tilesetsImgUrl)]);
    }

    protected createTilemap() {
        if (!this.scene) return;

        if (this.tilemapLayer) return;

        const map = this.scene.add.tilemap(this.mapJsonKey);
        const tileSet = map.addTilesetImage(this.MAP_JSON_TILESET_NAME, this.tilesetImgKey);
        this.tilemapLayer = map.createLayer(this.MAP_JSON_LAYER_NAME, [tileSet]);
        // todo: ???
        this.tilemapLayer.setScale(this.scaleRatio / 1.07);
        this.addAt(this.tilemapLayer, 0);
    }

    private loadTilemap_MapJson(url: string): Promise<any> {
        if (this.scene.load.cacheManager.tilemap.has(this.mapJsonKey)) {
            return Promise.resolve();
        }
        return new Promise<any>((resolve, reject) => {
            const onLoadComplete = (key: string) => {
                if (this.mapJsonKey !== key) return;
                this.listenerMng.removePhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_COMPLETE, onLoadComplete);
                this.listenerMng.removePhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError);

                resolve(null);
            };
            const onLoadError = (file: Phaser.Loader.File) => {
                if (this.mapJsonKey !== file.key) return;
                this.listenerMng.removePhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_COMPLETE, onLoadComplete);
                this.listenerMng.removePhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError);

                Logger.getInstance().warn("load ground json error: " + this.mapJsonKey);
                reject("load ground json error: " + this.mapJsonKey);
            };
            this.listenerMng.addPhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_COMPLETE, onLoadComplete);
            this.listenerMng.addPhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError);
            this.scene.load.tilemapTiledJSON(this.mapJsonKey, url);
            this.scene.load.start();
        });
    }

    private loadTilemap_TilesetImg(url: string): Promise<any> {
        if (this.scene.textures.exists(this.tilesetImgKey)) {
            return Promise.resolve();
        }
        return new Promise<any>((resolve, reject) => {
            const onLoadComplete = (key: string) => {
                if (this.tilesetImgKey !== key) return;
                this.listenerMng.removePhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_COMPLETE, onLoadComplete);
                this.listenerMng.removePhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError);

                resolve(null);
            };
            const onLoadError = (file: Phaser.Loader.File) => {
                if (this.tilesetImgKey !== file.key) return;
                this.listenerMng.removePhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_COMPLETE, onLoadComplete);
                this.listenerMng.removePhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError);

                Logger.getInstance().warn("load ground tileset img error: " + this.tilesetImgKey);
                reject("load ground tileset img error: " + this.tilesetImgKey);
            };
            this.listenerMng.addPhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_COMPLETE, onLoadComplete);
            this.listenerMng.addPhaserListener(PhaserListenerType.Load, Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError);
            this.scene.load.image(this.tilesetImgKey, url);
            this.scene.load.start();
        });
    }

    private getTileProperties(tile: Tile): ITilesetProperty {
        if (!tile) return null;
        const index = tile.index;
        const tileSet = tile.tileset;
        if (!tileSet) return null;
        return this.getTilesetProperties(tileSet, index);
    }

    private getTilesetProperties(tileset: Tileset, index: number): ITilesetProperty {
        const prop = tileset.getTileProperties(index);
        return {index, sn: prop["sn"]};
    }
}
