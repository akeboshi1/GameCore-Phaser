import {Const} from "../const/Const";
import {MapInfo} from "../struct/MapInfo";
import {BasicTerrainItem} from "./terrainItems/BasicTerrainItem";
import {BasicSceneLayer} from "../base/BasicSceneLayer";
import {TerrainInfo} from "../struct/TerrainInfo";
import {TerrainImageItem} from "./terrainItems/TerrainImageItem";
import Globals from "../Globals";
import {TerrainNullItem} from "./terrainItems/TerrainNullItem";
import {Log} from "../Log";

export class TerrainSceneLayer extends BasicSceneLayer {
    public curTerrainLoadCount: number = 0;
    private mapSceneInfo: MapInfo;
    private _terrainItems: Array<BasicTerrainItem>;

    public constructor(game: Phaser.Game, x: number = 0, y: number = 0) {
        super(game, x, y);
        this._terrainItems = [];
    }

    public initializeMap(mapSceneInfo: MapInfo): void {
        this.mapSceneInfo = mapSceneInfo;
        this.initializeTerrainItems(this.mapSceneInfo.terrainInfo);
    }

    public isValidLoad(): boolean {
        return this.curTerrainLoadCount < Const.GameConst.MAX_TERRAIN_LOAD_COUNT;
    }

    public increaseLoadCount(): void {
        this.curTerrainLoadCount++;
    }

    public decreaseLoadCount(): void {
        this.curTerrainLoadCount--;
        if (this.curTerrainLoadCount < 0) this.curTerrainLoadCount = 0;
    }

    public releaseTerrainItems(): void {
        if (this._terrainItems && this._terrainItems.length > 0) {
            for (var i: number = 0, n: number = this._terrainItems.length; i < n; i++) {
                this._terrainItems[i].releaseTerrainItem();
            }
        }
    }

    public onFrame(deltaTime: number): void {
        // this.iosX = (GameConst.WindowWidth - this.mapSceneInfo.mapTotalWidth) >> 1;
        // this.iosY = (GameConst.WindowHeight - this.mapSceneInfo.mapTotalHeight) >> 1;
        var terrainItem: BasicTerrainItem = null;

        for (var i: number = 0, n: number = this._terrainItems.length; i < n; i++) {
            terrainItem = this._terrainItems[i];
            terrainItem.onFrame(deltaTime);
        }
    }

    public clear(): void {
        if (this._terrainItems && this._terrainItems.length > 0) {
            for (var i: number = 0, n: number = this._terrainItems.length; i < n; i++) {
                this._terrainItems[i].dispose();
            }

            this._terrainItems.length = 0;
        }
    }

    public drawGrid() {
        this.mapSceneInfo.cols;
    }

    protected initializeTerrainItems(datas: Array<any>): void {
        let i: number = 0;
        let len: number = datas.length;
        let element: BasicTerrainItem;
        let value: TerrainInfo;
        let point: Phaser.Point;
        for (; i < len; i++) {
            value = datas[i];
            if (value.type === 0) {
                continue;
            //     element = new TerrainNullItem(Globals.game, this);
            } else {
                // Log.trace(value.row,value.col);
                element = new TerrainImageItem(Globals.game, this);
            }
            element.camera = this.camera;
            element.data = value;
            let p = Globals.Room45Util.tileToPixelCoords(value.col,value.row);
            let p3 = Globals.Room45Util.p2top3(p.x,p.y,0);
            element.isoX = p3.x;
            element.isoY = p3.y;
            element.isoZ = p3.z;
            element.itemWidth = Const.GameConst.MAP_TILE_WIDTH;
            element.itemHeight = Const.GameConst.MAP_TILE_HEIGHT;

            this.addChild(element);
            this._terrainItems.push(element);
        }
    }
}
