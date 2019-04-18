import {BasicSceneLayer} from "../../../base/BasicSceneLayer";
import UniqueLinkList from "../../../base/ds/UniqueLinkList";
import {BasicSceneEntity} from "../../../base/BasicSceneEntity";
import Globals from "../../../Globals";

export class DisplaySortableSceneLayer extends BasicSceneLayer {
  public needRealTimeDepthSort = false;
  protected mSceneEntities: UniqueLinkList;
  protected SCENE_LAYER_RENDER_DELAY = 100;
  protected mDepthSortDirtyFlag = false;
  protected mSortWaitTime = 0;

  public constructor(game: Phaser.Game) {
    super(game);
    this.mSceneEntities = new UniqueLinkList();
  }

  public onInitialize(): void {
  }

  public addEntity(d: BasicSceneEntity): void {
    d.scene = this.scene;
    d.camera = this.camera;

    d.initialize();
    d.initPosition();

    this.mSceneEntities.add(d);

    this.add(d.display);
    this.markDirty();
  }

  public insertEntity(d: BasicSceneEntity, all: boolean = false): void {
  }

  public clearShowBitmap(): void {
  }

  public onFrame(): void {
    let entity: BasicSceneEntity = this.mSceneEntities.moveFirst();
    while (entity) {
      if (entity.initilized) {
        entity.onFrame();
      }
      entity = this.mSceneEntities.moveNext();
    }
  }

  /**
   * Indicates this layer is dirty and needs to resort.
   */
  public markDirty(force: boolean = false): void {
    if (!this.needRealTimeDepthSort || force) {
      this.mDepthSortDirtyFlag = true;
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
      this.mSceneEntities.sort(Globals.Room45Util.sortFunc);
    }

    let entity: BasicSceneEntity = this.mSceneEntities.moveFirst();
    while (entity) {
      entity.onTick(deltaTime);
      if (entity.isValidDisplay) {
          this.setChildIndex(entity.display, this.children.length - 1);
      }
      entity = this.mSceneEntities.moveNext();
    }
  }

  public removeEntity(d: BasicSceneEntity, all: boolean = false): void {
    this.mSceneEntities.remove(d);
    this.remove(d.display);
    d.onDispose();
    d = null;
  }

  public onClear(): void {
  }
}
