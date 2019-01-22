import {DisplaySortableSceneLayer} from "./DisplaySortableSceneLayer";
import Globals from "../../../Globals";
import {Log} from "../../../Log";
import {BasicSceneEntity} from "../../../base/BasicSceneEntity";

export class DisplaySortableTerrainLayer extends DisplaySortableSceneLayer {
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
    let nowP = new Date().getTime();
    if (needSort) {
      this.mSceneEntities.sort(Globals.Room45Util.sortFunc);
    }
    let nowN = new Date().getTime();
    Log.trace("tick1->", nowN  - nowP);
    nowP = nowN;

    let entity: BasicSceneEntity = this.mSceneEntities.moveFirst();
    while (entity) {
      if (!entity.initilized) {
        if (entity.isInScreen()) {
          entity.initialize();
          this.add(entity.display);
        }
      } else {
        entity.onTick(deltaTime);
        if (entity.isValidDisplay) {
          this.setChildIndex(entity.display, this.children.length - 1);
        } else {
          this.remove(entity.display);
          entity.onClear();
        }
      }
      entity = this.mSceneEntities.moveNext();
    }
    nowN = new Date().getTime();
    Log.trace("tick2->", nowN  - nowP);
  }
}
