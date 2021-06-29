import { Panel } from "apowophaserui";
import { MainUIScene } from "../../scenes/main.ui.scene";
import { UiUtils, Url } from "utils";
import { Logger } from "structure";
import { Render } from "../../render";
import { Export } from "webworker-rpc";

export class BaseBatchPanel extends Panel {
    protected mInitialized: boolean;
    protected mTweening: boolean = false;
    protected mScene: Phaser.Scene;
    protected mWidth: number = 0;
    protected mHeight: number = 0;
    protected mPanelTween: Phaser.Tweens.Tween;
    protected dpr: number;
    protected mResources: Map<string, any>;
    protected mReLoadResources: Map<string, any>;
    protected mReloadTimes: number = 0;
    protected render: Render;
    protected key: string = "";
    protected uiLayer: string = MainUIScene.LAYER_UI;
    protected exported: boolean = false;
    protected exportListeners: Function[] = [];
    protected mSynchronize: boolean = false;
    constructor(scene: Phaser.Scene, render: Render) {
        super(scene, render);
        if (!scene.sys) Logger.getInstance().error("no scene system");
        this.mScene = scene;
        this.mWorld = render;
        this.mInitialized = false;
        this.render = render;
        if (render) {
            this.dpr = Math.round(render.uiRatio || UiUtils.baseDpr);
            this.scale = this.mWorld.uiScale;
        }
    }
    @Export()
    get initialized(): boolean {
        return this.mInitialized;
    }
    @Export()
    resize(wid?: number, hei?: number) {
        super.resize(wid, hei);
        this.setSize(wid, hei);
    }
    @Export()
    startLoad() {
        if (!this.scene) {
            return;
        }
        this.scene.load.on(Phaser.Loader.Events.FILE_COMPLETE, this.onFileKeyComplete, this);
        this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.loadComplete, this);
        this.scene.load.start();
    }
    @Export()
    show(param?: any) {
        this.mSynchronize = false;
        super.show(param);
        if (!this.mInitialized) return;
        if (!this.mSynchronize) this.onShow();
    }
    @Export()
    public hide() {
        this.onHide();
        if (this.soundGroup && this.soundGroup.close)
            this.playSound(this.soundGroup.close);
        if (!this.mTweening && this.mTweenBoo) {
            this.showTween(false);
        } else {
            this.destroy();
        }
    }
    @Export()
    public destroy() {
        if (this.render && this.render.hasOwnProperty(this.key)) delete this.render[this.key];
        this.exportListeners.length = 0;
        super.destroy();
    }
    @Export()
    public addExportListener(f: Function) {
        if (this.exported) {
            f();
            return;
        }
        this.exportListeners.push(f);
    }
    @Export()
    protected preload() {
        this.mPreLoad = true;
        if (!this.scene) {
            return;
        }
        let index = 0;
        if (this.mResources) {
            this.mResources.forEach((resource, key) => {
                // if (!this.scene.textures.exists(key)) {
                //     index++;
                //     this.addResources(key, resource);
                // }
                if (!this.cacheExists(resource.type, key)) {
                    index++;
                    this.addResources(key, resource);
                }
            }, this);
        }
        if (index > 0) {
            this.startLoad();
        } else {
            if (this.mResources) this.mResources.clear();
            this.mPreLoad = false;
            this.init();
            this.mSynchronize = true;
        }
    }
    @Export()
    protected init() {
        // 异步过程中存在某些ui在销毁之前初始化完成
        if (this.mScene && this.mScene.sys && this.mScene.sys.displayList) {
            (<MainUIScene>this.mScene).layerManager.addToLayer(this.uiLayer, this);
            super.init();
            this.setLinear(this.key);
            Logger.getInstance().debug("init========", this.key);
            this.__exportProperty();
            this.onInitialized();
        }
    }
    @Export()
    protected setLinear(key: string) {
        if (!key) {
            return;
        }
        const frame = this.scene.textures.getFrame(key, "__BASE");
        if (frame) frame.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
    @Export()
    protected addResources(key: string, resource: any) {
        const resType = resource.type;
        if (resType) {
            if (this.scene.load[resType]) {
                this.scene.load[resource.type](key, resType !== "video" ? Url.getUIRes(resource.dpr, resource.texture) : Url.getNormalUIRes(resource.texture),
                    resource.data ? (resType !== "video" ? Url.getUIRes(resource.dpr, resource.data) : Url.getNormalUIRes(resource.data)) : undefined);
            }
        }
        super.addResources(key, resource);
    }
    @Export()
    protected cacheExists(type: string, key: string) {
        if (type === "image" || type === "atlas" || type === "texture") {
            return this.scene.textures.exists(key);
        } else if (type === "json" || type === "video") {
            return this.scene.cache[type].exists(key);
        }
        return false;
    }
    @Export()
    protected get scaleWidth() {
        const width = this.scene.cameras.main.width / this.scale;
        return width;
    }
    @Export()
    protected get scaleHeight() {
        const height = this.scene.cameras.main.height / this.scale;
        return height;
    }
    @Export()
    protected get cameraWidth() {
        const width = this.scene.cameras.main.width;
        return width;
    }
    @Export()
    protected get cameraHeight() {
        const height = this.scene.cameras.main.height;
        return height;
    }
    @Export()
    protected __exportProperty() {
        if (!this.render) {
            return;
        }
        return this.render.exportProperty(this, this.render, this.key).onceReady(this.exportComplete.bind(this));
    }
    @Export()
    protected exportComplete() {
        this.exported = true;
        for (const listener of this.exportListeners) {
            listener();
        }
        this.exportListeners.length = 0;
    }
    @Export()
    protected onShow() {

    }
    @Export()
    protected onHide() {
        this.render.uiManager.hideBatchPanel(this);
    }
    @Export()
    protected onInitialized() {

    }
}
