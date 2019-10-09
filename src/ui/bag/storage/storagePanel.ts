import { IAbstractPanel } from "../../abstractPanel";
import { Panel } from "../../components/panel";

export class StoragePanel extends Panel {
    private mParentCon: Phaser.GameObjects.Container;
    constructor(scene: Phaser.Scene) {
        super(scene);
    }
    public isShow(): boolean {
        return this.mShowing;
    }
    public resize() {

    }
    public show(param: any) {

    }
    public update(param: any) {

    }
    public hide() {

    }
    public destroy() {

    }

    protected init() {
        if (this.mInitialized) return;
        super.init();
    }
}
