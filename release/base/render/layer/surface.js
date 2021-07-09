import sort from "sort-display-object";
import { Logger } from "structure";
import { BaseLayer } from "./base.layer";
export class SurfaceLayer extends BaseLayer {
  add(child) {
    super.add(child);
    return this;
  }
  sortLayer() {
    sort.reset();
    sort.setTolerance(0.8);
    const displays = this.list;
    for (const display of displays) {
      const dis = display;
      const projection = dis.projectionSize;
      if (dis.nodeType === 5) {
        sort.addDynamicDisplayObject(dis.id, dis.sortX, dis.sortY, projection.width, projection.height, true, dis.nickname, dis);
      } else {
        sort.addFixedDisplayObject(dis.id, dis.sortX, dis.sortY, projection.width, projection.height, false, dis.nickname, dis);
      }
    }
    try {
      this.list = sort.sort();
    } catch (e) {
      Logger.getInstance().error("Cyclic dependency");
    }
  }
}
