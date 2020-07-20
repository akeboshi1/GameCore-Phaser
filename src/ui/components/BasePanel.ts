import { WorldService } from "../../game/world.service";
import { Url } from "../../utils/resUtil";
import { Panel } from "@apowo/phaserui";
export class BasePanel extends Panel {
    protected mInitialized: boolean;
    protected mTweening: boolean = false;
    protected mScene: Phaser.Scene;
    protected mWorld: WorldService;
    protected mWidth: number = 0;
    protected mHeight: number = 0;
    protected mPanelTween: Phaser.Tweens.Tween;
    protected dpr: number;
    protected mResources: Map<string, any>;
    protected mReLoadResources: Map<string, any>;
    protected mModuleName: string;
    constructor(scene: Phaser.Scene, world: WorldService, moduleName?: string) {
        super(scene, world);
        this.mScene = scene;
        this.mWorld = world;
        this.mModuleName = moduleName;
        this.mInitialized = false;
        if (world) {
            this.dpr = Math.round(world.uiRatio || 1);
            this.scale = this.mWorld.uiScale;
        }
    }

    public updateUIState(ui: any) {

    }

    protected addResources(key: string, resource: any) {
        super.addResources(key, resource);
        if (resource.type) {
            if (this.scene.load[resource.type]) {
                this.scene.load[resource.type](key, Url.getUIRes(resource.dpr, resource.texture, this.mModuleName), Url.getUIRes(resource.dpr, resource.data, this.mModuleName));
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
