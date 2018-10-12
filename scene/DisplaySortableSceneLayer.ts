import {BasicSceneLayer} from "../base/BasicSceneLayer";
import {UniqueLinkList} from "./util/UniqueLinkList";

export class DisplaySortableSceneLayer extends BasicSceneLayer {
    protected mSceneEntities: UniqueLinkList;
    public add(d: BasicSceneEntity): void {
        d.scene = this.scene;
        d.camera = this.camera;

        d.initialize();

        this.mSceneEntities.add(d);
        this.addChild(d.display);
        this.markDirty();
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
