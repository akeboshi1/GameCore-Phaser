import {BasicSceneLayer} from "../../../base/BasicSceneLayer";
import UniqueLinkList from "../../../base/ds/UniqueLinkList";
import {BasicSceneEntity} from "../../../base/BasicSceneEntity";
import {QuadTree} from "../../../base/ds/QuadTree";

export class DisplaySortableSceneLayer extends BasicSceneLayer {
  public needRealTimeDepthSort = true;
  protected mSceneEntities: UniqueLinkList;
  protected SCENE_LAYER_RENDER_DELAY = 200;
  private mDepthSortDirtyFlag = false;
  private mSortWaitTime = 0;
  private mQuadTree: QuadTree;

  public constructor(game: Phaser.Game) {
    super(game);
    this.mSceneEntities = new UniqueLinkList();
  }

  public initialize(p_rect: Phaser.Rectangle, p_maxDepth: number = 3, currentDepth: number = 0): void {
    this.mQuadTree = new QuadTree(p_rect, p_maxDepth, currentDepth);
  }

  public addEntity(d: BasicSceneEntity): void {
    d.scene = this.scene;
    d.camera = this.camera;

    d.initialize();

    this.mSceneEntities.add(d);
    if (this.mQuadTree) {
      this.mQuadTree.insert(d);
    }
    this.add(d.display);
    this.markDirty();
  }

  public onFrame(deltaTime: number): void {
    let entity: BasicSceneEntity = this.mSceneEntities.moveFirst();
    while (entity) {
      entity.onFrame(deltaTime);
      entity = this.mSceneEntities.moveNext();
    }
  }

  public onTick(deltaTime: number): void {
    this.mSortWaitTime += deltaTime;

    let needSort = false;

    if (this.mSortWaitTime > this.SCENE_LAYER_RENDER_DELAY) {
      this.mSortWaitTime = 0;
      needSort = this.needRealTimeDepthSort || this.mDepthSortDirtyFlag;
      if (needSort) {
        this.mDepthSortDirtyFlag = false;
      }
    }

    if (needSort) {
      this.mSceneEntities.sort(this.sortFunc);
      // this.game.iso.simpleSort( this.parent );
    }
    let entity: BasicSceneEntity = this.mSceneEntities.moveFirst();
    while (entity) {
      entity.onTick(deltaTime);
      if (needSort) {
        if (entity.needSort) {
          this.setChildIndex(entity.display, this.children.length - 1);
        }
      }
      entity = this.mSceneEntities.moveNext();
    }
  }

  // 这里返回的结果是，场景中层次高在数组的前面， 1表示在上层- 1表示在下层
  public sortFunc(a: BasicSceneEntity, b: BasicSceneEntity): number {
    if (a.oy > b.oy) {
      return 1;
    } else if (a.oy < b.oy) {
      return -1;
    } else {
      // 左边的排在下面
      if (a.ox > b.ox) {
        return 1;
      } else if (a.ox < b.ox) {
        return -1;
      }
    }
    return 0;
  }

  /**
   * Indicates this layer is dirty and needs to resort.
   */
  public markDirty(force: boolean = false): void {
    if (!this.needRealTimeDepthSort || force) {
      this.mDepthSortDirtyFlag = true;
    }
  }

  public removeEntity(d: BasicSceneEntity, dispose: boolean = true): void {
    this.mSceneEntities.remove(d);
    if (d && d.display && d.display.parent) {
      this.removeChild(d.display);
    }

    if (this.mQuadTree) {
      this.mQuadTree.insert(d);
    }

    if (dispose) {
      d.dispose();
    }

    d.scene = null;
    d.camera = null;
  }
}
