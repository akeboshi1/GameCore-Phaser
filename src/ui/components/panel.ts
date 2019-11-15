import { IAbstractPanel } from "../abstractPanel";
import { Logger } from "../../utils/log";

export class Panel extends Phaser.GameObjects.Container implements IAbstractPanel {
    protected mShowing: boolean = false;
    protected mInitialized: boolean;
    protected mTweening: boolean = false;
    protected mScene: Phaser.Scene;
    protected mWidth: number = 0;
    protected mHeight: number = 0;
    protected mData: any;
    protected mPanelTween: Phaser.Tweens.Tween;
    constructor(scene: Phaser.Scene) {
        super(scene);
        this.mScene = scene;
        this.mInitialized = false;
    }

    isShow(): boolean {
        return this.mShowing;
    }
    hide() {
        if (!this.mTweening) {
            this.showTween(false);
        } else {
            this.destroy();
        }
    }

    destroy() {
        if (this.parentContainer) {
            this.parentContainer.remove(this);
        }
        if (this.mPanelTween) {
            this.mPanelTween.stop();
            this.mPanelTween.remove();
        }
        this.mInitialized = false;
        this.mShowing = false;
        this.mWidth = 0;
        this.mHeight = 0;
        this.mPanelTween = null;
        this.scaleX = this.scaleY = 0;
        this.mScene = null;
        this.removeAll();
        this.removeAllListeners();
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
        if (!this.mTweening) {
            this.showTween(true);
        }
    }

    update(param: any) {
    }

    protected showTween(show: boolean) {
        this.mTweening = true;
        this.scaleX = show ? 0 : 1;
        this.scaleY = show ? 0 : 1;
        const scale: number = show ? 1 : 0;
        if (this.mPanelTween) {
            this.mPanelTween.stop();
        }
        this.mPanelTween = this.mScene.tweens.add({
            targets: this,
            duration: 200,
            ease: "Linear",
            props: {
                scaleX: { value: scale },
                scaleY: { value: scale },
            },
            onComplete: () => {
                this.tweenComplete(show);
            },
            onCompleteParams: [this]
        });
    }

    protected tweenComplete(show: boolean) {
        this.mTweening = false;
        this.mPanelTween.stop();
        if (!show) {
            this.mShowing = false;
        } else {
            this.mShowing = true;
        }
    }

    protected init() {
        this.mInitialized = true;
        this.show(this.mData);
    }

    protected preload() {
        if (!this.mScene) {
            Logger.getInstance().error("scene does not exist");
            return;
        }
        this.mScene.load.once(Phaser.Loader.Events.COMPLETE, this.loadComplete, this);
        this.mScene.load.start();
    }

    protected loadComplete(loader: Phaser.Loader.LoaderPlugin, totalComplete: integer, totalFailed: integer) {
        if (this.mInitialized) {
            return;
        }
        this.init();
    }
}
