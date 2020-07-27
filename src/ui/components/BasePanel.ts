import { WorldService } from "../../game/world.service";
import { Url } from "../../utils/resUtil";
import { Panel } from "../../../lib/rexui/lib/ui/panel/Panel";
import { PlayScene } from "../../scenes/play";
import { UIType } from "../../../lib/rexui/lib/ui/interface/baseUI/UIType";

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
    protected mReloadTimes: number = 0;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.mScene = scene;
        this.mWorld = world;
        this.mInitialized = false;
        if (world) {
            this.dpr = Math.round(world.uiRatio || 1);
            this.scale = this.mWorld.uiScale;
        }
        this.UIType = UIType.None;
    }

    public show(data?: any) {
        super.show(data);
        const play = this.mWorld.game.scene.getScene(PlayScene.name);
        if (play && this.UIType !== UIType.Scene) play.scene.pause();
    }

    public hide() {
        super.hide();
        const play = this.mWorld.game.scene.getScene(PlayScene.name);
        if (play && this.UIType !== UIType.Scene) play.scene.resume();
    }

    public destroy() {
        const play = this.mWorld.game.scene.getScene(PlayScene.name);
        if (play && this.UIType !== UIType.Scene) play.scene.resume();
        super.destroy();
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
