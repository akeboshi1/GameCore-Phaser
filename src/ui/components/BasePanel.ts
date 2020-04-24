import { WorldService } from "../../game/world.service";
import { Url } from "../../utils/resUtil";
import { Panel } from "../../../lib/rexui/lib/ui/panel/Panel";

export class BasePanel extends Panel {
    protected mInitialized: boolean;
    protected mTweening: boolean = false;
    protected mScene: Phaser.Scene;
    protected mWorld: WorldService;
    protected mWidth: number = 0;
    protected mHeight: number = 0;
    protected mData: any;
    protected mPanelTween: Phaser.Tweens.Tween;
    protected dpr: number;
    protected mResources: Map<string, any>;
    protected mReLoadResources: Map<string, any>;
    protected mReloadTimes: number = 0;
    protected mTweenBoo: boolean = true;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.mScene = scene;
        this.mWorld = world;
        this.mInitialized = false;
        if (world) {
            this.dpr = Math.round(world.uiRatio || 1);
            this.scale = this.mWorld.uiScaleNew;
        }
        this.setInteractive();
    }

    protected addResources(key: string, resource: any) {
        super.addResources(key, resource);
        if (resource.data) this.scene.load.atlas(key, Url.getUIRes(resource.dpr, resource.texture), Url.getUIRes(resource.dpr, resource.data));
    }
}
