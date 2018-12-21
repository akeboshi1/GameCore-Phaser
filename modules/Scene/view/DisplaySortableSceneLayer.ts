import {BasicSceneLayer} from "../../../base/BasicSceneLayer";
import UniqueLinkList from "../../../base/ds/UniqueLinkList";
import {BasicSceneEntity} from "../../../base/BasicSceneEntity";
import {QuadTreeTest} from "../../../base/ds/QuadTreeTest";
import Globals from "../../../Globals";

export class DisplaySortableSceneLayer extends BasicSceneLayer {
  public needRealTimeDepthSort = false;
  protected mSceneEntities: UniqueLinkList;
  protected SCENE_LAYER_RENDER_DELAY = 200;
  private mDepthSortDirtyFlag = false;
  private mSortWaitTime = 0;
  private mSortRectangle: Phaser.Rectangle;
  private mQuadTree: QuadTreeTest;


  public constructor(game: Phaser.Game) {
    super(game);
    this.mSceneEntities = new UniqueLinkList();
  }

  public initialize(p_rect: Phaser.Rectangle): void {
    if (this.mQuadTree === undefined) {
      this.mQuadTree = new QuadTreeTest(p_rect, this);
      this.addChild(QuadTreeTest.graphicsTree);
    }
    this.mQuadTree.clear();
  }

  public addEntity(d: BasicSceneEntity): void {
    d.scene = this.scene;
    d.camera = this.camera;

    d.initialize();

    this.mSceneEntities.add(d);
    this.add(d.display);

    if (this.mQuadTree) {
      this.mQuadTree.insert(d);
    }

    this.markDirty(d.collisionArea.ox, d.collisionArea.oy, d.collisionArea.width, d.collisionArea.height);
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
    let found: BasicSceneEntity[];
    if (needSort) {
      found = this.mQuadTree.retrieve(this.mSortRectangle) as BasicSceneEntity[];
      this.mSortRectangle = null;
    }
    let entity: BasicSceneEntity;
    if (found && found.length > 0) {
      let childIdxList = [];
      let len = found.length;
      for (let i = 0; i < len; i++) {
        childIdxList.push(this.getChildIndex(found[i].display));
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
        entity = found[i];
        this.setChildIndex(entity.display, childIdxList[i]);
      }
    }

    entity = this.mSceneEntities.moveFirst();
    while (entity) {
      entity.onTick(deltaTime);
      entity = this.mSceneEntities.moveNext();
    }
  }

  // 这里返回的结果是，场景中层次高在数组的前面， 1表示在上层- 1表示在下层
  public sortFunc(a: BasicSceneEntity, b: BasicSceneEntity): number {
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

  public removeEntity(d: BasicSceneEntity, dispose: boolean = true): void {
    this.mSceneEntities.remove(d);
    if (d && d.display && d.display.parent) {
      this.removeChild(d.display);
    }

    if (this.mQuadTree) {
      this.mQuadTree.remove(d);
    }

    if (dispose) {
      d.onDispose();
    }

    d.scene = null;
    d.camera = null;
  }
}
