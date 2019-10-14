import { IAbstractPanel } from "../abstractPanel";
import { Logger } from "../../utils/log";

export class Panel extends Phaser.GameObjects.Container implements IAbstractPanel {
    protected mShowing: boolean = false;
    protected mInitialized: boolean;
    protected mScene: Phaser.Scene;
    protected mWidth: number = 0;
    protected mHeight: number = 0;
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
        this.destroy();
    }

    destroy() {
        this.removeAll();
        this.removeAllListeners();
        if (this.parentContainer) {
            this.parentContainer.remove(this);
        }
        // if (this.list && this.list.length > 0) {
        //     const len: number = this.list.length;
        //     for (let i: number = 0; i < len; i++) {
        //         const child: Phaser.GameObjects.GameObject = this.list[i];
        //         if (!child) continue;
        //         if (child.parentContainer) {
        //             child.parentContainer.remove(child);
        //         }
        //         child.destroy(true);
        //     }
        // }
        this.mInitialized = false;
        this.mWidth = 0;
        this.mHeight = 0;
        super.destroy();
    }

    resize() {
    }

    show(param?: any) {
        if (!this.mInitialized) {
            this.preload();
            return;
        }
    }

    update(param: any) {
    }

    protected init() {
        this.mShowing = true;
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
