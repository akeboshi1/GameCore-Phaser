import { IAbstractPanel } from "../abstractPanel";
import { Logger } from "../../utils/log";

export class Panel extends Phaser.Events.EventEmitter implements IAbstractPanel {
    protected mShowing: boolean;
    protected mInitialized: boolean;
    protected mScene: Phaser.Scene;
    constructor(scene: Phaser.Scene) {
        super();
        this.mInitialized = false;
        this.mScene = scene;
    }

    isShow(): boolean {
        return this.mShowing;
    }
    hide() {
        this.destroy();
    }

    destroy() {
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
        if (!this.mScene) {
            Logger.error("scene does not exise");
            return;
        }
        this.mScene.load.once(Phaser.Loader.Events.COMPLETE, this.loadComplete, this);
        this.mScene.load.start();
    }

    protected loadComplete(loader: Phaser.Loader.LoaderPlugin, totalComplete: integer, totalFailed: integer) {
        if (totalComplete === 0) {
            return;
        }
        if (this.mInitialized) {
            return;
        }
        this.init();
    }
}
