import { IAbstractPanel } from "../abstractPanel";
import { Logger } from "../../utils/log";

export class Panel extends Phaser.GameObjects.Container implements IAbstractPanel {
    protected mShowing: boolean;
    protected mInitialized: boolean;
    protected mScene: Phaser.Scene;
    constructor(scene: Phaser.Scene) {
        super(scene);
        this.mScene = scene;
        this.mInitialized = false;
    }

    isShow(): boolean {
        return this.mShowing;
    }
    hide() {
        this.destroy();
    }

    destroy() {
        super.destroy();
        this.mInitialized = false;
    }

    resize() {
    }

    show(param?: any) {
        if (!this.mInitialized) {
            this.preload();
        }
    }

    update(param: any) {
    }

    protected init() {
        this.mInitialized = true;
    }

    protected preload() {
        if (!this.scene) {
            Logger.error("scene does not exist");
            return;
        }
        this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.loadComplete, this);
        this.scene.load.start();
    }

    protected loadComplete(loader: Phaser.Loader.LoaderPlugin, totalComplete: integer, totalFailed: integer) {
        if (this.mInitialized) {
            return;
        }
        this.init();
    }
}
