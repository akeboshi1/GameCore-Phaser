import {BasicSceneLayer} from "../base/BasicSceneLayer";
import {UniqueLinkList} from "./util/UniqueLinkList";
import {BasicSceneEntity} from "../base/BasicSceneEntity";

export class DisplaySortableSceneLayer extends BasicSceneLayer {
    protected mSceneEntities: UniqueLinkList;
    public needRealTimeDepthSort: boolean = false;
    private mDepthSortDirtyFlag: boolean = false;
    public add(d: BasicSceneEntity): void {
        d.scene = this.scene;
        d.camera = this.camera;

        d.initialize();

        this.mSceneEntities.add(d);
        this.addChild(d.display);
        this.markDirty();
    }

    /**
     * Indicates this layer is dirty and needs to resort.
     */
    public markDirty(force: boolean = false): void {
        if (!this.needRealTimeDepthSort || force) {
            this.mDepthSortDirtyFlag = true;
        }
    }

    public remove(d: BasicSceneEntity, dispose: boolean = true): void {
        this.mSceneEntities.remove(d);
        if (d && d.display && d.display.parent) {
            this.removeChild(d.display);
        }

        if (dispose) {
            d.dispose();
        }

        d.scene = null;
        d.camera = null;
    }
}
