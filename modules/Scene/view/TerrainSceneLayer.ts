import {Const} from "../../../common/const/Const";
import {SceneInfo} from "../../../common/struct/SceneInfo";
import {BasicTerrainItem} from "../terrainItems/BasicTerrainItem";
import {BasicSceneLayer} from "../../../base/BasicSceneLayer";
import {TerrainInfo} from "../../../common/struct/TerrainInfo";
import {TerrainImageItem} from "../terrainItems/TerrainImageItem";
import Globals from "../../../Globals";

export class TerrainSceneLayer extends BasicSceneLayer {
  public curTerrainLoadCount = 0;
  private mapSceneInfo: SceneInfo;
  private _terrainItems: Array<BasicTerrainItem>;

  public constructor(game: Phaser.Game) {
    super(game);
    this._terrainItems = [];
  }

  public initializeMap(mapSceneInfo: SceneInfo): void {
    this.mapSceneInfo = mapSceneInfo;
    let len: number = this.mapSceneInfo.terrainConfig.length;
    for (let i = 0; i < len; i++) {
      this.initializeTerrainItems(this.mapSceneInfo.terrainConfig[i]);
    }
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

  public releaseTerrainItems(): void {
    if (this._terrainItems && this._terrainItems.length > 0) {
      for (let i = 0, n: number = this._terrainItems.length; i < n; i++) {
        this._terrainItems[i].releaseTerrainItem();
      }
    }
  }

  public onFrame(deltaTime: number): void {
    // this.iosX = (GameConst.WindowWidth - this.mapSceneInfo.mapTotalWidth) >> 1;
    // this.iosY = (GameConst.WindowHeight - this.mapSceneInfo.mapTotalHeight) >> 1;
    let terrainItem: BasicTerrainItem = null;

    for (let i = 0, n: number = this._terrainItems.length; i < n; i++) {
      terrainItem = this._terrainItems[i];
      terrainItem.onFrame(deltaTime);
    }
  }

  public clear(): void {
    if (this._terrainItems && this._terrainItems.length > 0) {
      for (let i = 0, n: number = this._terrainItems.length; i < n; i++) {
        this._terrainItems[i].onDispose();
      }

      this._terrainItems.length = 0;
    }
  }

  public addTerrainItem(value: TerrainInfo): void {
    let element: BasicTerrainItem = this.getItemByPos(value.col, value.row);
    if (element) {
      element.onDispose();
    } else {
      element = new TerrainImageItem(Globals.game, this);
      this.addChild(element);
      this._terrainItems.push(element);
    }
    this.setTerrainItem(element, value);
  }

  public removeTerrainItem(col: number, row: number): void {
    let element: BasicTerrainItem = this.getItemByPos(col, row);
    if (element) {
      element.onDispose();
    }
  }

  public removeAllTerrain(): void {
    let len = this._terrainItems.length;
    for (let i = 0; i < len; i++) {
        this._terrainItems[i].onDispose();
    }
  }

  protected initializeTerrainItems(datas: Array<any>): void {
    let len: number = datas.length;
    let value: TerrainInfo;
    let element: BasicTerrainItem;
    for (let i = 0; i < len; i++) {
      value = datas[i];
      if (value.type) {
        element = new TerrainImageItem(Globals.game, this);
        this.setTerrainItem(element, value);
        this.addChild(element);
        this._terrainItems.push(element);
      }
    }
  }

  protected setTerrainItem(element: BasicTerrainItem, value: TerrainInfo): void {
    element.camera = this.camera;
    element.data = value;
    element.col = value.col;
    let p = Globals.Room45Util.tileToPixelCoords(value.col, value.row);
    let p3 = Globals.Room45Util.p2top3(p.x, p.y, 0);
    element.isoX = p3.x;
    element.isoY = p3.y;
    element.isoZ = p3.z;
    element.itemWidth = this.mapSceneInfo.tileWidth;
    element.itemHeight = this.mapSceneInfo.tileHeight;
  }

  private getItemByPos(col: number, row: number): BasicTerrainItem {
    let len = this._terrainItems.length;
    for (let i = 0; i < len; i++) {
      if (this._terrainItems[i].data.col === col && this._terrainItems[i].data.row === row) {
        return this._terrainItems[i];
      }
    }
    return null;
  }
}
