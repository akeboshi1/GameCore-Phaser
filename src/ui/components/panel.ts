import { IAbstractPanel } from "../abstractPanel";
import { Logger } from "../../utils/log";
import { WorldService } from "../../game/world.service";
import { Url } from "../../utils/resUtil";

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
    private mResources: Map<string, any>;
    private mReLoadResources: Map<string, any>;
    private mReloadTimes: number = 0;
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
        this.mReloadTimes = 0;
        this.mPanelTween = null;
        this.offLoad();
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
        if (this.mResources) {
            this.mResources.clear();
            this.mResources = null;
        }
        this.show(this.mData);
    }

    protected addAtlas(key: string, texture: string, data: string) {
        if (!this.mResources) {
            this.mResources = new Map();
        }
        this.mResources.set(key, {
            dpr: window.devicePixelRatio,
            texture,
            data
        });
    }

    protected preload() {
        if (!this.mScene) {
            // Logger.getInstance().error("scene does not exist");
            return;
        }
        if (this.mResources) {
            this.mResources.forEach((resource, key) => {
                this.addResources(key, resource);
            }, this);
        }
        this.startLoad();
    }

    protected loadComplete(loader: Phaser.Loader.LoaderPlugin, totalComplete: integer, totalFailed: integer) {
        if (this.mInitialized) {
            return;
        }
        if (totalFailed > 0) {
            this.reload();
            return;
        }
        this.offLoad();
        this.init();
    }

    protected loadError(file: Phaser.Loader.File) {
        if (!this.mResources) {
            return;
        }
        const resource = this.mResources.get(file.key);
        if (!resource) {
            return;
        }
        resource.dpr = 2;
        if (!this.mReLoadResources) {
            this.mReLoadResources = new Map();
        }
        this.mReLoadResources.set(file.key, resource);
    }

    protected onFileKeyComplete(key: string) {
        if (!this.mResources) {
            return;
        }
        if (this.mResources.has(key)) {
            this.mResources.delete(key);
        }
    }

    private addResources(key: string, resource: any) {
        // TODO Add IResource interface
        if (!this.scene) {
            return;
        }
        // TODO add load type
        if (resource.data) this.scene.load.atlas(key, Url.getUIRes(resource.dpr, resource.texture), Url.getUIRes(resource.dpr, resource.data));
    }

    private reload() {
        if (!this.mReLoadResources || this.mReLoadResources.size <= 0) {
            return;
        }
        if (++this.mReloadTimes > 1) {
            return;
        }
        this.mReLoadResources.forEach((resource, key) => {
            this.addResources(key, resource);
        }, this);
        this.startLoad();
    }

    private startLoad() {
        if (!this.scene) {
            return;
        }
        this.scene.load.on(Phaser.Loader.Events.FILE_KEY_COMPLETE, this.onFileKeyComplete, this);
        this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.loadComplete, this);
        this.scene.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, this.loadError, this);
        this.scene.load.start();
    }

    private offLoad() {
        if (!this.scene) {
            return;
        }
        this.scene.load.off(Phaser.Loader.Events.FILE_KEY_COMPLETE, this.onFileKeyComplete, this);
        this.scene.load.off(Phaser.Loader.Events.COMPLETE, this.loadComplete, this);
        this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, this.loadError, this);
    }
}
