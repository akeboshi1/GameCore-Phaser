import {Const} from "../const/Const";
import {MapInfo} from "../struct/MapInfo";
import {BasicTerrainItem} from "./terrainItems/BasicTerrainItem";
import {BasicSceneLayer} from "../base/BasicSceneLayer";
import {TerrainInfo} from "../struct/TerrainInfo";
import {RoomNode} from "./grid/RoomNode";

export class TerrainSceneLayer extends BasicSceneLayer {
    public curTerrainLoadCount: number = 0;
    private mapSceneInfo: MapInfo;
    private _terrainItems: Array<BasicTerrainItem>;

    public constructor() {
        super();
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
        this.x = -this.camera.scrollX;
        this.y = -this.camera.scrollY;
        // this.x = (GameConst.WindowWidth - this.mapSceneInfo.mapTotalWidth) >> 1;
        // this.y = (GameConst.WindowHeight - this.mapSceneInfo.mapTotalHeight) >> 1;
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

    protected initializeTerrainItems(datas: Array<any>): void {
        let i: number = 0;
        let len: number = datas.length;
        let element: any;
        let value: TerrainInfo;
        let point: Phaser.Point;
        let node: RoomNode;
        for (; i < len; i++) {
            value = datas[i];
            // if (value.type == 0) {
            //     element = new RoomNullTerrainItem(this);
            // } else {
            //     element = new RoomTerrainItem(this);
            // }
            // element.camera = this.camera;
            // element.data = value;
            // point = Globals.Room45Util.tileToPixelCoords(value.col, value.row);
            // element.itemX = point.x - GameConst.HALF_MAP_TILE_WIDTH;
            // element.itemY = point.y;
            // element.itemWidth = GameConst.MAP_TILE_WIDTH;
            // element.itemHeight = GameConst.MAP_TILE_HEIGHT;
            // node = (<RoomScene>this.scene).seaMapGrid.getNode(value.col, value.row);
            // element.updateNodeWalkAble(node);
            // this.addChild(element);
            // this._terrainItems.push(element);
        }
    }
}
