import { SceneName } from "structure";
import { Render } from "../render";
import { MainUIScene } from "../scenes/main.ui.scene";
import { UiManager } from "../ui";
import { GuideEffect } from "./guide.effect";
import { IGuide } from "./guide.manager";

export class BaseGuide implements IGuide {
    public id: number;
    public guideEffect: GuideEffect;
    protected scene: Phaser.Scene;
    protected uiManager: UiManager;
    private mIsShow: boolean = false;
    constructor(id: number, protected render: Render) {
        this.scene = render.sceneManager.getSceneByName(SceneName.MAINUI_SCENE) as MainUIScene;
        this.uiManager = render.uiManager;
    }
    public show(data?: any) {
        this.mIsShow = true;
        this.id = data.id;
        if (!this.guideEffect) this.guideEffect = new GuideEffect(this.scene);
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

    public isShow(): boolean {
        return this.mIsShow;
    }

    public addExportListener(f: Function) {
    }
}
