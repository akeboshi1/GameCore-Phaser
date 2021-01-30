import sort from "sort-display-object";
import { Logger } from "utils";
import { BaseDragonbonesDisplay } from "../display/base.dragonbones.display";
import { BaseFramesDisplay } from "../display/base.frames.display";
import { BaseLayer } from "./base.layer";

export class SurfaceLayer extends BaseLayer {
    public add(child: BaseFramesDisplay | BaseDragonbonesDisplay) {
        super.add(child);
        return this;
    }

    public sortLayer() {
        // this.sortUtil.depthSort(this.list);
        // TODO: import ElementDisplay
        // this.sort("depth", (displayA: any, displayB: any) => {
        //     // 游戏中所有元素的sortz为1，只在同一高度上，所以下面公式中加入sortz暂时不影响排序，后期sortz会有变化
        //     return displayA.y + displayA.z > displayB.y + displayB.z;
        // });
        sort.reset();
        sort.setTolerance(0.8);
        const displays = this.list;
        for (const display of displays) {
            const dis = <any> display;
            const projection = dis.projectionSize;

            if (dis.nodeType === 5) {
                sort.addDynamicDisplayObject(dis.id, dis.sortX, dis.sortY, projection.width, projection.height, true, dis.nickname, dis);
            } else {
                sort.addFixedDisplayObject(dis.id, dis.sortX, dis.sortY, projection.width, projection.height, false, dis.nickname, dis);
            }
        }
        try {
            this.list = sort.sort();
        } catch {
            Logger.getInstance().error("Cyclic dependency");
        }
    }
}
