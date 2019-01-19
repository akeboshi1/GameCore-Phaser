import {BasicSceneLayer} from "../../../base/BasicSceneLayer";
import UniqueLinkList from "../../../base/ds/UniqueLinkList";
import {BasicSceneEntity} from "../../../base/BasicSceneEntity";
import Globals from "../../../Globals";
import {QuadTree} from "../../../base/ds/QuadTree";
import {GameConfig} from "../../../GameConfig";
import {Log} from "../../../Log";
import {IQuadTreeNode} from "../../../base/ds/IQuadTreeNode";

export class DisplaySortableSceneLayer extends BasicSceneLayer {
  public needRealTimeDepthSort = false;
  protected mSceneEntities: UniqueLinkList;
  protected SCENE_LAYER_RENDER_DELAY = 100;
  protected mDepthSortDirtyFlag = false;
  protected mRetrieveDirtyFlag = false;
  protected mSortWaitTime = 0;
  protected mSortRectangle: Phaser.Rectangle;
  protected mQuadTree: QuadTree;

  // private mQuadTree: QuadTreeTest;
  private retrieves: IQuadTreeNode[];
  private screenRectangle: Phaser.Rectangle;

  public constructor(game: Phaser.Game) {
    super(game);
    this.mSceneEntities = new UniqueLinkList();
  }

  public initialize(p_rect: Phaser.Rectangle): void {
    if (this.mQuadTree === undefined) {
      this.mQuadTree = new QuadTree(p_rect);
      // this.mQuadTree = new QuadTreeTest(p_rect, this);
      // this.addChild(QuadTreeTest.graphicsTree);
    }
  }

  public addEntity(d: BasicSceneEntity): void {
    d.scene = this.scene;
    d.camera = this.camera;

    d.initPosition();
    // d.initialize();

    this.mSceneEntities.add(d);

    if (this.mQuadTree) {
      this.mQuadTree.insert(d);
    }

    this.mRetrieveDirtyFlag = true;
  }

  public onFrame(): void {
    if (this.retrieves === undefined) {
      return;
    }

    let screenFounds: BasicSceneEntity[] = this.retrieves as BasicSceneEntity[];
    let len = screenFounds.length;
    let entity: BasicSceneEntity;
    for (let i = 0; i < len; i++) {
      entity = screenFounds[i];
      if (!entity.initilized) {
        entity.initialize();
      } else {
        entity.onFrame();
      }
    }
  }

  public onTick(deltaTime: number): void {

    if (this.screenRectangle === undefined) {
      this.screenRectangle = new Phaser.Rectangle(this.game.camera.x, this.game.camera.y, GameConfig.GameWidth, GameConfig.GameHeight);
    } else {
      this.screenRectangle.x = this.game.camera.x;
      this.screenRectangle.y = this.game.camera.y;
      this.screenRectangle.width = GameConfig.GameWidth;
      this.screenRectangle.height = GameConfig.GameHeight;
    }

    if (this.mQuadTree && (this.retrieves === undefined || this.mRetrieveDirtyFlag)) {
      this.retrieves = this.mQuadTree.retrieve(this.screenRectangle).concat();
      this.mRetrieveDirtyFlag = false;
    }

    let screenFounds: BasicSceneEntity[] = this.retrieves as BasicSceneEntity[];
    let len = screenFounds.length;
    let entity: BasicSceneEntity;

    let cleanTreeFlag = false;

    for (let i = 0; i < len; i++) {
      entity = screenFounds[i];
      if (entity.initilized) {
        entity.onTick(deltaTime);

        if (!entity.isValidDisplay && entity.display.parent) {
          this.remove(entity.display);
          cleanTreeFlag = true;
        }

        if (entity.isValidDisplay && entity.display.parent == null) {
          this.add(entity.display);
          cleanTreeFlag = true;
          entity.positionDirty = true;
        }

        if (entity.needSort) {
          if (entity.isValidDisplay && entity.positionDirty) {
            this.markDirty(entity.quadX, entity.quadY, entity.quadW, entity.quadH);
          }
          entity.positionDirty = false;
        }
      }
    }

    if (this.mQuadTree && cleanTreeFlag) {
      this.retrieves = this.mQuadTree.retrieve(this.screenRectangle).concat();
    }

    this.mSortWaitTime += deltaTime;

    let needSort = false;
    if (this.mSortWaitTime > this.SCENE_LAYER_RENDER_DELAY) {
      this.mSortWaitTime = 0;
      needSort = this.needRealTimeDepthSort || this.mDepthSortDirtyFlag;
      if (needSort) {
        this.mDepthSortDirtyFlag = false;
      }
    }

    let founds: BasicSceneEntity[];
    if (needSort) {
      // Log.trace("needSort:", this.mSortRectangle.x + "|" + this.mSortRectangle.y + "|" + this.mSortRectangle.width + "|" + this.mSortRectangle.height);
      let sortRetrieves: IQuadTreeNode[] = this.mQuadTree.retrieve(this.mSortRectangle);
      founds = sortRetrieves.concat() as BasicSceneEntity[];
      this.mSortRectangle.setTo(0, 0, 0, 0);
    }

    if (founds && founds.length > 0) {
      let childIdxList = [];
      len = founds.length;
      for (let i = 0; i < len; i++) {
        if (!founds[i].isValidDisplay) {
          founds.splice(i, 1);
          i--;
          len--;
          continue;
        }
        childIdxList.push(this.getChildIndex(founds[i].display));
      }
      if (founds && founds.length > 0) {
        founds.sort(Globals.Room45Util.sortFunc);
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
          entity = founds[i];
          this.setChildIndex(entity.display, childIdxList[i]);
        }
      }
    }
  }

  /**
   * 计算脏区域.
   */
  public markDirty(x: number, y: number, w: number, h: number): void {
    if (this.mSortRectangle === undefined || this.mSortRectangle == null) {
      this.mSortRectangle = new Phaser.Rectangle(x, y, w, h);
      this.mDepthSortDirtyFlag = true;
      return;
    }

    if ((x > this.game.camera.x + GameConfig.GameWidth) || ((x + w) < this.game.camera.x)) {
      return;
    }
    if ((y > this.game.camera.y + GameConfig.GameHeight) || ((y + h) < this.game.camera.y)) {
      return;
    }

    let startX: number = this.mSortRectangle.x;
    let startY: number = this.mSortRectangle.y;
    let endX: number = this.mSortRectangle.right;
    let endY: number = this.mSortRectangle.bottom;
    if (x < startX) {
      startX = x;
    }
    if (y < startY) {
      startY = y;
    }

    if (x + w > endX) {
      endX = x + w;
    }

    if (y + h > endY) {
      endY = y + h;
    }

    if (startX < this.game.camera.x) {
      startX = this.game.camera.x;
    }

    if (startY < this.game.camera.y) {
      startY = this.game.camera.y;
    }

    if (endX > (this.game.camera.x + GameConfig.GameWidth)) {
      endX = this.game.camera.x + GameConfig.GameWidth;
    }

    if (endY > (this.game.camera.y + GameConfig.GameHeight)) {
      endY = this.game.camera.y + GameConfig.GameHeight;
    }

    this.mSortRectangle.x = startX;
    this.mSortRectangle.y = startY;
    this.mSortRectangle.width = endX - startX;
    this.mSortRectangle.height = endY - startY;

    // Log.trace("计算区域：", this.mSortRectangle.x + "|" + this.mSortRectangle.y + "|" + this.mSortRectangle.right + "|" + this.mSortRectangle.bottom)

    this.mDepthSortDirtyFlag = true;
  }

  public removeEntity(d: BasicSceneEntity): void {

    if (this.mQuadTree) {
      this.mQuadTree.remove(d);
    }

    this.mSceneEntities.remove(d);

    d.onClear();

    this.remove(d.display);

    this.mRetrieveDirtyFlag = true;

    d.scene = null;
    d.camera = null;
  }
}
