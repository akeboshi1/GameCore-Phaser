import { Panel } from "apowophaserui";
import { Url } from "../../../utils";
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
    constructor(scene: Phaser.Scene, render: Render) {
        super(scene, render);
        this.mScene = scene;
        this.mWorld = render;
        this.mInitialized = false;
        this.render = render;
        if (render) {
            this.dpr = Math.round(render.uiRatio || 1);
            this.scale = this.mWorld.uiScale;
        }
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
}
