import { IAbstractPanel } from "../abstractPanel";
import { Logger } from "../../utils/log";

export class Panel extends Phaser.GameObjects.Container implements IAbstractPanel {
    protected mShowing: boolean = false;
    protected mInitialized: boolean;
    protected mScene: Phaser.Scene;
    protected mWidth: number = 0;
    protected mHeight: number = 0;
    protected mData: any;
    constructor(scene: Phaser.Scene) {
        super(scene);
        this.mScene = scene;
        this.mInitialized = false;
    }

    isShow(): boolean {
        return this.mShowing;
    }
    hide() {
        this.mShowing = false;
    }

    destroy() {
        this.removeAll();
        this.removeAllListeners();
        if (this.parentContainer) {
            this.parentContainer.remove(this);
        }
        this.mInitialized = false;
        this.mShowing = false;
        this.mWidth = 0;
        this.mHeight = 0;
        this.mScene = null;
        super.destroy();
    }

    resize(oriention?: number) {
    }

    show(param?: any) {
        this.mData = param;
        if (!this.mInitialized) {
            this.preload();
            return;
        }
        this.mShowing = true;
    }

    update(param: any) {
    }

    protected init() {
        this.mInitialized = true;
        this.show(this.mData);
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
