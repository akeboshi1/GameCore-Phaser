import "phaser-ce";
import {SceneInfo} from "../../../common/struct/SceneInfo";
import {BasicTerrainItem} from "../terrainItems/BasicTerrainItem";
import UniqueLinkList from "../../../base/ds/UniqueLinkList";
import Globals from "../../../Globals";
import {BasicSceneLayer} from "../../../base/BasicSceneLayer";
import {TerrainInfo} from "../../../common/struct/TerrainInfo";
import {TerrainAnimationItem} from "../terrainItems/TerrainAnimationItem";
import {ITerrainLayer} from "./ITerrainLayer";
import {Const} from "../../../common/const/Const";
import {TerrainImageItem} from "../terrainItems/TerrainImageItem";

export class TerrainEditorLayer extends BasicSceneLayer implements ITerrainLayer {
  protected curTerrainLoadCount = 0;
  protected mapSceneInfo: SceneInfo;
  protected TERRAIN_LAYER_RENDER_DELAY = 200;
  private mDepthSortDirtyFlag = false;
  private mSortWaitTime = 0;
  private mSortRectangle: Phaser.Rectangle;
  private mTerrainEntities: UniqueLinkList;

  public constructor(game: Phaser.Game) {
    super(game);
    this.mTerrainEntities = new UniqueLinkList();
  }

  public initializeMap(mapSceneInfo: SceneInfo): void {
    this.mapSceneInfo = mapSceneInfo;
    let len: number = this.mapSceneInfo.terrainConfig.length;
    for (let i = 0; i < len; i++) {
      this.initializeTerrainItems(this.mapSceneInfo.terrainConfig[i]);
    }
  }

  public addTerrainItem(value: TerrainInfo): BasicTerrainItem {
    let terrain: TerrainImageItem = this.mTerrainEntities.getValue(value.col + "|" + value.row);
    if (terrain === undefined) {
      terrain = new TerrainImageItem(Globals.game, this);
      this.setTerrainItem(terrain, value);
      this.mTerrainEntities.add(terrain);
      this.add(terrain);
      return terrain;
    }
    return null;
  }

  public getTerrainItem(col: number, row: number): TerrainAnimationItem {
    let terrain: TerrainAnimationItem = this.mTerrainEntities.getValue(col + "|" + row);
    if (terrain) {
      return terrain;
    }
    return null;
  }

  public removeTerrainItem(col: number, row: number): void {
    let terrain: TerrainAnimationItem = this.mTerrainEntities.getValue(col + "|" + row);
    if (terrain) {
      this.mTerrainEntities.remove(terrain);
      terrain.onDispose();
    }
  }

  public clear(): void {
    this.releaseTerrainItems();
    this.mTerrainEntities.clear();
  }

  public releaseTerrainItems(): void {
    let terrain: BasicTerrainItem = this.mTerrainEntities.moveFirst();
    while (terrain) {
      terrain.releaseTerrainItem();
      terrain = this.mTerrainEntities.moveNext();
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

  public onFrame(deltaTime: number): void {
    let terrain: BasicTerrainItem = this.mTerrainEntities.moveFirst();
    while (terrain) {
      terrain.onFrame(deltaTime);
      terrain = this.mTerrainEntities.moveNext();
    }
  }

  public onTick(deltaTime: number): void {
    this.mSortWaitTime += deltaTime;

    let needSort = false;

    if (this.mSortWaitTime > this.TERRAIN_LAYER_RENDER_DELAY) {
      this.mSortWaitTime = 0;
      needSort = this.mDepthSortDirtyFlag;
      if (needSort) {
        this.mDepthSortDirtyFlag = false;
      }
    }
    let found: TerrainAnimationItem[];
    if (needSort) {
      this.sort("oy", Phaser.Group.SORT_ASCENDING);
      this.mSortRectangle = null;
    }

    let terrainItem: TerrainAnimationItem = null;

    if (found && found.length > 0) {
      let childIdxList = [];
      let len = found.length;
      for (let i = 0; i < len; i++) {
        childIdxList.push(this.getChildIndex(found[i]));
      }
      found.sort(Globals.Room45Util.sortFunc);
      childIdxList = childIdxList.sort((n1, n2) => {
        if (n1 > n2) {
          return 1;
        }
        if (n1 < n2) {
          return -1;
        }
        return 0;
      });
      for (let i = 0; i < len; i++) {
        terrainItem = found[i];
        this.setChildIndex(terrainItem, childIdxList[i]);
      }
    }

    terrainItem = this.mTerrainEntities.moveFirst();
    while (terrainItem) {
      terrainItem.onTick(deltaTime);
      if (terrainItem.hadCreated) {
        this.markDirty(terrainItem.ox, terrainItem.oy);
      }
      terrainItem = this.mTerrainEntities.moveNext();
    }
  }

  /**
   * Indicates this layer is dirty and needs to resort.
   */
  public markDirty(x: number, y: number): void {
    this.mDepthSortDirtyFlag = true;
  }

  protected initializeTerrainItems(datas: Array<any>): void {
    let len: number = datas.length;
    let value: TerrainInfo;
    for (let i = 0; i < len; i++) {
      value = datas[i];
      this.addTerrainItem(value);
    }
  }

  protected setTerrainItem(terrain: TerrainImageItem, value: TerrainInfo): void {
    terrain.setMouseOverArea(this.mapSceneInfo.tileWidth >> 1, this.mapSceneInfo.tileHeight >> 1);
    terrain.camera = this.camera;
    terrain.data = value;
    terrain.itemWidth = this.mapSceneInfo.tileWidth;
    terrain.itemHeight = this.mapSceneInfo.tileHeight;
    let p = Globals.Room45Util.tileToPixelCoords(value.col, value.row);
    terrain.setPosition(p.x, p.y, value.z);
  }
}
