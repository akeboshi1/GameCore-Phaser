import { IAbstractPanel } from "../abstractPanel";
import { Logger } from "../../utils/log";
import { WorldService } from "../../game/world.service";

export class Panel extends Phaser.GameObjects.Container implements IAbstractPanel {
    protected mShowing: boolean = false;
    protected mInitialized: boolean;
    protected mTweening: boolean = false;
    protected mScene: Phaser.Scene;
    protected mWorld: WorldService;
    protected mWidth: number = 0;
    protected mHeight: number = 0;
    protected mData: any;
    protected mPanelTween: Phaser.Tweens.Tween;
    private mTweenBoo: boolean = true;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene);
        this.mScene = scene;
        this.mWorld = world;
        this.mInitialized = false;
    }

    isShow(): boolean {
        return this.mShowing;
    }
    hide() {
        if (!this.mTweening && this.mTweenBoo) {
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
        super.destroy();
    }

    resize(wid: number, hei: number) {
    }

    show(param?: any) {
        this.mData = param;
        if (!this.mInitialized) {
            this.preload();
            return;
        }
        if (!this.mTweening && this.mTweenBoo) {
            this.showTween(true);
        } else {
            this.mShowing = true;
        }
    }

    tweenView(show: boolean) {
    }

    setTween(boo: boolean) {
        this.mTweenBoo = boo;
    }

    update(param: any) {
    }

    protected showTween(show: boolean) {
        this.mTweening = true;
        this.scaleX = show ? 0 : this.mWorld.uiScale;
        this.scaleY = show ? 0 : this.mWorld.uiScale;
        const scale: number = show ? this.mWorld.uiScale : 0;
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
            this.destroy();
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
            // Logger.getInstance().error("scene does not exist");
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
