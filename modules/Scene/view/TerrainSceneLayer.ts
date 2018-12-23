import {Const} from "../../../common/const/Const";
import {SceneInfo} from "../../../common/struct/SceneInfo";
import {BasicTerrainItem} from "../terrainItems/BasicTerrainItem";
import {BasicSceneLayer} from "../../../base/BasicSceneLayer";
import {TerrainInfo} from "../../../common/struct/TerrainInfo";
import Globals from "../../../Globals";
import {ITerrainLayer} from "./ITerrainLayer";
import {TerrainAnimationItem} from "../terrainItems/TerrainAnimationItem";

export class TerrainSceneLayer extends BasicSceneLayer implements ITerrainLayer {
    protected curTerrainLoadCount = 0;
    protected mapSceneInfo: SceneInfo;
    protected _terrainItems: Array<BasicTerrainItem>;

    public constructor(game: Phaser.Game) {
        super(game);
        this._terrainItems = [];
    }

    public initializeMap(mapSceneInfo: SceneInfo): void {
        this.mapSceneInfo = mapSceneInfo;
    }

    public isValidLoad(): boolean {
        return this.curTerrainLoadCount < Const.GameConst.MAX_TERRAIN_LOAD_COUNT;
    }

    public increaseLoadCount(): void {
        this.curTerrainLoadCount++;
    }

    public decreaseLoadCount(): void {
        this.curTerrainLoadCount--;
        if (this.curTerrainLoadCount < 0) {
            this.curTerrainLoadCount = 0;
        }
    }

    public addTerrainItem(value: TerrainInfo): any {
        let terrain: BasicTerrainItem = new TerrainAnimationItem(Globals.game, this);
        terrain.setCollisionArea(value.collisionArea, value.originCollisionPoint, this.mapSceneInfo.tileWidth >> 1
            , this.mapSceneInfo.tileHeight >> 1);
        terrain.camera = this.camera;
        terrain.data = value;
        let p = Globals.Room45Util.tileToPixelCoords(value.col, value.row);
        terrain.ox = p.x;
        terrain.oy = p.y;
        terrain.oz = value.z;
        terrain.itemWidth = this.mapSceneInfo.tileWidth;
        terrain.itemHeight = this.mapSceneInfo.tileHeight;
        this.addChild(terrain);
        this._terrainItems.push(terrain);
        return terrain;
    }

    public releaseTerrainItems(): void {
        if (this._terrainItems && this._terrainItems.length > 0) {
            for (let i = 0, len: number = this._terrainItems.length; i < len; i++) {
                this._terrainItems[i].releaseTerrainItem();
            }
        }
    }

    public onFrame(deltaTime: number): void {
        let terrainItem: BasicTerrainItem = null;

        for (let i = 0, len: number = this._terrainItems.length; i < len; i++) {
            terrainItem = this._terrainItems[i];
            terrainItem.onFrame(deltaTime);
        }
    }

    public onTick(deltaTime: number): void {
        let terrainItem: BasicTerrainItem = null;

        for (let i = 0, len: number = this._terrainItems.length; i < len; i++) {
            terrainItem = this._terrainItems[i];
            terrainItem.onTick(deltaTime);
        }
    }

    public clear(): void {
        if (this._terrainItems && this._terrainItems.length > 0) {
            for (let i = 0, len = this._terrainItems.length; i < len; i++) {
                this._terrainItems[i].onDispose();
            }

            this._terrainItems.length = 0;
        }
    }
}
