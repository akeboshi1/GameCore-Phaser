import {Const} from "../../../common/const/Const";
import {SceneInfo} from "../../../common/struct/SceneInfo";
import {BasicTerrainItem} from "../terrainItems/BasicTerrainItem";
import {BasicSceneLayer} from "../../../base/BasicSceneLayer";
import {TerrainInfo} from "../../../common/struct/TerrainInfo";
import Globals from "../../../Globals";
import {TerrainAnimationItem} from "../terrainItems/TerrainAnimationItem";
import {QuadTree} from "../../../base/ds/QuadTree";

export class TerrainSceneLayer extends BasicSceneLayer {
  public curTerrainLoadCount = 0;
  public needRealTimeDepthSort = false;
  protected _terrainItems: Array<BasicTerrainItem>;
  protected TERRAIN_LAYER_RENDER_DELAY = 200;
  private mapSceneInfo: SceneInfo;
  private mDepthSortDirtyFlag = false;
  private mSortWaitTime = 0;
  private mSortRectangle: Phaser.Rectangle;
  private mQuadTree: QuadTree;

  public constructor(game: Phaser.Game) {
    super(game);
    this._terrainItems = [];
  }

  public initializeMap(mapSceneInfo: SceneInfo): void {
    this.mapSceneInfo = mapSceneInfo;
    if (this.mQuadTree === undefined) {
      this.mQuadTree = new QuadTree({
        x: 0,
        y: 0,
        width: this.mapSceneInfo.mapTotalWidth,
        height: this.mapSceneInfo.mapTotalHeight
      }, 2, 4);
    }
    this.mQuadTree.clear();
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
    let terrainItem: BasicTerrainItem = null;

    for (let i = 0, n: number = this._terrainItems.length; i < n; i++) {
      terrainItem = this._terrainItems[i];
      terrainItem.onFrame(deltaTime);
    }
  }

  public onTick(deltaTime: number): void {
    this.mSortWaitTime += deltaTime;

    let needSort = false;

    if (this.mSortWaitTime > this.TERRAIN_LAYER_RENDER_DELAY) {
      this.mSortWaitTime = 0;
      needSort = this.needRealTimeDepthSort || this.mDepthSortDirtyFlag;
      if (needSort) {
        this.mDepthSortDirtyFlag = false;
      }
    }
    let found: BasicTerrainItem[];
    if (needSort) {
      found = this.mQuadTree.retrieve(this.mSortRectangle) as BasicTerrainItem[];
      this.mSortRectangle = null;
    }

    let terrainItem: BasicTerrainItem = null;

    if (found && found.length > 0) {
      let childIdxList = [];
      let len = found.length;
      for (let i = 0; i < len; i++) {
        childIdxList.push(found[i].getChildIndex(found[i].display));
      }
      found.sort(this.sortFunc);
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
        terrainItem.setChildIndex(terrainItem.display, childIdxList[i]);
      }
    }

    for (let i = 0, n: number = this._terrainItems.length; i < n; i++) {
      terrainItem = this._terrainItems[i];
      if (terrainItem.hadCreated) {
        if (this.mQuadTree) {
          this.mQuadTree.insert(terrainItem);
        }
        this.markDirty(terrainItem.collisionArea.ox, terrainItem.collisionArea.oy, terrainItem.collisionArea.width, terrainItem.collisionArea.height);
      }
      terrainItem.onTick(deltaTime);
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

  // 这里返回的结果是，场景中层次高在数组的前面， 1表示在上层- 1表示在下层
  public sortFunc(a: BasicTerrainItem, b: BasicTerrainItem): number {
    let a3 = Globals.Room45Util.p2top3(a.ox, a.oy, a.oz);
    let b3 = Globals.Room45Util.p2top3(b.ox, b.oy, b.oz);
    if (a3.y > b3.y) {
      return 1;
    } else if (a3.y < b3.y) {
      return -1;
    } else {
      // 左边的排在下面
      if (a3.x > b3.x) {
        return 1;
      } else if (a3.x < b3.x) {
        return -1;
      }
    }
    return 0;
  }

  public addTerrainItem(value: TerrainInfo): void {
    let terrain: BasicTerrainItem = this.getItemByPos(value.col, value.row);
    if (terrain) {
      terrain.onDispose();
      if (this.mQuadTree) {
        this.mQuadTree.remove(terrain);
      }
    } else {
      terrain = new TerrainAnimationItem(Globals.game, this);
      terrain.setCollisionArea(value.collisionArea, value.originCollisionPoint, this.mapSceneInfo.tileWidth >> 1
        , this.mapSceneInfo.tileHeight >> 1);
      this.addChild(terrain);
      this._terrainItems.push(terrain);
    }
    this.setTerrainItem(terrain, value);
  }

  public removeTerrainItem(col: number, row: number): void {
    let terrain: BasicTerrainItem = this.getItemByPos(col, row);
    if (terrain) {
      terrain.onDispose();
    }
  }

  public removeAllTerrain(): void {
    let len = this._terrainItems.length;
    for (let i = 0; i < len; i++) {
      this._terrainItems[i].onDispose();
    }
  }

  /**
   * Indicates this layer is dirty and needs to resort.
   */
  public markDirty(x: number, y: number, w: number, h: number): void {
    if (this.mSortRectangle === undefined || this.mSortRectangle == null) {
      this.mSortRectangle = new Phaser.Rectangle(x, y, w, h);
    }
    let startX: number = this.mSortRectangle.x;
    let startY: number = this.mSortRectangle.y;
    let endX: number = startX + this.mSortRectangle.width;
    let endY: number = startY + this.mSortRectangle.height;
    if (x < startX) {
      this.mSortRectangle.x = x;
    }
    if (y < startY) {
      this.mSortRectangle.y = y;
    }

    if (x + w > endX) {
      endX = x + w;
    }

    if (y + h > endY) {
      endY = y + h;
    }

    this.mSortRectangle.x = startX;
    this.mSortRectangle.y = startY;
    this.mSortRectangle.width = endX - startX;
    this.mSortRectangle.height = endY - startY;

    this.mDepthSortDirtyFlag = true;
  }

  protected initializeTerrainItems(datas: Array<any>): void {
    let len: number = datas.length;
    let value: TerrainInfo;
    let terrain: BasicTerrainItem;
    for (let i = 0; i < len; i++) {
      value = datas[i];
      if (value.type) {
        terrain = new TerrainAnimationItem(Globals.game, this);
        terrain.setCollisionArea(value.collisionArea, value.originCollisionPoint, this.mapSceneInfo.tileWidth >> 1
          , this.mapSceneInfo.tileHeight >> 1);
        this.setTerrainItem(terrain, value);
        this.addChild(terrain);
        this._terrainItems.push(terrain);
      }
    }
  }

  protected setTerrainItem(terrain: BasicTerrainItem, value: TerrainInfo): void {
    terrain.camera = this.camera;
    terrain.data = value;
    let p = Globals.Room45Util.tileToPixelCoords(value.col, value.row);
    terrain.ox = p.x;
    terrain.oy = p.y;
    terrain.oz = value.z;
    terrain.itemWidth = this.mapSceneInfo.tileWidth;
    terrain.itemHeight = this.mapSceneInfo.tileHeight;
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
