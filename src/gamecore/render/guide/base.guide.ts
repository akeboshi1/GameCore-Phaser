import { SceneName } from "structure";
import { Render } from "../render";
import { MainUIScene } from "../scenes/main.ui.scene";
import { UiManager } from "../ui";
import { GuideEffect } from "./guide.effect";
import { IGuide } from "./guide.manager";

export class BaseGuide implements IGuide {
    public id: number;
    public guideID: number;
    public guideEffect: GuideEffect;
    protected scene: Phaser.Scene;
    protected uiManager: UiManager;
    protected mData: any;
    private mIsShow: boolean = false;
    constructor(protected render: Render) {
        this.scene = render.sceneManager.getSceneByName(SceneName.MAINUI_SCENE) as MainUIScene;
        this.uiManager = render.uiManager;
    }

    get data() {
        return this.mData;
    }

    public show(data?: any) {
        this.mIsShow = true;
        this.mData = data;
        this.id = data.id;
        this.guideID = data.guideID;
        if (!this.guideEffect) this.guideEffect = new GuideEffect(this.scene, this.render.uiRatio, this.render.url);
        this.render.guideManager.startGuide(this);
    }
    public end() {
        this.hide();
    }
    public hide() {
        this.mIsShow = false;
        this.render.guideManager.stopGuide();
        if (this.guideEffect) {
            this.guideEffect.destroy();
            this.guideEffect = null;
        }
        this.render.uiManager.closePanel(this.id);
    }
    /**
     * 检查是否阻挡交互
     */
    public checkInteractive(data?: any): boolean {
        return true;
    }
    public destroy() {
        this.hide();
    }

    public resize() {
    }

    public isShow(): boolean {
        return this.mIsShow;
    }

    public addExportListener(f: Function) {
    }
}
