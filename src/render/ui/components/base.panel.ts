import { Panel } from "apowophaserui";
import { MainUIScene } from "src/render/scenes/main.ui.scene";
import { EventType } from "structure";
import { Logger, Url } from "utils";
import { Render } from "../../render";
export class BasePanel extends Panel {
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
    private exported: boolean = false;
    private exportListeners: Function[] = [];
    constructor(scene: Phaser.Scene, render: Render) {
        super(scene, render);
        if (!scene.sys) Logger.getInstance().error("no scene system");
        this.mScene = scene;
        this.mWorld = render;
        this.mInitialized = false;
        this.render = render;
        if (render) {
            this.dpr = Math.round(render.uiRatio || 1);
            this.scale = this.mWorld.uiScale;
        }
    }

    get initialized(): boolean {
        return this.mInitialized;
    }

    public destroy() {
        if (this.render && this.render.hasOwnProperty(this.key)) delete this.render[this.key];
        this.exportListeners.length = 0;
        super.destroy();
    }

    public addExportListener(f: Function) {
        if (this.exported) {
            f();
            return;
        }

        this.exportListeners.push(f);
    }

    protected init() {
        super.init();
        (<MainUIScene>this.mScene).layerManager.addToLayer("uiLayer", this);
        this.setLinear(this.key);
        Logger.getInstance().log("init========", this.key);
        this.__exportProperty();
    }

    protected setLinear(key: string) {
        if (!key) {
            return;
        }
        const frame = this.scene.textures.getFrame(key, "__BASE");
        if (frame) frame.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    }

    protected addResources(key: string, resource: any) {
        super.addResources(key, resource);
        if (resource.type) {
            if (this.scene.load[resource.type]) {
                this.scene.load[resource.type](key, Url.getUIRes(resource.dpr, resource.texture), Url.getUIRes(resource.dpr, resource.data));
            }
        }
    }

    protected get scaleWidth() {
        const width = this.scene.cameras.main.width / this.scale;
        return width;
    }
    protected get scaleHeight() {
        const height = this.scene.cameras.main.height / this.scale;
        return height;
    }
    protected get cameraWidth() {
        const width = this.scene.cameras.main.width;
        return width;
    }
    protected get cameraHeight() {
        const height = this.scene.cameras.main.height;
        return height;
    }

    protected __exportProperty() {
        if (!this.render) {
            return;
        }
        return this.render.exportProperty(this, this.render, this.key).onceReady(this.exportComplete.bind(this));
    }

    protected exportComplete() {
        this.exported = true;
        this.render.renderEmitter(EventType.PANEL_INIT, this.key);
        for (const listener of this.exportListeners) {
            listener();
        }
        this.exportListeners.length = 0;
    }
}
